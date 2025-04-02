import { DatabaseResult } from "@/types/DatabaseResult";
import { Users } from "./models/users/Users";
import { SQInit } from "./SQInit";
import { CryptoUtils } from "@/utils/CryptoUtils";
import { User_Roles } from "./models/users/User_Roles";
import { ISO } from "@/request/iso/ISO";
import { Country } from "./models/geolocation/Country";
import { Config } from "@/types/Config";
import { Subdivision } from "./models/geolocation/Subdivision";
import { ASN } from "./models/asn/ASN";
import { Prefixes } from "./models/asn/Prefixes";

export class SQInsert extends SQInit
{

    public static initInsert = {
        insertDefault: async (): Promise<DatabaseResult<null>> =>
        {
            try
            {
                const result = await this.Sequelize.transaction(async (): Promise<DatabaseResult<null>> =>
                {
                    const usersResult = await Users.findAll();
                    if (usersResult.length) return { message: "User already exists" };

                    const password = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'

                    const hashedPassword = CryptoUtils.saltAndToSHA256(password);

                    await User_Roles.create({
                        id: 1,
                        role_name: 'user',
                    })

                    await Users.create({
                        id: 1,
                        user_role_id: 1,
                        email: 'admin@admin.com',
                        password: hashedPassword,
                        is_active: true
                    })


                    return { message: "Default inserted" };

                })


                return result


            } catch (error)
            {
                console.error('Error inserting default user:', error);
                return { error: true, message: "Error inserting default user" };
            }



        },
        insertDefaultLocation: async (config: Config): Promise<DatabaseResult<null>> =>
        {
            try
            {
                const countryResult = await Country.findOne();

                if (countryResult) return { message: "Country already exists" };

                const rawData = await ISO.getAllCountryCode(config);
                const countryInfoList: CountryInfo[] = rawData.geonames.map((country, index) => ({
                    id: index + 1,
                    alpha2: country.countryCode,
                    alpha3: country.isoAlpha3,
                    countryName: country.countryName,
                    geonameId: country.geonameId,
                    isoNumeric: country.isoNumeric,
                }));

                for (const countryInfo of countryInfoList)
                {
                    console.log(`Inserting country: ${countryInfo.countryName}, id: ${countryInfo.id}`);
                    // 插入国家数据
                    await Country.create({
                        id: countryInfo.id,
                        alpha_2_code: countryInfo.alpha2,
                        alpha_3_code: countryInfo.alpha3,
                        name: countryInfo.countryName,
                        iso_numeric: countryInfo.isoNumeric,
                        is_deleted: false,
                    });

                    // 获取分区数据
                    const divisionData: DivisionData | null = await ISO.getDivisionCode(config, countryInfo.geonameId).catch((error) =>
                    {
                        console.warn(`Error fetching division codes for ${countryInfo.countryName}: ${error.message}`);
                        return null;
                    });

                    if (!divisionData || !divisionData.geonames)
                    {
                        console.warn(`Skipping ${countryInfo.countryName}: There is no subdivision in this country`);
                        continue;
                    }

                    // 遍历分区数据
                    for (const division of divisionData.geonames)
                    {
                        if (
                            !division.adminCodes1 || // 没有 adminCodes1
                            !division.adminCodes1.ISO3166_2 || // 没有 ISO3166_2 代码
                            !division.name // 没有分区名称
                        )
                        {
                            console.warn(`Skipping ${countryInfo.countryName}: There is no subdivision in this country`);
                            continue; // 跳过当前分区
                        }

                        // 插入有效的分区数据
                        await Subdivision.create({
                            code_3166_2: division.adminCodes1.ISO3166_2,
                            name: division.name,
                            country_id: countryInfo.id,
                            is_deleted: false,
                        });
                    }
                }

                console.log('Default location inserted successfully');
                return { message: "Default location inserted successfully" };
            } catch (error)
            {
                console.error('Error inserting default location:', error);
                return { error: true, message: "Error inserting default user" };
            }
        }


    }

    public static asn = {
        insertNewASN: async (asn: string, userId: number): Promise<DatabaseResult<ASN>> =>
        {
            try
            {
                const asnResult = await ASN.create({
                    as_number: asn,
                    as_name: `AS${asn}`,
                    user_id: userId,
                    is_active: true,
                    is_deleted: false,
                })

                return {
                    message: "ASN created",
                    data: asnResult,
                }
            } catch (error)
            {
                console.error("Error in SQInsert.asn.insertNewASN: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        }
    }

    public static prefix = {
        insertNewPrefix: async (asnId: number, prefix: string): Promise<DatabaseResult<Prefixes>> =>
        {
            try
            {
                const prefixResult = await Prefixes.create({
                    prefix: prefix,
                    asn_id: asnId,
                    is_present: true,
                    is_active: true,
                    is_deleted: false,
                })

                return {
                    message: "Prefix created",
                    data: prefixResult,
                }
            } catch (error)
            {
                console.error("Error in SQInsert.prefix.insertNewPrefix: ", error);
                return {
                    message: "Database error",
                    error: true,
                }
            }
        }
    }

}