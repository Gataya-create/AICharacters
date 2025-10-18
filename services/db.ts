
import { Character, Background } from '../types';

const DB_NAME = 'AIStoryboardDB';
const DB_VERSION = 2;
const CHARACTER_STORE_NAME = 'characters';
const BACKGROUND_STORE_NAME = 'backgrounds';

let db: IDBDatabase;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject('IndexedDB error');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(CHARACTER_STORE_NAME)) {
        db.createObjectStore(CHARACTER_STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(BACKGROUND_STORE_NAME)) {
        db.createObjectStore(BACKGROUND_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// Character DB Functions
export const getCharactersDB = (): Promise<Character[]> => {
  return new Promise(async (resolve, reject) => {
    try {
        const db = await initDB();
        const transaction = db.transaction(CHARACTER_STORE_NAME, 'readonly');
        const store = transaction.objectStore(CHARACTER_STORE_NAME);
        const request = store.getAll();

        request.onerror = () => {
          console.error("Error fetching characters from DB:", request.error);
          reject('Error fetching characters');
        };

        request.onsuccess = () => {
          const sorted = request.result.sort((a, b) => b.id.localeCompare(a.id));
          resolve(sorted);
        };
    } catch(error) {
        console.error("Failed to initiate DB transaction for getting characters:", error);
        reject(error);
    }
  });
};

export const addCharacterDB = (character: Character): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
        const db = await initDB();
        const transaction = db.transaction(CHARACTER_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(CHARACTER_STORE_NAME);
        const request = store.add(character);

        request.onerror = () => {
          console.error("Error adding character to DB:", request.error);
          reject('Error adding character');
        };

        request.onsuccess = () => {
          resolve();
        };
    } catch(error) {
        console.error("Failed to initiate DB transaction for adding character:", error);
        reject(error);
    }
  });
};

export const updateCharacterDB = (character: Character): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
        const db = await initDB();
        const transaction = db.transaction(CHARACTER_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(CHARACTER_STORE_NAME);
        const request = store.put(character);

        request.onerror = () => {
          console.error("Error updating character in DB:", request.error);
          reject('Error updating character');
        };

        request.onsuccess = () => {
          resolve();
        };
    } catch(error) {
        console.error("Failed to initiate DB transaction for updating character:", error);
        reject(error);
    }
  });
};

export const deleteCharacterDB = (id: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
        const db = await initDB();
        const transaction = db.transaction(CHARACTER_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(CHARACTER_STORE_NAME);
        const request = store.delete(id);

        request.onerror = () => {
          console.error("Error deleting character from DB:", request.error);
          reject('Error deleting character');
        };

        request.onsuccess = () => {
          resolve();
        };
    } catch(error) {
        console.error("Failed to initiate DB transaction for deleting character:", error);
        reject(error);
    }
  });
};

// Background DB Functions
export const getBackgroundsDB = (): Promise<Background[]> => {
  return new Promise(async (resolve, reject) => {
    try {
        const db = await initDB();
        const transaction = db.transaction(BACKGROUND_STORE_NAME, 'readonly');
        const store = transaction.objectStore(BACKGROUND_STORE_NAME);
        const request = store.getAll();

        request.onerror = () => {
          console.error("Error fetching backgrounds from DB:", request.error);
          reject('Error fetching backgrounds');
        };

        request.onsuccess = () => {
          const sorted = request.result.sort((a, b) => b.id.localeCompare(a.id));
          resolve(sorted);
        };
    } catch(error) {
        console.error("Failed to initiate DB transaction for getting backgrounds:", error);
        reject(error);
    }
  });
};

export const addBackgroundDB = (background: Background): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
        const db = await initDB();
        const transaction = db.transaction(BACKGROUND_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(BACKGROUND_STORE_NAME);
        const request = store.add(background);

        request.onerror = () => {
          console.error("Error adding background to DB:", request.error);
          reject('Error adding background');
        };

        request.onsuccess = () => {
          resolve();
        };
    } catch(error) {
        console.error("Failed to initiate DB transaction for adding background:", error);
        reject(error);
    }
  });
};

export const updateBackgroundDB = (background: Background): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
        const db = await initDB();
        const transaction = db.transaction(BACKGROUND_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(BACKGROUND_STORE_NAME);
        const request = store.put(background);

        request.onerror = () => {
          console.error("Error updating background in DB:", request.error);
          reject('Error updating background');
        };

        request.onsuccess = () => {
          resolve();
        };
    } catch(error) {
        console.error("Failed to initiate DB transaction for updating background:", error);
        reject(error);
    }
  });
};

export const deleteBackgroundDB = (id: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
        const db = await initDB();
        const transaction = db.transaction(BACKGROUND_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(BACKGROUND_STORE_NAME);
        const request = store.delete(id);

        request.onerror = () => {
          console.error("Error deleting background from DB:", request.error);
          reject('Error deleting background');
        };

        request.onsuccess = () => {
          resolve();
        };
    } catch(error) {
        console.error("Failed to initiate DB transaction for deleting background:", error);
        reject(error);
    }
  });
};
