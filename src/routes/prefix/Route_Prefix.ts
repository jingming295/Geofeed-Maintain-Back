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
                Country: prefix.country?.name || null,
                SubDivisions: prefix.subdivision?.name || null,
                City: prefix.city?.name || null,
                ZipCode: prefix.zipcode?.name || null,
            })
        }


        return {
            code: ReturnCode('OPSuccess'),
            message: "ASN found",
            data: prefixData
        }
    }


}