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
        tx.oncomplete = () => resolve();
      }

      request.onerror = () => {
        reject(request.error);
        tx.onerror = () => reject(tx.error);  
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
        // Call after_get callback 
        const result = this.after_get(request.result)

        tx.oncomplete = () => resolve(result);
      };

      request.onerror = () => {
        reject('Failed to retrieve record');
        tx.onerror = () => reject(tx.error);  
      };
    });
  }

  // Get all keys from collection. TODO: use cursor.
  async all(collection) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(collection, 'readonly');
      const store = transaction.objectStore(collection);

      const request = store.getAll();

      request.onsuccess = () => {
        tx.oncomplete = () => resolve(request.result);
      };

      request.onerror = (event) => {
        reject(event.target.error);
        tx.onerror = () => reject(tx.error);  
      };
    });
  }
}

// Open database
export async function open(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);

    request.onsuccess = (event) => {
      const db = new DB(event.target.result);
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