import { Config } from "../types/Config";
import { Sequelize } from "@sequelize/core";
// import { MariaDbDialect } from "@sequelize/mariadb";
import { User_Roles } from "./models/users/User_Roles";
import { Users } from "./models/users/Users";
import { ASN } from "./models/asn/ASN";
import { Country } from "./models/geolocation/Country";
import { Subdivision } from "./models/geolocation/Subdivision";
import { City } from "./models/geolocation/City";
import { Zipcode } from "./models/geolocation/Zipcode";
import { Prefixes } from "./models/asn/Prefixes";
import { SqliteDialect } from '@sequelize/sqlite3';



export class SQInit
{
    static Sequelize: Sequelize;
    static async init(config: Config)
    {
        console.log(config)
        const sequelize = new Sequelize({
            dialect: SqliteDialect,
            storage: './data/database/database.sqlite',
            define: {
                timestamps: true
            },
            // connectTimeout: 5000,
            models: [
                User_Roles,
                Users,
                ASN,
                Country,
                Subdivision,
                City,
                Zipcode,
                Prefixes
            ]
        });
        await sequelize.sync(); // force: true will drop the table if it already exists
        this.Sequelize = sequelize;
        console.log("All models were synchronized successfully.");
    }

}