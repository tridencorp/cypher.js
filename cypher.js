let crypto = null;
let subtle = null;

if (typeof window !== 'undefined') {
  crypto = window.crypto;
  subtle = window.crypto.subtle;
} else {
  crypto = globalThis.crypto
  subtle = globalThis.crypto.subtle;
}

class Password {
  constructor(key, salt) {
    this.key = key;
    this.salt = salt;
  }
};

class CipherText {
  constructor(text, salt, iv) {
    this.text = text;
    this.salt = salt;
    this.iv = iv;
  }
};

export class Cypher {
  constructor(password) {
    const enc = new TextEncoder();
    this.passkey = passwordKey(enc.encode(password));
  }

  async encrypt(data) {
    this.passkey = await this.passkey;

    const algorithm = {
      name: 'AES-GCM',
      iv: rand(12),
      tagLength: 128,
    };

    const text = await subtle.encrypt(algorithm, this.passkey.key, data);
    return new CipherText(text, this.passkey.salt, algorithm.iv)
  }

  async decrypt(cipher) {
    return await subtle.decrypt(
      { name: "AES-GCM", iv: cipher.iv }, this.passkey.key, cipher.text
    );
  }
}

// Derive key from password and use it for AES encryption/decryption
export async function passwordKey(password) {
  const salt = rand(16);

  let key = await subtle.importKey(
    'raw', password, { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']
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

  const deriveKey = await subtle.deriveKey(
    algorithm, key, derived, true, ['encrypt', 'decrypt']
  );
  
  return new Password(deriveKey, salt)
}

function rand(n) {
  return crypto.getRandomValues(new Uint8Array(n));
}
