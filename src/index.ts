import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import { Route_Auth } from './routes/auth/Route_Auth';
import dotenv from "dotenv";
import { Config } from './types/Config';
import { SQInit } from './SQ/SQInit';
import { SQInsert } from './SQ/SQInsert';
import FileStore from "session-file-store"; // 引入文件存储
import { Route_ASN } from './routes/asn/Route_ASN';
import { Route_Prefix } from './routes/prefix/Route_Prefix';

class App
{
    private static app: Application;

    public static async init(): Promise<void>
    {
        if (!this.app)
        {
            this.test() // 测试函数，获取国家代码
            this.app = express();

            // 设置 CORS 策略
            this.app.use(
                cors({
                    origin: 'http://localhost:5173', // 指定前端地址
                    credentials: true, // 允许发送凭据
                })
            );

            const config = this.setupConfig(); // 获取配置

            await SQInit.init(config)

            const sqInsertResult = await SQInsert.initInsert.insertDefault()

            const sqLocInsertResult = await SQInsert.initInsert.insertDefaultLocation(config)

            if (sqLocInsertResult.error) throw new Error(sqLocInsertResult.message)

            if (sqInsertResult.error) throw new Error(sqInsertResult.message)

            // 配置中间件
            this.setupMiddleware();

            // 配置会话
            this.setupSession();

            // 路由设置
            this.setupRoutes();

            // 启动服务
            this.startServer();
        }
    }

    private static setupMiddleware(): void
    {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private static setupSession(): void
    {
        const FileStoreSession = FileStore(session);
        this.app.use(session({
            store: new FileStoreSession({ path: "./data/sessions" }), // 存储会话的文件夹
            secret: 'your_secret_key', // 请使用一个更安全的密钥
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge: 2 * 24 * 60 * 60 * 1000 // 2天的有效期，单位为毫秒
            }
        }));
    }

    private static setupRoutes(): void
    {
        this.app.get('/', (req: Request, res: Response) =>
        {
            res.send('Hello');
        });

        Route_Auth.setRoute(this.app);
        Route_ASN.setRoute(this.app);
        Route_Prefix.setRoute(this.app);
    }

    private static startServer(): void
    {
        const PORT = 3000;
        this.app.listen(PORT, () =>
        {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    }

    private static setupConfig(): Config
    {
        const missingEnvVars: string[] = []; // 用于记录缺失的变量名

        const serverHost = process.env.THIS_SERVER_HOST || missingEnvVars.push('THIS_SERVER_HOST');
        const serverPort = process.env.THIS_SERVER_PORT || missingEnvVars.push('THIS_SERVER_PORT');
        const websiteUrl = process.env.WEBSITE_URL || missingEnvVars.push('WEBSITE_URL');
        const websiteName = process.env.WEBSITE_NAME || missingEnvVars.push('WEBSITE_NAME');

        const dbName = process.env.DATABASE_NAME || missingEnvVars.push('DATABASE_NAME');
        const dbUsername = process.env.DATABASE_USERNAME || missingEnvVars.push('DATABASE_USERNAME');
        const dbPassword = process.env.DATABASE_PASSWORD || ""
        const dbDialect = process.env.DATABASE_DIALECT || missingEnvVars.push('DATABASE_DIALECT');
        const dbDatabaseHost = process.env.DATABASE_HOST || missingEnvVars.push('DATABASE_HOST');

        const databaseLogging = process.env.DATABASE_LOGGING === 'true';
        const databaseTimestamp = process.env.DATABASE_TIMESTAMP === 'true';
        const databaseDevMode = process.env.DATABASE_DEV_MODE === 'true';

        const redispassword = process.env.REDIS_PASSWORD || undefined

        const devMode = process.env.DEV_MODE === 'true';

        const geonamesUsername = process.env.GEONAMES_USERNAME || missingEnvVars.push('GEONAMES_USERNAME');
        // 如果存在缺失的变量，抛出错误并提示缺失的变量名
        if (missingEnvVars.length > 0)
        {
            throw new Error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
        }
        const config: Config = {
            serverHost: serverHost as string,
            serverPort: parseInt(serverPort as string),
            websiteUrl: websiteUrl as string,
            websiteName: websiteName as string,
            geonamesUsername: geonamesUsername as string,
            database: {
                databaseName: dbName as string,
                username: dbUsername as string,
                password: dbPassword as string,
                dialect: dbDialect as string,
                databaseHost: dbDatabaseHost as string,
                databaseLogging: databaseLogging,
                databaseTimestamp: databaseTimestamp,
                databaseDevMode: databaseDevMode,
            },
            redispassword: redispassword as string,
            devMode: devMode,
        };

        return config;
    }

    private static async test(): Promise<void>
    {

    }
}
dotenv.config();
App.init();