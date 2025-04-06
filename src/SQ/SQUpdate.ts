import { SQInit } from "./SQInit";
import { Prefixes } from "./models/asn/Prefixes";
import { DatabaseResult } from "@/types/DatabaseResult";

export class SQUpdate extends SQInit
{

    public static prefix = {

        updatePrefixCountry: async (prefixID: number, Countryid: number | null): Promise<DatabaseResult<[affectedCount: number]>> =>
        {
            try
            {

                const result = await Prefixes.update({ country_id: Countryid }, { where: { id: prefixID } });
                if (result[0] === 0)
                {
                    return {
                        error: true,
                        message: "No rows updated",
                    };
                }
                return {
                    error: false,
                    message: "Update successful",
                    data: result,
                };

            } catch (error)
            {
                console.error("Error during updatePrefixCountry:", error);
                return {
                    error: true,
                    message: "Internal Server Error",
                };
            }

        },
        updatePrefixSubdivitionByIdAndCountryID: async (prefixID: number, subdivisionsid: number | null, countryid: number): Promise<DatabaseResult<[affectedCount: number]>> =>
        {
            try
            {
                const result = await Prefixes.update({ subdivision_id: subdivisionsid }, { where: { id: prefixID, country_id: countryid } });
                if (result[0] === 0)
                {
                    return {
                        error: true,
                        message: "No rows updated",
                    };
                }
                return {
                    error: false,
                    message: "Update successful",
                    data: result,
                };

            } catch (error)
            {
                console.error("Error during updatePrefixSubdivitionByIdAndCountryID:", error);
                return {
                    error: true,
                    message: "Internal Server Error",
                };
            }

        },
        updatePrefixCityID: async (prefixID: number, cityid: number | null): Promise<DatabaseResult<[affectedCount: number]>> =>
        {
            try
            {
                const result = await Prefixes.update({ city_id: cityid }, { where: { id: prefixID } });
                if (result[0] === 0)
                {
                    return {
                        error: true,
                        message: "No rows updated",
                    };
                }
                return {
                    error: false,
                    message: "Update successful",
                    data: result,
                };

            } catch (error)
            {
                console.error("Error during updatePrefixCityID:", error);
                return {
                    error: true,
                    message: "Internal Server Error",
                };
            }
        },
        updatePrefixZipCodeID: async (prefixID: number, zipcodeid: number | null): Promise<DatabaseResult<[affectedCount: number]>> =>
        {
            try
            {
                const result = await Prefixes.update({ zipcode_id: zipcodeid }, { where: { id: prefixID } });
                if (result[0] === 0)
                {
                    return {
                        error: true,
                        message: "No rows updated",
                    };
                }
                return {
                    error: false,
                    message: "Update successful",
                    data: result,
                };

            } catch (error)
            {
                console.error("Error during updatePrefixZipCodeID:", error);
                return {
                    error: true,
                    message: "Internal Server Error",
                };
            }
        }

    }

}