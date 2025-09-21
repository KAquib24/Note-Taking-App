import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'encryption_keys';

// Store encryption keys for notes (in a real app, use more secure storage)
const getStoredKeys = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const setStoredKeys = (keys: Record<string, string>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
};

/**
 * Encrypt text with a password
 */
export const encryptText = (text: string, password: string): string => {
  try {
    return CryptoJS.AES.encrypt(text, password).toString();
  } catch (error: any) {
    throw new Error('Encryption failed: ' + error.message);
  }
};

/**
 * Decrypt text with a password
 */
export const decryptText = (encryptedText: string, password: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Decryption failed - wrong password or corrupted data');
    }
    
    return decrypted;
  } catch (error: any) {
    throw new Error('Decryption failed: ' + error.message);
  }
};

/**
 * Check if content appears to be encrypted
 */
export const isEncryptedContent = (content: string): boolean => {
  // Simple heuristic: encrypted content typically has a specific pattern
  return content.startsWith('U2FsdGVkX1') || // Common CryptoJS prefix
         /^[A-Za-z0-9+/=]+$/.test(content) && content.length % 4 === 0; // Base64 pattern
};

/**
 * Store encryption key for a note
 */
export const storeEncryptionKey = (noteId: string, key: string) => {
  const keys = getStoredKeys();
  keys[noteId] = key;
  setStoredKeys(keys);
};

/**
 * Retrieve encryption key for a note
 */
export const getEncryptionKey = (noteId: string): string | null => {
  const keys = getStoredKeys();
  return keys[noteId] || null;
};

/**
 * Remove encryption key for a note
 */
export const removeEncryptionKey = (noteId: string) => {
  const keys = getStoredKeys();
  delete keys[noteId];
  setStoredKeys(keys);
};