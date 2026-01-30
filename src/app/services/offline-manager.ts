/**
 * Offline Manager for NE-NETRA
 * Handles offline storage of reports and sync logic
 * Uses IndexedDB for storage
 */

const DB_NAME = 'NeNetraOfflineDB';
const STORE_NAME = 'offline_queue';
const DB_VERSION = 1;

interface QueueItem {
    id?: number;
    url: string;
    method: string;
    body: any;
    timestamp: string;
}

class OfflineManager {
    private db: IDBDatabase | null = null;

    constructor() {
        this.initDB();

        // Listen for online status
        window.addEventListener('online', () => {
            console.log('Network restored. Attempting sync...');
            this.sync();
        });
    }

    private initDB() {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('OfflineDB error:', event);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            this.db = (event.target as IDBOpenDBRequest).result;
            console.log('OfflineDB initialized');
        };
    }

    public async queueRequest(url: string, method: string, body: any): Promise<void> {
        if (!this.db) return;

        const item: QueueItem = {
            url,
            method,
            body,
            timestamp: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(item);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    public async getQueueSize(): Promise<number> {
        if (!this.db) return 0;

        return new Promise((resolve) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const countRequest = store.count();

            countRequest.onsuccess = () => resolve(countRequest.result);
            countRequest.onerror = () => resolve(0);
        });
    }

    public async sync(): Promise<void> {
        if (!this.db || !navigator.onLine) return;

        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = async () => {
            const items: QueueItem[] = request.result;
            if (items.length === 0) return;

            console.log(`Syncing ${items.length} offline items...`);

            let syncedCount = 0;
            let district = 'unknown';

            for (const item of items) {
                try {
                    await fetch(item.url, {
                        method: item.method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item.body)
                    });

                    if (item.body.district) district = item.body.district;

                    // Remove from queue on success
                    this.removeItem(item.id!);
                    syncedCount++;
                } catch (error) {
                    console.error('Sync failed for item:', item, error);
                    // Keep in queue to retry later
                }
            }

            if (syncedCount > 0) {
                // Log sync event to backend
                try {
                    await fetch('http://localhost:8000/log-sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            district: district,
                            count: syncedCount
                        })
                    });
                } catch (e) {
                    console.warn("Failed to log sync event", e);
                }
            }
        };
    }

    private removeItem(id: number) {
        if (!this.db) return;
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.delete(id);
    }
}

export const offlineManager = new OfflineManager();
