export interface DatabaseResult<T>
{
    message: string;
    error?: boolean;
    data?: T;
}