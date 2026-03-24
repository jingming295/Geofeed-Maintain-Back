import cron from 'node-cron';
import { ScheduledTask } from 'node-cron';
import { SQSelect } from '../SQ/SQSelect';
import { Request_ASN } from '../request/asn/Request_ASN';

export class SelfCheckPrefix
{
    private static _scheduler: ScheduledTask | null = null;

    /**
     * Start the daily 00:00 self-check task
     */
    public static start(): void
    {
        if (this._scheduler)
        {
            console.warn('Self-check task is already running.');
            return;
        }

        this._scheduler = cron.schedule('0 0 0 * * *', () =>
        {
            this.executeInternalLogic().catch(err =>
            {
                console.error('Critical error during self-check execution:', err);
            });
        }, {
            timezone: "Asia/Shanghai"
        });

        console.log('>>> Daily 00:00 self-check task started.');
    }

    /**
     * Stop and destroy the self-check task
     */
    public static stop(): void
    {
        if (this._scheduler)
        {
            this._scheduler.stop();
            this._scheduler.destroy(); // Properly release resources
            this._scheduler = null;
            console.log('<<< Daily self-check task stopped.');
        }
    }

    /**
     * Internal logic for checking and cleaning up prefixes
     */
    private static async executeInternalLogic(): Promise<void>
    {
        console.log(`[${new Date().toISOString()}] Starting self-check logic...`);

        const asn = await SQSelect.asn.getAllASN();

        if (!asn.data)
        {
            console.error('Failed to fetch ASN data for self-check');
            return;
        }

        for (const asnItem of asn.data)
        {
            const prefixResult = await SQSelect.asn.getPrefixByASNId(asnItem.id);

            if (prefixResult.error || !prefixResult.data)
            {
                console.error(`Failed to fetch prefixes for ASN ${asnItem.as_number}: ${prefixResult.message}`);
                continue;
            }

            const prefixesFromRipe = await Request_ASN.getPrefixByASNFromRipe(asnItem.as_number, 10);

            if (!prefixesFromRipe || !prefixesFromRipe.data || !prefixesFromRipe.data.prefixes)
            {
                console.error(`Failed to fetch prefixes from RIPE for ASN ${asnItem.as_number}`);
                continue;
            }

            const ripePrefixes = prefixesFromRipe.data.prefixes;

            // Iterate through local prefixes and check against RIPE data
            prefixResult.data.forEach((p) =>
            {
                const exists = ripePrefixes.some((rf) => rf.prefix === p.prefix);

                if (!exists)
                {
                    p.destroy()
                        .then(() =>
                        {
                            console.log(`Successfully deleted obsolete prefix ${p.prefix} for ASN ${asnItem.as_number}`);
                        })
                        .catch((err) =>
                        {
                            console.error(`Failed to delete prefix ${p.prefix}:`, err);
                        });
                }
            });

            console.log(`Completed self-check for ASN ${asnItem.as_number}`);
        }

        console.log(`[${new Date().toISOString()}] All ASN self-checks completed.`);
    }
}