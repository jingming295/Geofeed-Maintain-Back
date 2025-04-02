import crypto from 'crypto';
export class CryptoUtils
{

    public static toMD5(data: string): string
    {
        return crypto.createHash('md5').update(data).digest('hex');
    }

    public static saltAndToSHA256(data: string): string
    {
        const salt = `m/tK+e3N:Pdn:SIwo4CN`;
        const saltedData = data + salt;
        return crypto.createHash('sha256').update(saltedData).digest('hex');
    }

    /**
     * Convert the file into SHA512 hash
     * @param data the file to be hashed
     * @returns {string} the hashed file
     */
    public static fileToSHA256(data: Buffer): string
    {
        const hash = crypto.createHash('sha256');
        hash.update(data);
        return hash.digest('hex');
    }

    /**
     * Generate a random string
     * @param length the length of the string
     * @returns {string} The random string
     */
    public static generateRandomString(length: number): string
    {
        return crypto.randomBytes(length).toString('base64').slice(0, length);
    }

    public static generateRandomUUID(): string
    {
        return crypto.randomUUID();
    }
}