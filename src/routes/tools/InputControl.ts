export class InputControl
{
    static validateUsername(username: string)
    {
        // Valid characters: letters, numbers, symbols, and Chinese characters. Length: 1 to 20.
        const format: RegExp = /^[a-zA-Z0-9!@#$%^&*()-_=+\u4e00-\u9fa5\s]{1,20}$/;

        if (!format.test(username))
        {
            return { pass: false, message: `Please input a correct username, must be between 1 and 20 characters.` }
        }
        return { pass: true, message: '' };
    }

    static validateEmail(email: string)
    {
        // Regular expression for validating email addresses.
        const format: RegExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

        const maxLength = 254; // RFC 5322 Official Standard

        if (!format.test(email) || email.length > maxLength)
        {
            return { pass: false, message: 'Please input a correct email.' }
        }
        return { pass: true, message: '' };
    }


    static validatePassword(password: string)
    {
        // a-z, 0-9, symbol, sha256 length
        const sha256Format: RegExp = /^[a-f0-9]{64}$/;
        if (!sha256Format.test(password))
        {
            return { pass: false, message: 'Please input a correct password.' }
        }
        return { pass: true, message: '' };
    }
    static validateGender(gender: number)
    {
        if (![0, 1, 2].includes(gender))
        {
            return { pass: false, message: 'Please input a correct gender.' }
        }
        return { pass: true, message: '' };
    }
    static validateUserDesc(userDesc: string)
    {
        if (userDesc.length < 1 || userDesc.length > 100)
        {
            return { pass: false, message: 'Please input a correct user description, must be less than 100 characters or more than 1 character and contain only alphanumeric characters and spaces.' }
        }
        return { pass: true, message: '' };
    }

    static validateCommonSwitch(value: number)
    {
        if (![0, 1].includes(value))
        {
            return { pass: false, message: 'Please input a correct value.' }
        }
        return { pass: true, message: '' };
    }

    static validateSMTPPassword(password: string)
    {
        if (password.length < 1 || password.length > 200)
        {
            return { pass: false, message: 'SMTP password is too long or too short.' }
        }
        return { pass: true, message: '' };
    }

    static validatePort(port: number)
    {
        if (!Number.isInteger(port))
        {
            return { pass: false, message: 'Port number is invalid.' }
        } else if (port < 1 || port > 65535)
        {
            return { pass: false, message: 'Port number is invalid.' }
        }
        return { pass: true, message: '' };
    }

    static validateCommonSQLID(id: number)
    {
        if (id < 1 || id > 2147483647)
        {
            return { pass: false, message: 'Please input a correct id.' }
        }
        return { pass: true, message: '' };
    }

    static verifyToken(token: string)
    {
        if (token.length !== 64)
        {
            return { pass: false, message: 'Please input a correct token.' }
        }
        return { pass: true, message: '' };
    }

    static validateBigAreaName(name: string)
    {
        if (name.length < 1 || name.length > 20 || !/^[a-zA-Z0-9 ]*$/.test(name))
        {
            return { pass: false, message: 'Please input a correct big area name, must be less than 20 characters and contain only alphanumeric characters and spaces.' }
        }
        return { pass: true, message: '' };
    }

    static validateSubAreaName(name: string)
    {
        if (name.length < 1 || name.length > 20 || !/^[a-zA-Z0-9 ]*$/.test(name))
        {
            return { pass: false, message: 'Please input a correct sub area name, must be less than 20 characters and contain only alphanumeric characters and spaces.' }
        }
        return { pass: true, message: '' };
    }
}
