import { CommonResponse } from "@/types/CommonResponse";
import { Request, Response } from "express";
import { ReturnCode } from "../utils/ReturnCode";

export class Routes
{
    protected static buildResponse<T>(code: number, message: string, data?: T): CommonResponse<T> 
    {
        return { code, message, data };
    }

    protected static async middleware<T>(req: Request, res: Response, func: (req: Request) => Promise<CommonResponse<T>>): Promise<void>
    {
        try
        {
            const result = await func(req);
            res.status(200).json(result);
        } catch (error)
        {
            console.error("Middleware error:", error);
            res.status(500).json({ code: ReturnCode('ISE'), message: "Internal server error", data: undefined });
        }
    }

}