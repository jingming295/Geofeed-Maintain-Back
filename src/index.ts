import express, { Application } from 'express';
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
import { Route_Location } from './routes/location/Route_Location';
import path from 'path';
import { SelfCheckPrefix } from './services/SelfCheckPrefix';

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
        // First, set up all API routes
        Route_Auth.setRoute(this.app);
        Route_ASN.setRoute(this.app);
        Route_Prefix.setRoute(this.app);
        Route_Location.setRoute(this.app);

        // Then, configure the static middleware for serving frontend files
        this.app.use(express.static(path.join(process.cwd(), '/frontend/dist')));

        this.app.use((req, res) =>
        {
            const frontend = path.join(process.cwd(), '/frontend/dist/index.html');
            res.sendFile(frontend);
        });

    }


    private static startServer(): void
    {
        const PORT = 3000;
        this.app.listen(PORT, () =>
        {
            console.log(`Server is running on http://localhost:${PORT}`);
            SelfCheckPrefix.start();
        });
    }

    private static setupConfig(): Config
    {
        const config: Config = {
            geonamesUsername: "jingming295" as string,
        };

        return config;
    }

    private static async test(): Promise<void>
    {

    }
}
dotenv.config();
App.init();