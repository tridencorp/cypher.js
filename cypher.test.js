const { expect } = require('chai');
const { Cypher, setupCryptp } = require('./aes');

setupCryptp(globalThis.crypto);

describe('Cypher', function () {
  it('should encrypt and decrypt data', async function () {
    const data = new Uint8Array([1, 2, 3]).buffer

    const cypher = new Cypher("password");
    const enc = await cypher.encrypt(data)
    const res = await cypher.decrypt(enc)

    expect(res).to.deep.equal(data);
  });
});
