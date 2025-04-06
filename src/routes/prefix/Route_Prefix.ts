import { Application } from "express";
import { Routes } from "../Routes";
import { Request } from "express";
import { CommonResponse } from "@/types/CommonResponse";
import { ReturnCode } from "@/utils/ReturnCode";
import { PrefixData } from "@/types/Prefix";
import { SQSelect } from "@/SQ/SQSelect";

export class Route_Prefix extends Routes
{
    static routeName = "/prefix";
    public static setRoute(app: Application): void
    {
        app.post(`${this.routeName}/getprefix`, (req, res) => this.middleware(req, res, this.getPrefix));
        app.post(`${this.routeName}/getprefixbyid`, (req, res) => this.middleware(req, res, this.getPrefixById));

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
                        name: prefix.subdivision.name ?? "Unknown", // Fallback if name is null
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