const crypto = window.crypto.subtle;

// PBKDF2 key derivation function
function pbkdf2(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  return crypto.importKey('raw', data, { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']);
}

function aes(pbkdf2, salt) {
  const algorithm = { name: "PBKDF2", salt: salt, iterations: 100_000, hash: "SHA-256" };
  const derived = { name: "AES-GCM", length: 256 };
  const usages = ['encrypt', 'decrypt'];

  return crypto.deriveKey(algorithm, pbkdf2, derived, true, usages);
}

export class AES {
  constructor(password) {
    this.password = password;
    this.salt = new ArrayBuffer();
    this.iv = window.crypto.getRandomValues(new Uint8Array(12));

    this.key = null;
    this.aes = null;
  }

  async encrypt(data) {
    // Make sure that we calculate them only once
    if (!this.key) { this.key = await pbkdf2(this.password) };
    if (!this.aes) { this.aes = await aes(this.key, this.salt) };

    const algorithm = { name: 'AES-GCM', iv: this.iv, additionalData: new Uint8Array(), tagLength: 128 };

    return crypto.encrypt(algorithm, this.aes, data)
  }
}
