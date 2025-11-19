import { SendRequest } from "../SendRequest";

export class Request_IPAPI extends SendRequest
{

    public static async getIPLocation(ip: string)
    {
        try
        {
            const url = `https://ipapi.co/${ip}/json/`

            console.log(url)

            const headers = new Headers({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            });

            const param = new URLSearchParams();

            const response = await this.sendGet(url, param, headers);

            if (!response.ok)
            {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json() as IPAPICO;
            return data
        } catch (error)
        {
            console.error("Error fetching IP location:", error);
        }

    }

}