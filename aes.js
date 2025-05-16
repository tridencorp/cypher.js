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
    // this.passwordKey = await passwordKey(password)
  }
}

class Password {
  constructor(key, salt) {
    this.key = key;
    this.salt = salt;
  }
};

// Derive key from password and use it for AES encryption/decryption
export async function passwordKey(password) {
  const enc = new TextEncoder();
  const pass = enc.encode(password);
  const salt = rand(16);

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

  const deriveKey = await subtle.deriveKey(
    algorithm, key, derived, true, ['encrypt', 'decrypt']
  );
  
  return new Password(deriveKey, salt)
}

function rand(n) {
  return crypto.getRandomValues(new Uint8Array(n));
}

export async function encrypt(password, data) {
  const algorithm = {
    name: 'AES-GCM',
    iv: rand(12),
    tagLength: 128,
  };

  const cipher = await subtle.encrypt(algorithm, password.key, data);
  return { cipher: cipher, iv: algorithm.iv, key: password.key };
}

export async function decrypt(cipher) {
  // const algorithm = { name: "AES-GCM", iv: cipher.iv };
  // return await subtle.decrypt(algorithm, cipher.key, cipher.cipher);
}
