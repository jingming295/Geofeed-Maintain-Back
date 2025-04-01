export interface Config
{
    serverHost: string,
    serverPort: number,
    websiteUrl: string,
    websiteName: string,
    database: {
        databaseName: string,
        username: string,
        password: string,
        dialect: string,
        databaseHost: string,
        databaseLogging: boolean,
        databaseTimestamp: boolean,
        databaseDevMode: boolean,
    }
    smtp?: SMTP
    redispassword?: string | undefined
    devMode: boolean
}

export interface SMTP
{
    host: string,
    port: number,
    secure: boolean,
    auth: {
        user: string,
        pass: string,
    }
    senderName: string,
    senderEmail: string,
}