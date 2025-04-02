import { Application } from "express";
import { Routes } from "../Routes";
import { ASNData } from "@/types/ASN";
import { Request } from "express";
import { CommonResponse } from "@/types/CommonResponse";
import { ReturnCode } from "@/utils/ReturnCode";
import { SQSelect } from "@/SQ/SQSelect";
import { SQInsert } from "@/SQ/SQInsert";
import { Request_ASN } from "@/request/asn/Request_ASN";

export class Route_ASN extends Routes
{
    static routeName = "/asn";
    public static setRoute(app: Application): void
    {
        app.post(`${this.routeName}/getasn`, (req, res) => this.middleware(req, res, this.getASN));
        app.post(`${this.routeName}/addasn`, (req, res) => this.middleware(req, res, this.addASN));

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
                    prefixCountWithGeo: prefixResult.data.filter((prefix) => prefix.country).length,
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
        const asn = body.asn;

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

        const insertResult = await SQInsert.asn.insertNewASN(asn, userid);

        if (insertResult.error) return {
            code: ReturnCode('ISE'),
            message: "Database error",
        }

        if (!insertResult.data) return {
            code: ReturnCode('NotFound'),
            message: "No data",
        }

        const prefixesFromRipe = await Request_ASN.getPrefixByASNFromRipe(asn, 10);

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
}