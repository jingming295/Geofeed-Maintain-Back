import { DatabaseResult } from "@/types/DatabaseResult";
import { Users } from "./models/users/Users";
import { SQInit } from "./SQInit";
import { ASN } from "./models/asn/ASN";
import { Prefixes } from "./models/asn/Prefixes";
import { Subdivision } from "./models/geolocation/Subdivision";
import { Country } from "./models/geolocation/Country";
import { City } from "./models/geolocation/City";
import { Zipcode } from "./models/geolocation/Zipcode";

export class SQSelect extends SQInit
{


    public static auth = {
        login: async (email: string, password: string): Promise<DatabaseResult<Users>> =>
        {

            try
            {
                const userresult = await Users.findOne({
                    where: {
                        email: email,
                        password: password,
                        is_active: true
                    }
                })

                if (!userresult)
                {
                    return {
                        message: "User not found",
                    }
                }

                return {
                    message: "User found",
                    data: userresult,
                }

            } catch (error)
            {
                console.error("Error in auth.login: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
        getUserById: async (id: number): Promise<DatabaseResult<Users>> =>
        {
            try
            {
                const userresult = await Users.findOne({
                    where: {
                        id: id,
                        is_active: true
                    }
                })

                if (!userresult)
                {
                    return {
                        message: "User not found",
                    }
                }

                return {
                    message: "User found",
                    data: userresult,
                }

            } catch (error)
            {
                console.error("Error in auth.getUserById: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        }
    }

    public static asn = {
        getASNByUserId: async (userid: number): Promise<DatabaseResult<ASN[]>> =>
        {
            try
            {

                const asnResult = await ASN.findAll({
                    where: {
                        user_id: userid
                    }
                })

                return {
                    message: "ASN found",
                    data: asnResult,
                }

            } catch (error)
            {
                console.error("Error in asn.getASNByUserId: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
        getPrefixByASNId: async (asnId: number): Promise<DatabaseResult<Prefixes[]>> =>
        {
            try
            {
                const prefixResult = await Prefixes.findAll({
                    where: {
                        asn_id: asnId
                    }
                })

                return {
                    message: "Prefix found",
                    data: prefixResult,
                }

            } catch (error)
            {
                console.error("Error in asn.getPrefixByASNId: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
        getASNByASNumber: async (asNumber: string): Promise<DatabaseResult<ASN[]>> =>
        {
            try
            {
                const asnResult = await ASN.findAll({
                    where: {
                        as_number: asNumber
                    }
                })

                return {
                    message: "ASN found",
                    data: asnResult,
                }

            } catch (error)
            {
                console.error("Error in asn.getASNByASNumber: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
        validateASNUser: async (asn: string, userId: number): Promise<DatabaseResult<ASN | null>> =>
        {
            try
            {
                const asnResult = await ASN.findOne({
                    where: {
                        as_number: asn,
                        user_id: userId
                    }
                })


                return {
                    message: "ASN found",
                    data: asnResult,
                }

            } catch (error)
            {
                console.error("Error in asn.validateASNUser: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        }
    }

    public static prefix = {
        getPrefixByASNId: async (asnId: number): Promise<DatabaseResult<Prefixes[]>> =>
        {
            try
            {
                const prefixResult = await Prefixes.findAll({
                    where: {
                        asn_id: asnId
                    },
                    include: [
                        {
                            model: Country
                        },
                        {
                            model: Subdivision
                        },
                        {
                            model: City
                        },
                        {
                            model: Zipcode
                        }
                    ]
                })

                return {
                    message: "Prefix found",
                    data: prefixResult,
                }

            } catch (error)
            {
                console.error("Error in prefix.getPrefixByASNId: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
    }

}