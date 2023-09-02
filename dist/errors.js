"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionError = exports.DecryptionError = exports.CryptoError = exports.PutError = exports.NotFoundError = exports.KVError = void 0;
class KVError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.status = status;
    }
    status;
}
exports.KVError = KVError;
class NotFoundError extends KVError {
    constructor(message = `Not Found`, status = 404) {
        super(message, status);
    }
}
exports.NotFoundError = NotFoundError;
class PutError extends KVError {
    constructor(message = `Error putting value to KV`) {
        super(message);
    }
}
exports.PutError = PutError;
class CryptoError extends Error {
    constructor(message, status = 500) {
        super(message);
    }
}
exports.CryptoError = CryptoError;
class DecryptionError extends CryptoError {
    constructor(message = `Error decrypting value`) {
        super(message);
    }
}
exports.DecryptionError = DecryptionError;
class EncryptionError extends CryptoError {
    constructor(message = `Error encrypting value`) {
        super(message);
    }
}
exports.EncryptionError = EncryptionError;
