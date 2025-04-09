class DB {
  constructor(db) {
    this.db = db;
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
      console.log('Upgrading database', db);
    };
  });
}
