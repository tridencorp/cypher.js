let crypto = null;
let subtle = null;

if (typeof window !== 'undefined') {
  crypto = window.crypto;
  subtle = window.crypto.subtle;
}

export function setupCryptp(lib) {
  crypto = lib;
  subtle = lib.subtle;
}

// Encode/Decode data with password
export class Cypher {
  constructor(password) {

  }
}

// Derive key from password and use it for AES encryption/decryption
async function passwordKey(password, salt) {
  const enc = new TextEncoder();
  const pass = enc.encode(password);

  let key = await subtle.importKey(
    'raw', pass, { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']
  );

  const algorithm = {
    name: "PBKDF2",
    salt: salt,
    iterations: 100_000,
    hash: "SHA-256"
  };

  const derived = {
    name: "AES-GCM",
    length: 256
  };

  return subtle.deriveKey(
    algorithm, key, derived, true, ['encrypt', 'decrypt']
  );
}

function rand(n) {
  return crypto.getRandomValues(new Uint8Array(n));
}

export class AES {
  constructor() {
    this.key = null;
    this.salt = rand(16);
  }

  async encrypt(data, password) {
    try {
      this.key = await passwordKey(password, this.salt);

      const algorithm = {
        name: 'AES-GCM',
        iv: rand(12),
        tagLength: 128,
      };

      const cipher = await subtle.encrypt(algorithm, this.key, data);
      return { cipher: cipher, iv: algorithm.iv, salt: this.salt };

    } catch (err) {
      throw new Error(`AES encryption failed: ${err.message}`);
    }
  }

  async decrypt(cipher, iv) {
    try {
      const algorithm = { name: "AES-GCM", iv };
      return await subtle.decrypt(algorithm, this.key, cipher);

    } catch (err) {
      throw new Error(`AES decryption failed: ${err.message}`);
    }
  }
}
