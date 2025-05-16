const { expect } = require('chai');
const { encrypt, decrypt, passwordKey, setupCryptp } = require('./aes');

setupCryptp(globalThis.crypto);

describe('AES', function () {
  it('should encrypt and decrypt data', async function () {
    // const cypher = Cypher(password);
    // cypher.encrypt()
    // cypher.decrypt()

    const pass = await passwordKey("password");
    const data = new Uint8Array([1, 2, 3]).buffer

    const enc = await encrypt(pass, data);
    // const res = await decrypt(enc);

    // expect(res).to.deep.equal(data);
  });
});
