import { Application } from "express";
import { Routes } from "../Routes";
import { Request } from "express";
import { CommonResponse } from "../../types/CommonResponse";
import { ReturnCode } from "../../utils/ReturnCode";
import { SQSelect } from "../../SQ/SQSelect";
import { SQInsert } from "../../SQ/SQInsert";
import { Request_ASN } from "../../request/asn/Request_ASN";
import fs from 'fs'
import path from 'path'

interface Lock
{
    asn: string;
    refreshPrefix: boolean;
    autoGenerateFeed: boolean;
    rebuildFeed: boolean;
}

export class Route_ASN extends Routes
{
    public static locks: Map<string, Lock> = new Map();
    static routeName = "/asn";
    public static setRoute(app: Application): void
    {
        app.post(`${this.routeName}/getasn`, (req, res) => this.middleware(req, res, this.getASN));
        app.post(`${this.routeName}/addasn`, (req, res) => this.middleware(req, res, this.addASN));
        app.post(`${this.routeName}/rebuildfeed`, (req, res) => this.middleware(req, res, this.rebuildFeed));
        app.post(`${this.routeName}/refreshasnprefix`, (req, res) => this.middleware(req, res, this.refreshASNPrefix));
        app.post(`${this.routeName}/checklock`, (req, res) => this.middleware(req, res, this.checkLock));


    }
    private static getASN = async (req: Request): Promise<CommonResponse<ASNData[]>> =>
    {

        const userdata = req.session.user;

        if (!userdata) return {
            code: ReturnCode('NotLoggedIn'),
            message: "Not logged in",
        }

        const userid = userdata.id;

        const asnResult = await SQSelect.asn.getASNByUserId(userid);

        if (asnResult.error) return {
            code: ReturnCode('ISE'),
            message: "Database error",
        }

        if (!asnResult.data) return {
            code: ReturnCode('NotFound'),
            message: "No data",
        }

        const asnData: ASNData[] = [];

        for (const asn of asnResult.data)
        {
            const prefixResult = await SQSelect.asn.getPrefixByASNId(asn.id);

            if (prefixResult.error) return {
                code: ReturnCode('ISE'),
                message: "Database error",
            }

            if (!prefixResult.data) return {
                code: ReturnCode('NotFound'),
                message: "No data",
            }
            asnData.push({
                asn: {
                    asName: asn.as_name,
                    asNumber: asn.as_number,
                    prefixCount: prefixResult.data.length,
                    prefixCountWithGeo: prefixResult.data.filter((prefix) => prefix.country_id).length,
                    status: asn.is_active,
                }
            });
        }

        return {
            code: ReturnCode('OPSuccess'),
            message: "ASN found",
            data: asnData,
        }
    }
    private static addASN = async (req: Request): Promise<CommonResponse<null>> =>
    {

        const body = req.body as { asn: string };
        const userdata = req.session.user;


        if (!userdata) return {
            code: ReturnCode('NotLoggedIn'),
            message: "Not logged in",
        }

        const userid = userdata.id;
        let asn = body.asn;
        asn = body.asn.replace(/\D+/g, "");

        if (!asn) return {
            code: ReturnCode('MissingRequiredField'),
            message: "ASN is required",
        }



        const asnResult = await SQSelect.asn.getASNByASNumber(asn);

        if (asnResult.error) return {
            code: ReturnCode('ISE'),
            message: "Database error",
        }

        if (asnResult.data?.length) return {
            code: ReturnCode('DataExists'),
            message: "ASN already exists",
        }



        const prefixesFromRipe = await Request_ASN.getPrefixByASNFromRipe(asn, 10);

        if (!prefixesFromRipe) return {
            code: ReturnCode('NotFound'),
            message: "ASN Not Found",
        }

        const insertResult = await SQInsert.asn.insertNewASN(asn, userid);

        if (insertResult.error) return {
            code: ReturnCode('ISE'),
            message: "Database error",
        }

        if (!insertResult.data) return {
            code: ReturnCode('NotFound'),
            message: "No data",
        }

        const prefix = prefixesFromRipe.data.prefixes;

        for (const prefixData of prefix)
        {
            const insertPrefixResult = await SQInsert.prefix.insertNewPrefix(insertResult.data.id, prefixData.prefix);

            if (insertPrefixResult.error) return {
                code: ReturnCode('ISE'),
                message: "Database error",
            }
        }

        return {
            code: ReturnCode('OPSuccess'),
            message: "ASN created",
        }
    }
    private static rebuildFeed = async (req: Request): Promise<CommonResponse<null>> =>
    {
        const userdata = req.session.user;

        if (!userdata) return {
            code: ReturnCode('NotLoggedIn'),
            message: "Not logged in",
        }

        const body = req.body as { asn: string };

        if (!body.asn) return {
            code: ReturnCode('MissingRequiredField'),
            message: "ASN is required",
        }

        const locked = Route_ASN.acquireLock(body.asn, 'rebuildFeed');

        if (!locked)
        {
            return {
                code: ReturnCode('OPFailed'),
                message: "Feed rebuild is already in progress",
            };
        }

        try
        {

            const userid = userdata.id;

            const asnResult = await SQSelect.asn.validateASNUser(body.asn, userid);

            if (asnResult.error) return {
                code: ReturnCode('ISE'),
                message: "Database error",
            }

            if (!asnResult.data) return {
                code: ReturnCode('NotFound'),
                message: "ASN not found",
            }

            const prefixResult = await SQSelect.geolocation.getAllPrefixAndLocationByASNId(asnResult.data.id);
            if (prefixResult.error) return {
                code: ReturnCode('ISE'),
                message: "Database error",
            }

            if (!prefixResult.data) return {
                code: ReturnCode('NotFound'),
                message: "No data",
            }
            const lines: string[] = []
            const geofeedPath = path.join(process.cwd(), `/data/geofeed/${asnResult.data.as_number}/geofeed.csv`);
            prefixResult.data.forEach(async (prefix) =>
            {
                if (!prefix.country) return

                const ipPrefix = prefix.prefix // e.g., "203.0.113.0/24"
                const country = prefix.country.alpha_2_code || ''
                const region = prefix.subdivision ? `${prefix.country.alpha_2_code}-${prefix.subdivision.code_3166_2}` : ''
                const city = prefix.city?.name || ''
                const postal = prefix.zipcode?.name || ''

                const clean = (value: string) =>
                    value.replace(/,/g, '').replace(/\r?\n/g, '')

                const row = [
                    ipPrefix,
                    clean(country),
                    clean(region),
                    clean(city),
                    clean(postal),
                ].join(',')

                lines.push(row)

            })

            // 确保目录存在
            fs.mkdirSync(path.dirname(geofeedPath), { recursive: true })

            // 写入 CSV 文件（无标题）
            fs.writeFileSync(geofeedPath, lines.join('\n'), 'utf8')



            return {
                code: ReturnCode('OPSuccess'),
                message: "Feed rebuilt",
            }
        } finally
        {
            Route_ASN.releaseLock(body.asn, 'rebuildFeed');
        }

    }
    private static refreshASNPrefix = async (req: Request): Promise<CommonResponse<null>> =>
    {
        const userdata = req.session.user;

        if (!userdata) return {
            code: ReturnCode('NotLoggedIn'),
            message: "Not logged in",
        }

        const body = req.body as { asn: string };

        if (!body.asn) return {
            code: ReturnCode('MissingRequiredField'),
            message: "ASN is required",
        }

        const locked = Route_ASN.acquireLock(body.asn, 'refreshPrefix');
        if (!locked)
        {
            return {
                code: ReturnCode('OPFailed'),
                message: "ASN prefix refresh is already in progress",
            };
        }

        try
        {
            const userid = userdata.id;

            const asnResult = await SQSelect.asn.validateASNUser(body.asn, userid);

            if (asnResult.error) return {
                code: ReturnCode('ISE'),
                message: "Database error",
            }

            if (!asnResult.data) return {
                code: ReturnCode('NotFound'),
                message: "ASN not found",
            }

            const prefixesFromRipe = await Request_ASN.getPrefixByASNFromRipe(body.asn, 10);
            if (!prefixesFromRipe) return {
                code: ReturnCode('NotFound'),
                message: "ASN Not Found",
            }
            const prefix = prefixesFromRipe.data.prefixes;

            for (const prefixData of prefix)
            {
                const insertPrefixResult = await SQInsert.prefix.insertNewPrefix(asnResult.data.id, prefixData.prefix);

                if (insertPrefixResult.error) return {
                    code: ReturnCode('ISE'),
                    message: "Database error",
                }
            }

            return {
                code: ReturnCode('OPSuccess'),
                message: "ASN created",
            }
        } finally
        {
            Route_ASN.releaseLock(body.asn, 'refreshPrefix');
        }


    }

    private static checkLock = async (req: Request): Promise<CommonResponse<Lock>> =>
    {
        const body = req.body as { asn: string };
        if (!body.asn) return {
            code: ReturnCode('MissingRequiredField'),
            message: "ASN is required",
        }
        const lock = this.locks.get(body.asn);

        return {
            code: ReturnCode('OPSuccess'),
            message: "Lock status retrieved",
            data: lock || {
                asn: body.asn,
                refreshPrefix: false,
                autoGenerateFeed: false,
                rebuildFeed: false,
            }
        }
    }


    public static acquireLock(asn: string, type: keyof Omit<Lock, 'asn' | 'timestamp'>): boolean
    {
        let lock = this.locks.get(asn);

        if (!lock)
        {
            lock = {
                asn,
                refreshPrefix: false,
                autoGenerateFeed: false,
                rebuildFeed: false,
            };
            this.locks.set(asn, lock);
        }

        if (lock[type]) return false; // 已被锁定
        lock[type] = true;
        return true;
    }
    public static releaseLock(asn: string, type: keyof Omit<Lock, 'asn' | 'timestamp'>)
    {
        const lock = this.locks.get(asn);
        if (lock)
        {
            lock[type] = false;
        }
    }
}