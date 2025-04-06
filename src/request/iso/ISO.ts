import { Config } from "@/types/Config";
import { SendRequest } from "../SendRequest";
import { CountryData, DivisionData } from "@/types/CountryData";

export class ISO extends SendRequest
{

    public static async getAllCountryCode(config: Config)
    {
        try
        {
            const url = `http://api.geonames.org/countryInfoJSON`
            const username = config.geonamesUsername
            const params = new URLSearchParams();
            params.append('username', username);
            const headers = new Headers({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            });

            const response = await this.sendGet(url, params, headers);

            if (!response.ok)
            {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json() as CountryData;

            return data
        } catch (error)
        {
            console.error("Error fetching country codes:", error);
            throw error; // Re-throw the error for further handling if needed
        }

    }

    public static async getDivisionCode(config: Config, geonameId: number)
    {
        try
        {
            const url = `http://api.geonames.org/childrenJSON`
            const username = config.geonamesUsername
            const params = new URLSearchParams();

            params.append('username', username);
            params.append('geonameId', geonameId.toString());

            const headers = new Headers({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            });

            const response = await this.sendGet(url, params, headers);

            if (!response.ok)
            {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json() as DivisionData;

            return data


        } catch (error)
        {
            console.error("Error fetching division codes:", error);
            throw error; // Re-throw the error for further handling if needed
        }
    }

}