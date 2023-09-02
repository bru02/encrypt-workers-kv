export declare class KVError extends Error {
    constructor(message?: string, status?: number);
    status: number;
}
export declare class NotFoundError extends KVError {
    constructor(message?: string, status?: number);
}
export declare class PutError extends KVError {
    constructor(message?: string);
}
export declare class CryptoError extends Error {
    constructor(message?: string, status?: number);
}
export declare class DecryptionError extends CryptoError {
    constructor(message?: string);
}
export declare class EncryptionError extends CryptoError {
    constructor(message?: string);
}
