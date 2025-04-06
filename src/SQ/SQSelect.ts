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
        getPrefixById: async (id: number, userID: number): Promise<DatabaseResult<Prefixes | null>> =>
        {
            try
            {
                const prefixResult = await Prefixes.findOne({
                    where: {
                        id: id,

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
                        },
                        {
                            model: ASN,
                            where: {
                                user_id: userID
                            }
                        }
                    ]
                })

                return {
                    message: "Prefix found",
                    data: prefixResult,
                }

            } catch (error)
            {
                console.error("Error in prefix.getPrefixById: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
    }

    public static geolocation = {
        getCountryList: async (): Promise<DatabaseResult<Country[]>> =>
        {
            try
            {
                const countryResult = await Country.findAll({
                    where: {
                        is_deleted: false
                    }
                })

                return {
                    message: "Country found",
                    data: countryResult,
                }

            } catch (error)
            {
                console.error("Error in geolocation.getCountry: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
        getSubDivisionByCountry: async (countryID: number): Promise<DatabaseResult<Subdivision[]>> =>
        {
            try
            {
                const subdivisionResult = await Subdivision.findAll({
                    where: {
                        country_id: countryID,
                        is_deleted: false
                    }
                })

                return {
                    message: "Subdivision found",
                    data: subdivisionResult,
                }

            } catch (error)
            {
                console.error("Error in geolocation.getSubDivisionByCountry: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
        getCountryByID: async (countryID: number): Promise<DatabaseResult<Country | null>> =>
        {
            try
            {
                const countryResult = await Country.findOne({
                    where: {
                        id: countryID,
                        is_deleted: false
                    }
                })

                return {
                    message: "Country found",
                    data: countryResult,
                }

            } catch (error)
            {
                console.error("Error in geolocation.getCountryByID: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
        getCityBySubdivisionID: async (subdivisionID: number): Promise<DatabaseResult<City[]>> =>
        {
            try
            {
                const cityResult = await City.findAll({
                    where: {
                        subdivision_id: subdivisionID,
                        is_deleted: false
                    }
                })

                return {
                    message: "City found",
                    data: cityResult,
                }

            } catch (error)
            {
                console.error("Error in geolocation.getCityBySubdivisionID: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
        getCityByCountryID: async (countryID: number): Promise<DatabaseResult<City[]>> =>
        {
            try
            {
                const cityResult = await City.findAll({
                    where: {
                        country_id: countryID,
                        is_deleted: false
                    }
                })

                return {
                    message: "City found",
                    data: cityResult,
                }

            } catch (error)
            {
                console.error("Error in geolocation.getCityByCountryID: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
        getZipCodeByCityID: async (cityID: number): Promise<DatabaseResult<Zipcode[]>> =>
        {
            try
            {
                const zipcodeResult = await Zipcode.findAll({
                    where: {
                        city_id: cityID,
                        is_deleted: false
                    }
                })

                return {
                    message: "Zipcode found",
                    data: zipcodeResult,
                }

            } catch (error)
            {
                console.error("Error in geolocation.getZipCodeByCityID: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
        validateSubdivision: async (subdivisionID: number, countryID: number): Promise<DatabaseResult<Subdivision | null>> =>
        {
            try
            {
                const subdivisionResult = await Subdivision.findOne({
                    where: {
                        id: subdivisionID,
                        country_id: countryID,
                        is_deleted: false
                    },
                    include: [
                        {
                            model: Country
                        }
                    ]
                })

                if (!subdivisionResult)
                {
                    return {
                        message: "Subdivision not found",
                    }
                }

                return {
                    message: "Subdivision found",
                    data: subdivisionResult,
                }



            } catch (error)
            {
                console.error("Error in geolocation.getCountryBySubdivisionID: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
        checkCityNameExist: async (cityName: string, countryid: number | null, subdivisionID: number | null): Promise<DatabaseResult<City | null>> =>
        {
            if (subdivisionID)
            {
                countryid = null;
            }
            try
            {
                const cityResult = await City.findOne({
                    where: {
                        name: cityName,
                        country_id: countryid,
                        subdivision_id: subdivisionID,
                        is_deleted: false
                    }
                })

                if (!cityResult)
                {
                    return {
                        message: "City not found",
                    }
                }
                return {
                    message: "City found",
                    data: cityResult,
                }


            } catch (error)
            {
                console.error("Error in geolocation.checkCityNameExist: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
        checkZipCodeNameExist: async (zipcode: string, cityID: number): Promise<DatabaseResult<Zipcode | null>> =>
        {
            try
            {
                const zipcodeResult = await Zipcode.findOne({
                    where: {
                        name: zipcode,
                        city_id: cityID,
                        is_deleted: false
                    }
                })

                if (!zipcodeResult)
                {
                    return {
                        message: "Zipcode not found",
                    }
                }

                return {
                    message: "Zipcode found",
                    data: zipcodeResult,
                }


            } catch (error)
            {
                console.error("Error in geolocation.checkZipCodeNameExist: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
        validateCityID: async (cityID: number, countryID: number | null, subdivisionID: number | null): Promise<DatabaseResult<City | null>> =>
        {
            if (subdivisionID)
            {
                countryID = null;
            }
            try
            {
                const cityResult = await City.findOne({
                    where: {
                        id: cityID,
                        country_id: countryID,
                        subdivision_id: subdivisionID,
                        is_deleted: false
                    }
                })

                if (!cityResult)
                {
                    return {
                        message: "City not found",
                    }
                }

                return {
                    message: "City found",
                    data: cityResult,
                }


            } catch (error)
            {
                console.error("Error in geolocation.validateCityID: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        },
        validateZipCodeID: async (zipcodeID: number, cityID: number): Promise<DatabaseResult<Zipcode | null>> =>
        {
            try
            {
                const zipcodeResult = await Zipcode.findOne({
                    where: {
                        id: zipcodeID,
                        city_id: cityID,
                        is_deleted: false
                    }
                })

                if (!zipcodeResult)
                {
                    return {
                        message: "Zipcode not found",
                    }
                }

                return {
                    message: "Zipcode found",
                    data: zipcodeResult,
                }


            } catch (error)
            {
                console.error("Error in geolocation.validateZipCodeID: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        }
    }

}