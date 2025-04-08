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

    this.key = null;
    this.aes = null;
  }

  async encrypt() {
    // Make sure that we calculate them only once
    if(!this.key) { this.key = await pbkdf2(this.password); } 
    if(!this.aes) { this.aes = await aes(this.key, new ArrayBuffer()); } 

  }
}
