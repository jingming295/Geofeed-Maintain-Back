import { Config } from "@/types/Config";
import { Sequelize } from "@sequelize/core";
import { MariaDbDialect } from "@sequelize/mariadb";
import { User_Roles } from "./models/users/User_Roles";
import { Users } from "./models/users/Users";
import { ASN } from "./models/asn/ASN";
import { Country } from "./models/geolocation/Country";
import { Subdivision } from "./models/geolocation/Subdivision";
import { City } from "./models/geolocation/City";
import { Zipcode } from "./models/geolocation/Zipcode";
import { Prefixes } from "./models/asn/Prefixes";


export class SQInit
{
    static Sequelize: Sequelize;
    static async init(config: Config)
    {
        async function createDatabase()
        {
            try
            {
                const sequelize = new Sequelize({
                    dialect: MariaDbDialect,  // 这里指定数据库类型，mariadb 使用 `mariadb` 
                    initSql: `CREATE DATABASE IF NOT EXISTS ${database.databaseName}`, // 初始化 SQL 语句，如果数据库不存在则创建
                    user: database.username, // 使用 config 中的 username 配置
                    password: database.password, // 使用 config 中的 password 配置
                    host: database.databaseHost, // 使用 config 中的 host 配置
                    port: 3306,  // MariaDB 默认的端口，您可以根据实际情况调整
                    define: {
                        timestamps: true
                    },
                    connectTimeout: 5000
                });

                await sequelize.authenticate();
            } catch (error)
            {
                console.error('Unable to connect to the database:', error);
                throw error; // 重新抛出错误以便外部捕获
            }

        }


        const database = config.database;
        await createDatabase();
        const sequelize = new Sequelize({
            dialect: MariaDbDialect,  // 这里指定数据库类型，mariadb 使用 `
            database: database.databaseName, // 使用 config 中的 database 配置
            user: database.username, // 使用 config 中的 username 配置
            password: database.password, // 使用 config 中的 password 配置
            host: database.databaseHost, // 使用 config 中的 host 配置
            port: 3306,  // MariaDB 默认的端口，您可以根据实际情况调整
            define: {
                timestamps: true
            },
            connectTimeout: 5000,
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
        await sequelize.sync({ force: database.databaseDevMode }); // force: true will drop the table if it already exists
        this.Sequelize = sequelize;
        console.log("All models were synchronized successfully.");
    }

}