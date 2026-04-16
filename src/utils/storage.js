// Storage utilities for LocalStorage/IndexedDB
const DB_NAME = 'ShelterSearchDB';
const STORE_NAMES = {
  USERS: 'users',
  ROOMS: 'rooms',
  FAVORITES: 'favorites'
};

// Initialize IndexedDB
let db = null;

const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      // Create users store
      if (!database.objectStoreNames.contains(STORE_NAMES.USERS)) {
        const userStore = database.createObjectStore(STORE_NAMES.USERS, { keyPath: 'id' });
        userStore.createIndex('email', 'email', { unique: true });
      }

      // Create rooms store
      if (!database.objectStoreNames.contains(STORE_NAMES.ROOMS)) {
        database.createObjectStore(STORE_NAMES.ROOMS, { keyPath: 'id' });
      }

      // Create favorites store
      if (!database.objectStoreNames.contains(STORE_NAMES.FAVORITES)) {
        database.createObjectStore(STORE_NAMES.FAVORITES, { keyPath: 'id' });
      }
    };
  });
};

// Storage operations
export const Storage = {
  // Users
  async addUser(user) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAMES.USERS, 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.USERS);
      const request = store.add(user);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async getUserByEmail(email) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAMES.USERS, 'readonly');
      const store = transaction.objectStore(STORE_NAMES.USERS);
      const index = store.index('email');
      const request = index.get(email);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async getAllUsers() {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAMES.USERS, 'readonly');
      const store = transaction.objectStore(STORE_NAMES.USERS);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async updateUser(user) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAMES.USERS, 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.USERS);
      const request = store.put(user);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  // Rooms
  async addRoom(room) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAMES.ROOMS, 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.ROOMS);
      const request = store.add(room);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async updateRoom(room) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAMES.ROOMS, 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.ROOMS);
      const request = store.put(room);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async deleteRoom(roomId) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAMES.ROOMS, 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.ROOMS);
      const request = store.delete(roomId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async getRoomById(roomId) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAMES.ROOMS, 'readonly');
      const store = transaction.objectStore(STORE_NAMES.ROOMS);
      const request = store.get(roomId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async getAllRooms() {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAMES.ROOMS, 'readonly');
      const store = transaction.objectStore(STORE_NAMES.ROOMS);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async getRoomsByOwnerId(ownerId) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAMES.ROOMS, 'readonly');
      const store = transaction.objectStore(STORE_NAMES.ROOMS);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const rooms = request.result.filter(room => room.ownerId === ownerId);
        resolve(rooms);
      };
    });
  },

  // Favorites
  async addFavorite(favorite) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAMES.FAVORITES, 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.FAVORITES);
      const request = store.add(favorite);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async removeFavorite(favoriteId) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAMES.FAVORITES, 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.FAVORITES);
      const request = store.delete(favoriteId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async getFavoritesByUserId(userId) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAMES.FAVORITES, 'readonly');
      const store = transaction.objectStore(STORE_NAMES.FAVORITES);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const favorites = request.result.filter(fav => fav.userId === userId);
        resolve(favorites);
      };
    });
  }
};

export default Storage;
