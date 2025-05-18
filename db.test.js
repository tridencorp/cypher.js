import { expect } from 'chai';
import { open } from './db.js';

describe('DB', function () {
  let db;

  beforeEach(async function () {    
    db = await open("test");
  });

  it('should set and get keys from database', async function () {
    const key = (i) => `key_${i}`;

    for (let i = 0; i < 1_000; i++) {
      const item = { name: key(i), value: i };
      await db.set('addresses', key(i), item);
    }

    for (let i = 0; i < 1_000; i++) {
      const res = await db.get('addresses', key(i));

      expect(res.name).to.equal(key(i));
      expect(res.value).to.equal(i);
    }
  });

  it('should get all keys from collection', async function () {
    const key = (id) => `key_${id}`;

    for (let i = 0; i < 1_000; i++) {
      const item = { name: key(i), value: i };
      await db.set('addresses', key(i), item);
    }

    const result = await db.all('addresses');
    expect(result.length).to.equal(1000);

    for (let i = 0; i < 1_000; i++) {
      expect(result[i].val.name).to.equal(result[i].key);
    }
  });
});
