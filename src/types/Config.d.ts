export interface Config
{
    geonamesUsername: string,
    database: {
        databaseName: string,
        username: string,
        password: string,
        databaseHost: string,
    }
    smtp?: SMTP
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