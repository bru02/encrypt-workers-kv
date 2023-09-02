"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptData = exports.encryptData = exports.getDecryptedKV = exports.putEncryptedKV = void 0;
const errors_1 = require("./errors");
const enc = new TextEncoder();
const dec = new TextDecoder();
/**
 * Wrapper on Workers KV put command that encrypts data prior to storage
 *
 * @param {KVNamespace} namespace the binding to the namespace that script references
 * @param {string} key the key in the namespace used to reference the stored value
 * @param {string | ArrayBuffer} data the data to encrypt and store in KV
 * @param {string} password the password used to encrypt the data
 * @param {number} iterations optional number of iterations used by the PBKDF2 to derive the key.  Default 10000
 * @param {Object} options optional KV put fields
 * @returns {Promise<ArrayBuffer>} a promise for an encrypted value as ArrayBuffer
 * */
async function putEncryptedKV(namespace, key, data, password, iterations = 10000, options) {
    data = typeof data === 'string' ? enc.encode(data) : data;
    let encryptedData;
    try {
        encryptedData = await encryptData(data, password, iterations);
    }
    catch (e) {
        throw e;
    }
    try {
        if (options) {
            await namespace.put(key, encryptedData, options);
        }
        else {
            await namespace.put(key, encryptedData);
        }
        return encryptedData;
    }
    catch (e) {
        throw new errors_1.PutError(`Error putting value to kv: ${e.message}`);
    }
}
exports.putEncryptedKV = putEncryptedKV;
/**
 * Wrapper on Workers KV get command that decrypts data after getting from storage
 *
 * @param {KVNamespace} namespace the binding to the namespace that script references
 * @param {string} key the key in the namespace used to reference the stored value
 * @param {string} password the password used to encrypt the data
 * @returns {Promise<ArrayBuffer>} a promise for a decrypted value as ArrayBuffer
 * */
async function getDecryptedKV(namespace, key, password, options = {}) {
    let _options = options;
    _options.type = 'arrayBuffer';
    let kvEncryptedData = await namespace.get(key, _options);
    if (kvEncryptedData === null) {
        throw new errors_1.NotFoundError(`could not find ${key} in your namespace`);
    }
    try {
        let decryptedData = await decryptData(kvEncryptedData, password);
        return decryptedData;
    }
    catch (e) {
        throw e;
    }
}
exports.getDecryptedKV = getDecryptedKV;
const getPasswordKey = (password) => crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveKey',
]);
const deriveKey = (passwordKey, salt, keyUsage, iterations = 10000) => crypto.subtle.deriveKey({
    name: 'PBKDF2',
    salt: salt,
    iterations: iterations,
    hash: 'SHA-256',
}, passwordKey, { name: 'AES-GCM', length: 256 }, false, keyUsage);
async function encryptData(secretData, password, iterations = 10000) {
    try {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const passwordKey = await getPasswordKey(password);
        const aesKey = await deriveKey(passwordKey, salt, ['encrypt'], iterations);
        const encryptedContent = await crypto.subtle.encrypt({
            name: 'AES-GCM',
            iv: iv,
        }, aesKey, secretData);
        const encryptedContentArr = new Uint8Array(encryptedContent);
        let iterationsArr = new Uint8Array(enc.encode(iterations.toString()));
        let buff = new Uint8Array(iterationsArr.byteLength +
            salt.byteLength +
            iv.byteLength +
            encryptedContentArr.byteLength);
        let bytes = 0;
        buff.set(iterationsArr, bytes);
        buff.set(salt, (bytes += iterationsArr.byteLength));
        buff.set(iv, (bytes += salt.byteLength));
        buff.set(encryptedContentArr, (bytes += iv.byteLength));
        return buff.buffer;
    }
    catch (e) {
        throw new errors_1.EncryptionError(`Error encrypting value: ${e.message}`);
    }
}
exports.encryptData = encryptData;
async function decryptData(encryptedData, password) {
    try {
        const encryptedDataBuff = new Uint8Array(encryptedData);
        let bytes = 0;
        const iterations = Number(dec.decode(encryptedDataBuff.slice(bytes, (bytes += 5))));
        const salt = new Uint8Array(encryptedDataBuff.slice(bytes, (bytes += 16)));
        const iv = new Uint8Array(encryptedDataBuff.slice(bytes, (bytes += 12)));
        const data = new Uint8Array(encryptedDataBuff.slice(bytes));
        const passwordKey = await getPasswordKey(password);
        const aesKey = await deriveKey(passwordKey, salt, ['decrypt'], iterations);
        const decryptedContent = await crypto.subtle.decrypt({
            name: 'AES-GCM',
            iv: iv,
        }, aesKey, data);
        return decryptedContent;
    }
    catch (e) {
        throw new errors_1.DecryptionError(`Error decrypting value: ${e.message}`);
    }
}
exports.decryptData = decryptData;
