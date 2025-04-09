const FDBFactory = require('fake-indexeddb/lib/FDBFactory');
global.indexedDB = new FDBFactory();

const { expect } = require('chai');
const { open } = require('./db');

describe('DB', function () {
  let db;

  beforeEach(async function () {    
    db = await open("test", 1);
  });

  it('should add and retrieve an item from the database', async function () {
    const item = { name: 'test item', value: 42 };
    await db.set('addresses', 'key1', item);

    const result = await db.get('addresses', 'key1');

    expect(result.name).to.equal('test item');
    expect(result.value).to.equal(42);
  });
});