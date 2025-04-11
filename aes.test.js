const { expect } = require('chai');
const { AES } = require('./aes');

describe('AES', function () {
  it('should encrypt and decrypt data', async function () {
    const aes = new AES();
    const data = new Uint8Array([1, 2, 3]).buffer
    const enc = await aes.encrypt(data);

    const result = await aes.decrypt(enc.cipher, enc.iv.buffer);
    expect(result).to.deep.equal(data);
  });
});
