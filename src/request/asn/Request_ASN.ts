import { AnnouncedPrefixesFromRile } from "@/types/ASN";
import { SendRequest } from "../SendRequest";

export class Request_ASN extends SendRequest
{

    public static async getPrefixByASNFromRipe(asn: string, min_peers_seeing: number, starttime: string = '2000-08-01T00:00:00')
    {
        try
        {
            const url = `https://stat.ripe.net/data/announced-prefixes/data.json`

            const params = new URLSearchParams();

            params.append('resource', asn);

            params.append('min_peers_seeing', min_peers_seeing.toString());

            params.append('starttime', starttime);

            const headers = new Headers({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            });

            const response = await this.sendGet(url, params, headers);

            if (!response.ok)
            {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json() as AnnouncedPrefixesFromRile;

            return data
        } catch (error)
        {
            console.error("Error fetching country codes:", error);
            throw error; // Re-throw the error for further handling if needed
        }

    }

}