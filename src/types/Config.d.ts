export interface Config
{
    geonamesUsername: string,
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