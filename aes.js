// For node.js
let crypto = globalThis.crypto;
let subtle = globalThis.crypto.subtle;

// For browser
if (typeof window !== 'undefined') {
  crypto = window.crypto;
  subtle = window.crypto.subtle;
} 

// PBKDF2 key derivation function
function pbkdf2(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const usages = ['deriveBits', 'deriveKey'];

  return subtle.importKey('raw', data, { name: 'PBKDF2' }, false, usages);
}

// AES-256
function aes(pbkdf2, salt) {
  const algorithm = { name: "PBKDF2", salt: salt, iterations: 100_000, hash: "SHA-256" };
  const derived = { name: "AES-GCM", length: 256 };
  const usages = ['encrypt', 'decrypt'];
  
  return subtle.deriveKey(algorithm, pbkdf2, derived, true, usages);
}

// AES class. We are using AES-256 together with PBKDF2.
export class AES {
  constructor() {
    this.salt = crypto.getRandomValues(new Uint8Array(16));

    this.key = null;
    this.aes = null;
  }

  async encrypt(data, password) {
    try {
      // Make sure that we calculate them only once
      if (!this.key) { this.key = await pbkdf2(password) };
      if (!this.aes) { this.aes = await aes(this.key, this.salt) };

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const algorithm = { name: 'AES-GCM', iv: iv, tagLength: 128 };

      const cipher = await subtle.encrypt(algorithm, this.aes, data);
      return { cipher: cipher, iv: iv, salt: this.salt };

    } catch (err) {
      throw new Error(`AES encryption failed: ${err.message}`);
    }
  }
  
  async decrypt(bytes, iv) {
    try {
      const algorithm = { name: "AES-GCM", iv };
      return await subtle.decrypt(algorithm, this.aes, bytes);

    } catch (err) {
      throw new Error(`AES decryption failed: ${err.message}`);
    }
  }
}
