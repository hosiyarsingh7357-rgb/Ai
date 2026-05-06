/**
 * Offline Storage Utility
 * Uses IndexedDB to store trade drafts when the user is offline.
 */

const DB_NAME = 'EdgeLogOffline';
const STORE_NAME = 'trade_drafts';
const QUEUE_STORE = 'sync_queue';
const ERROR_STORE = 'error_logs';
const DB_VERSION = 2;

export interface TradeDraft {
  id: string;
  symbol: string;
  entryPrice: number;
  exitPrice?: number;
  size: number;
  side: 'LONG' | 'SHORT';
  status: 'OPEN' | 'CLOSED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncError {
  id: string;
  data: any;
  error: string;
  timestamp: string;
}

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ERROR_STORE)) {
        db.createObjectStore(ERROR_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const offlineStorage = {
  async saveDraft(draft: TradeDraft): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(draft);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getDrafts(): Promise<TradeDraft[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async deleteDraft(id: string): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async clearDrafts(): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async addToQueue(data: any): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(QUEUE_STORE, 'readwrite');
      const store = transaction.objectStore(QUEUE_STORE);
      const request = store.put({ ...data, queuedAt: new Date().toISOString() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getQueue(): Promise<any[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(QUEUE_STORE, 'readonly');
      const store = transaction.objectStore(QUEUE_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async removeFromQueue(id: string): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(QUEUE_STORE, 'readwrite');
      const store = transaction.objectStore(QUEUE_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async addToErrorLog(error: SyncError): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ERROR_STORE, 'readwrite');
      const store = transaction.objectStore(ERROR_STORE);
      const request = store.put(error);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getErrorLogs(): Promise<SyncError[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ERROR_STORE, 'readonly');
      const store = transaction.objectStore(ERROR_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async removeFromErrorLog(id: string): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ERROR_STORE, 'readwrite');
      const store = transaction.objectStore(ERROR_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};
