// Keep track of open databases and try to reuse them.
let databases = {};

class DB {
  constructor(db) {
    this.db = db;

    // Available callbacks
    this.before_set = (key, val) => { return key, val };
    this.after_get = (val) => { return val };
  }

  // Set key/val in collection
  async set(collection, key, val) {
    const tx = this.db.transaction(collection, 'readwrite');
    const store = tx.objectStore(collection);

    await new Promise((resolve, reject) => {
      // Call before_set callback
      key, val = this.before_set(key, val);
      const request = store.put(val, key);

      request.onsuccess = async () => {
        resolve();
      }

      request.onerror = (event) => {
        reject(event.target.error);
      }

      tx.onerror = (event) => {
        reject(event.target.error);
      }
    });
  }

  // Get key from collection
  async get(collection, key) {
    const tx = this.db.transaction(collection, 'readonly');
    const store = tx.objectStore(collection);

    return new Promise((resolve, reject) => {
      const request = store.get(key);

      request.onsuccess = async () => {
        try {
          // Call after_get callback
          const result = this.after_get(request.result)
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };

      tx.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  // Get all keys from collection.
  async all(collection) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(collection, 'readonly');
      const store = tx.objectStore(collection);

      let request = store.openCursor();
      let result = []
        
      request.onsuccess = function(event) {
        let cursor = event.target.result;

        if (cursor) {
          result.push({ key: cursor.key, val: cursor.value })
          cursor.continue();
        }
      };

      request.onerror = function (event) {
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
}

// Open database
export async function open(name, version) {
  // Check if database is already opened, if yes, use it.
  if (databases[name]) { return databases[name] };

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);

    request.onsuccess = (event) => {
      const db = new DB(event.target.result);
      databases[name] = db;
      resolve(db);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('addresses')) {
        db.createObjectStore('addresses');
      }
    };
  });
}

// Drop whole database
export function drop(database) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(database)

    request.onsuccess = () => {
      console.log(`Database ${database} deleted successfully.`);
      resolve();
    };

    request.onerror = (event) => {
      console.error(`Error deleting database ${database}:`, event.target.error);
      reject(event.target.error);
    };

    request.onblocked = () => {
      console.warn(`Database ${database} is blocked. Close all connections.`);
    };
  });
} 