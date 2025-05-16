const { expect } = require('chai');
const { Cypher, setupCryptp } = require('./cypher');

setupCryptp(globalThis.crypto);

describe('Cypher', function () {
  it('should encrypt and decrypt data', async function () {
    const data = "super secure data";

    const cypher = new Cypher("password");
    let enc = await cypher.encrypt(new TextEncoder().encode(data));
    let res = await cypher.decrypt(enc);

    res = new TextDecoder().decode(res);
    expect(res).to.deep.equal(data);
  });
});
