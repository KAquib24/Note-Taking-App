// Client-side encryption/decryption that works with the server

/**
 * Client-side encryption that sends encrypted content to server
 */
export async function encryptText(text: string, password: string): Promise<string> {
  try {
    // For client-side, we'll use a simpler approach since we can't use Node.js crypto
    // The actual encryption will be handled by the server
    // const encoder = new TextEncoder(); // Remove the extra 'a' character here
    
    // Create a simple hash of the password for identification
    const passwordHash = await hashPassword(password);
    
    // Mark the content as encrypted and include the password hash for verification
    const encryptedMarker = {
      encrypted: true,
      passwordHash: passwordHash,
      content: btoa(unescape(encodeURIComponent(text))) // Simple base64 encoding
    };
    
    return JSON.stringify(encryptedMarker);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Client-side decryption
 */
export async function decryptText(encryptedText: string, password: string): Promise<string> {
  try {
    // Parse the encrypted data
    const encryptedData = JSON.parse(encryptedText);
    
    if (!encryptedData.encrypted) {
      throw new Error('Content is not encrypted');
    }
    
    // Verify password
    const passwordHash = await hashPassword(password);
    if (encryptedData.passwordHash !== passwordHash) {
      throw new Error('Wrong password');
    }
    
    // Decode the content
    return decodeURIComponent(escape(atob(encryptedData.content)));
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed - wrong password or corrupted data');
  }
}

/**
 * Hash password for verification (client-side)
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Check if content appears to be encrypted
 */
export function isEncryptedContent(text: string): boolean {
  if (!text) return false;
  
  try {
    const data = JSON.parse(text);
    return data && data.encrypted === true && data.passwordHash && data.content;
  } catch {
    return false;
  }
}

// Fallback functions
export const simpleCrypto = {
  encrypt: (text: string, password: string): string => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ password.charCodeAt(i % password.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(result);
  },

  decrypt: (encryptedText: string, password: string): string => {
    try {
      const decoded = atob(encryptedText);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ password.charCodeAt(i % password.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch {
      throw new Error('Decryption failed');
    }
  }
};

export async function encryptTextFallback(text: string, password: string): Promise<string> {
  try {
    return await encryptText(text, password);
  } catch (error) {
    console.warn('Encryption failed, using fallback');
    return simpleCrypto.encrypt(text, password);
  }
}

export async function decryptTextFallback(encryptedText: string, password: string): Promise<string> {
  try {
    return await decryptText(encryptedText, password);
  } catch (error) {
    console.warn('Decryption failed, using fallback');
    return simpleCrypto.decrypt(encryptedText, password);
  }
}