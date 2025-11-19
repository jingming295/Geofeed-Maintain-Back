import { Application } from "express";
import { Routes } from "../Routes";
import { Request } from "express";
import { CommonResponse } from "../../types/CommonResponse";
import { ReturnCode } from "../../utils/ReturnCode";
import { PrefixData } from "../../types/Prefix";
import { SQSelect } from "../../SQ/SQSelect";
import { SQUpdate } from "../../SQ/SQUpdate";
import { IPGeo } from "../../utils/IPGeo";
import { SQInsert } from "../../SQ/SQInsert";
import { Route_ASN } from "../asn/Route_ASN";

export class Route_Prefix extends Routes
{
    static routeName = "/prefix";
    public static setRoute(app: Application): void
    {
        app.post(`${this.routeName}/getprefix`, (req, res) => this.middleware(req, res, this.getPrefix));
        app.post(`${this.routeName}/getprefixbyid`, (req, res) => this.middleware(req, res, this.getPrefixById));
        app.post(`${this.routeName}/autogengeolocation`, (req, res) => this.middleware(req, res, this.autoGenGeolocation));

    }

    private static delay(ms: number)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    private static autoGenGeolocation = async (req: Request): Promise<CommonResponse<null>> =>
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

        const locked = Route_ASN.acquireLock(body.asn, 'autoGenerateFeed');

        if (!locked) return {
            code: ReturnCode('OPFailed'),
            message: "Auto generation already in progress for this ASN",
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

            const prefixResult = await SQSelect.prefix.getAllPrefixesWhereNoCountry(asnResult.data.id);

            if (prefixResult.error) return {
                code: ReturnCode('ISE'),
                message: "Database error",
            }

            if (!prefixResult.data) return {
                code: ReturnCode('NotFound'),
                message: "No prefixes found",
            }

            const country = await SQSelect.geolocation.getCountryList();
            const subdivision = await SQSelect.geolocation.getSubdivisionList();

            for (const prefix of prefixResult.data)
            {

                await this.delay(1000);

                const ipOnly = prefix.prefix.split("/")[0];


                const geoData = await IPGeo.lookupIPGeoFromMaxmind(ipOnly);

                if (!geoData) continue;

                const countryAlplha2 = geoData.country?.iso_code;
                const subdivisionCode = geoData.subdivisions?.[0]?.iso_code;
                const city = geoData.city?.names?.en;

                if (!countryAlplha2) continue;

                const countryID = country.data?.find(c => c.alpha_2_code === countryAlplha2)?.id;

                let subdivisionID: number | null = null;

                if (subdivisionCode && countryID)
                {
                    subdivisionID = subdivision.data?.find(s => s.code_3166_2 === subdivisionCode && s.country_id === countryID)?.id || null;
                }

                if (countryID)
                {
                    await SQUpdate.prefix.updatePrefixCountry(prefix.id, countryID);
                    if (subdivisionID)
                    {
                        await SQUpdate.prefix.updatePrefixSubdivitionByIdAndCountryID(prefix.id, subdivisionID, countryID);
                    }

                    if (city)
                    {
                        const cityResult = await SQSelect.geolocation.checkCityNameExist(city, countryID, subdivisionID);
                        if (cityResult.error) continue;
                        if (cityResult.data)
                        {
                            await SQUpdate.prefix.updatePrefixCityID(prefix.id, cityResult.data.id);
                        } else
                        {
                            const insertCityResult = await SQInsert.location.insertNewCity(city, countryID, subdivisionID);
                            if (insertCityResult.error) continue;
                            if (insertCityResult.data)
                                await SQUpdate.prefix.updatePrefixCityID(prefix.id, insertCityResult.data.id);

                        }
                    }

                    console.log(`Updated prefix ${prefix.prefix} with country ${countryAlplha2}${subdivisionCode ? `, subdivision ${subdivisionCode}` : ''}${city ? `, city ${city}` : ''}`);
                }
            }


            return {
                code: ReturnCode('OPSuccess'),
                message: "Auto gen started",
            }
        } finally
        {
            Route_ASN.releaseLock(body.asn, 'autoGenerateFeed');
        }



    }

    private static getPrefix = async (req: Request): Promise<CommonResponse<PrefixData[]>> =>
    {

        const body = req.body as { asn: string };
        const { asn } = body;

        if (!asn) return {
            code: ReturnCode('MissingRequiredField'),
            message: "ASN is required",
        }

        const userdata = req.session.user;

        if (!userdata) return {
            code: ReturnCode('NotLoggedIn'),
            message: "Not logged in",
        }

        const userid = userdata.id;


        const asnResult = await SQSelect.asn.validateASNUser(asn, userid);

        if (asnResult.error) return {
            code: ReturnCode('ISE'),
            message: "Database error",
        }

        if (!asnResult.data) return {
            code: ReturnCode('NotFound'),
            message: "ASN not found",
        }


        const prefixData: PrefixData[] = [];



        const asnId = asnResult.data.id;

        const prefixResult = await SQSelect.prefix.getPrefixByASNId(asnId);

        if (prefixResult.error) return {
            code: ReturnCode('ISE'),
            message: "Database error",
        }

        if (!prefixResult.data) return {
            code: ReturnCode('NotFound'),
            message: "Prefix not found",
        }

        for (const prefix of prefixResult.data)
        {

            const subdivisionName = (prefix.subdivision && prefix.country) ? `${prefix.country.alpha_2_code}-${prefix.subdivision.code_3166_2}` : 'Unknown'
            prefixData.push({
                id: prefix.id,
                Prefix: prefix.prefix,
                Country: prefix.country
                    ? {
                        id: prefix.country.id,
                        name: prefix.country.name ?? "Unknown", // Fallback if name is null
                    }
                    : null, // If country is null, set it as null
                SubDivisions: prefix.subdivision
                    ? {
                        id: prefix.subdivision.id,
                        name: subdivisionName
                    }
                    : null, // If subdivision is null, set it as null
                City: prefix.city
                    ? {
                        id: prefix.city.id,
                        name: prefix.city.name ?? "Unknown", // Fallback if name is null
                    }
                    : null, // If city is null, set it as null
                ZipCode: prefix.zipcode
                    ? {
                        id: prefix.zipcode.id,
                        name: prefix.zipcode.name ?? "Unknown", // Fallback if name is null
                    }
                    : null, // If zipcode is null, set it as null
            });
        }



        return {
            code: ReturnCode('OPSuccess'),
            message: "ASN found",
            data: prefixData
        }
    }


    private static getPrefixById = async (req: Request): Promise<CommonResponse<PrefixData>> =>
    {

        const body = req.body as { id: number };
        const { id } = body;

        if (!id) return {
            code: ReturnCode('MissingRequiredField'),
            message: "ID is required",
        }

        const userdata = req.session.user;

        if (!userdata) return {
            code: ReturnCode('NotLoggedIn'),
            message: "Not logged in",
        }

        const userid = userdata.id;


        const prefixResult = await SQSelect.prefix.getPrefixById(id, userid);

        if (prefixResult.error) return {
            code: ReturnCode('ISE'),
            message: "Database error",
        }

        if (!prefixResult.data) return {
            code: ReturnCode('NotFound'),
            message: "Prefix not found",
        }


        const prefixData: PrefixData = {
            id: prefixResult.data.id,
            Prefix: prefixResult.data.prefix,
            Country: prefixResult.data.country
                ? {
                    id: prefixResult.data.country.id,
                    name: prefixResult.data.country.name ?? "Unknown", // Fallback if name is null
                }
                : null, // If country is null, set it as null
            SubDivisions: prefixResult.data.subdivision
                ? {
                    id: prefixResult.data.subdivision.id,
                    name: prefixResult.data.subdivision.name ?? "Unknown", // Fallback if name is null
                }
                : null, // If subdivision is null, set it as null
            City: prefixResult.data.city
                ? {
                    id: prefixResult.data.city.id,
                    name: prefixResult.data.city.name ?? "Unknown", // Fallback if name is null
                }
                : null, // If city is null, set it as null
            ZipCode: prefixResult.data.zipcode
                ? {
                    id: prefixResult.data.zipcode.id,
                    name: prefixResult.data.zipcode.name ?? "Unknown", // Fallback if name is null
                }
                : null, // If zipcode is null, set it as null
        };


        return {
            code: ReturnCode('OPSuccess'),
            message: "ASN found",
            data: prefixData
        }
    }




}