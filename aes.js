const crypto = window.crypto.subtle;

// PBKDF2 key derivation function
function pbkdf2(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const usages = ['deriveBits', 'deriveKey'];

  return crypto.importKey('raw', data, { name: 'PBKDF2' }, false, usages);
}

// AES-256
function aes(pbkdf2, salt) {
  const algorithm = { name: "PBKDF2", salt: salt, iterations: 100_000, hash: "SHA-256" };
  const derived = { name: "AES-GCM", length: 256 };
  const usages = ['encrypt', 'decrypt'];

  return crypto.deriveKey(algorithm, pbkdf2, derived, true, usages);
}

export class AES {
  constructor(password) {
    this.password = password;
    this.salt = window.crypto.getRandomValues(new Uint8Array(16));

    this.key = null;
    this.aes = null;
  }

  async encrypt(data) {
    try {
      // Make sure that we calculate them only once
      if (!this.key) { this.key = await pbkdf2(this.password) };
      if (!this.aes) { this.aes = await aes(this.key, this.salt) };

      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const algorithm = { name: 'AES-GCM', iv: iv, tagLength: 128 };

      const cypher = await crypto.encrypt(algorithm, this.aes, data);
      return { cypher: cypher, iv: iv, salt: this.salt };
      
    } catch (err) {
      throw new Error(`AES encryption failed: ${err.message}`);
    }
  }

  async decrypt(bytes, iv) {
    try {
      const algorithm = { name: "AES-GCM", iv };
      return await crypto.decrypt(algorithm, this.aes, bytes);

    } catch (err) {
      throw new Error(`AES decryption failed: ${err.message}`);
    }
  }
}
