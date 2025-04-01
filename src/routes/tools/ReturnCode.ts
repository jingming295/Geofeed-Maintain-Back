// Define the error codes
export enum Code
{
    OPSuccess = 0,
    MissingRequiredField = -101,
    ISE = -110,
    InputVerificationFailed = -102,
    OPFailed = -103,
    NotFound = -104,
    AuthorizationFailed = -105,
    UserNotActivated = -106,
    InvalidValue = -107,
    NotLoggedIn = -108,
    NoPermission = -109,
    FileTooLarge = -120,
    InvalidFileType = -121,
    FileVerificationFailed = -122,
    FileAlreadyExists = -123,
    NotPaid = -130
}

export function ReturnCode(codeString: keyof typeof Code): number
{
    return Code[codeString] ?? -1; // Default to -1 for unknown codes
}