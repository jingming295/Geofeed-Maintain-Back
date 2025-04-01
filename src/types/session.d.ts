import 'express-session';

declare module 'express-session' {
    interface SessionData
    {
        user?: SessionDataUser
    }

}

export interface SessionDataUser
{
    id: number,
    email: string,
    role: number,
    avatar: string
    activated: boolean
}