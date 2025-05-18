import FDBFactory from "fake-indexeddb/lib/FDBFactory";

// Keep track of open databases and try to reuse them.
let databases = {};

if (typeof window == 'undefined') {  
  // const FDBFactory = require('fake-indexeddb/lib/FDBFactory');
  global.indexedDB = new FDBFactory();
}

export class DB {
  constructor(db) {
    this.db = db;

    // Available callbacks
    this.before_set = (key, val) => { return key, val };
    this.after_get = (val) => { return val };
  }

  // Set key/val in collection
  async set(coll, key, val) {
    const tx = this.db.transaction(coll, 'readwrite');
    const store = tx.objectStore(coll);

    await new Promise((resolve, reject) => {
      // Call before_set callback
      key, val = this.before_set(key, val);
      const req = store.put(val, key);

      req.onsuccess = async () => {
        resolve();
      }

      req.onerror = (event) => {
        reject(event.target.error);
      }

      tx.onerror = (event) => {
        reject(event.target.error);
      }
    });
  }

  // Get key from collection
  async get(coll, key) {
    const tx = this.db.transaction(coll, 'readonly');
    const store = tx.objectStore(coll);

    return new Promise((resolve, reject) => {
      const req = store.get(key);

      req.onsuccess = async () => {
        try {
          // Call after_get callback
          const result = this.after_get(req.result)
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      req.onerror = (event) => {
        reject(event.target.error);
      };

      tx.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
 
  // Get all keys from collection.
  async all(coll) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(coll, 'readonly');
      const store = tx.objectStore(coll);

      let req = store.openCursor();
      let result = []
        
      req.onsuccess = function(event) {
        let cursor = event.target.result;

        if (cursor) {
          result.push({ key: cursor.key, val: cursor.value })
          cursor.continue();
        }
      };

      req.onerror = function (event) {
        reject(event.target.error);
      };

      tx.oncomplete = function() {
        resolve(result);
      };
      
      tx.onerror = function (event) {
        reject(event.target.error);
      };
    });
  }

  // Remove all keys from collection
  async clear(coll) {
    const tx = this.db.transaction(coll, 'readwrite');
    const store = tx.objectStore(coll);

    return new Promise((resolve, reject) => {
      let req = store.clear();

      req.onsuccess = () => {
        resolve();
      };

      req.onerror = (e) => {
        reject(e);    
      };
    });
  }
}

// Open database
export async function open(name) {
  // Check if database is already opened, if yes, use it.
  if (databases[name]) { return databases[name] };

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name);

    req.onsuccess = (event) => {
      const db = new DB(event.target.result);
      databases[name] = db;
      resolve(db);
    };

    req.onerror = (event) => {
      reject(event.target.error);
    };

    req.onupgradeneeded = (event) => {
      const db = event.target.result;

      // TODO: Keep this in constructor.
      if (!db.objectStoreNames.contains('addresses')) {
        db.createObjectStore('addresses');
      }

      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys');
      }
    };
  });
}

// Drop whole database
export function drop(db) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(db)

    req.onsuccess = () => {
      resolve();
    };

    req.onerror = (event) => {
      reject(event.target.error);
    };

    req.onblocked = () => {
      reject(new Error(`Database ${db} is blocked.`));
    };
  });
} 