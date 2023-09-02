import type { KVNamespace, KVNamespaceGetOptions, KVNamespacePutOptions } from '@cloudflare/workers-types';
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
declare function putEncryptedKV(namespace: KVNamespace, key: string, data: string | ArrayBuffer, password: string, iterations?: number, options?: KVNamespacePutOptions): Promise<ArrayBuffer>;
/**
 * Wrapper on Workers KV get command that decrypts data after getting from storage
 *
 * @param {KVNamespace} namespace the binding to the namespace that script references
 * @param {string} key the key in the namespace used to reference the stored value
 * @param {string} password the password used to encrypt the data
 * @returns {Promise<ArrayBuffer>} a promise for a decrypted value as ArrayBuffer
 * */
declare function getDecryptedKV(namespace: KVNamespace, key: string, password: string, options?: Omit<KVNamespaceGetOptions<"arrayBuffer">, "type">): Promise<ArrayBuffer>;
declare function encryptData(secretData: ArrayBuffer, password: string, iterations?: number): Promise<ArrayBuffer>;
declare function decryptData(encryptedData: ArrayBuffer, password: string): Promise<ArrayBuffer>;
export { putEncryptedKV, getDecryptedKV, encryptData, decryptData };
