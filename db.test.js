const FDBFactory = require('fake-indexeddb/lib/FDBFactory');
global.indexedDB = new FDBFactory();

const { expect } = require('chai');
const { open } = require('./db');

describe('DB', function () {
  let db;

  beforeEach(async function () {    
    db = await open("test", 1);
  });

  it('should set and get keys from database', async function () {
    for (let i = 0; i < 1_000; i++) {
      const item = { name: `key_${i}`, value: i };
      await db.set('addresses', `key_${i}`, item);
    }

    for (let i = 0; i < 1_000; i++) {
      const result = await db.get('addresses', `key_${i}`);

      expect(result.name).to.equal(`key_${i}`);
      expect(result.value).to.equal(i);
    }
  });

  it('should get all keys from collection', async function () {
    for (let i = 0; i < 1_000; i++) {
      const item = { name: `key_${i}`, value: i };
      await db.set('addresses', `key_${i}`, item);
    }

    const result = await db.all('addresses');
    expect(result.length).to.equal(1000);

    for (let i = 0; i < 1_000; i++) {
      expect(result[i][1].name).to.equal(result[i][0]);
    }
  });
});
