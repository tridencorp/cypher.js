class DB {
  constructor(db) {
    this.db = db;
  }

  // Set key/value in collection
  async set(collection, key, value) {
    const tx = this.db.transaction(collection, 'readwrite');
    const store = tx.objectStore(collection);

    await new Promise((resolve, reject) => {
      const request = store.put(value, key);

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
        tx.oncomplete = () => resolve(request.result);
      };

      request.onerror = () => {
        reject('Failed to retrieve record');
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
