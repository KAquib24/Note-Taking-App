import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  salt: string;
}

/**
 * Derive a key from a password using PBKDF2
 */
const deriveKey = (password: string, salt: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      100000,
      KEY_LENGTH,
      'sha512',
      (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      }
    );
  });
};

/**
 * Encrypt text with a password
 */
export const encrypt = async (text: string, password: string): Promise<string> => {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    const key = await deriveKey(password, salt.toString('hex'));
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine all components into a single string
    const encryptedData: EncryptedData = {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      salt: salt.toString('hex')
    };
    
    return Buffer.from(JSON.stringify(encryptedData)).toString('base64');
  } catch (error: any) {
    throw new Error('Encryption failed: ' + error.message);
  }
};

/**
 * Decrypt text with a password
 */
export const decrypt = async (encryptedText: string, password: string): Promise<string> => {
  try {
    // Parse the encrypted data
    const encryptedData: EncryptedData = JSON.parse(
      Buffer.from(encryptedText, 'base64').toString('utf8')
    );
    
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const salt = Buffer.from(encryptedData.salt, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    const encrypted = encryptedData.encrypted;
    
    const key = await deriveKey(password, salt.toString('hex'));
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error: any) {
    throw new Error('Decryption failed: ' + error.message);
  }
};

/**
 * Check if text is encrypted (by checking the structure)
 */
export const isEncrypted = (text: string): boolean => {
  try {
    const data = JSON.parse(Buffer.from(text, 'base64').toString('utf8'));
    return data && data.encrypted && data.iv && data.tag && data.salt;
  } catch {
    return false;
  }
};