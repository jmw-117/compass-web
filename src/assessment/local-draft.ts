import {decodeDraft, draftLifetime} from './draft-format.ts';

async function openDraftStore(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('silverspark-compass', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('local-drafts');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Draft storage is in use by another tab.'));
  });
}

async function draftOperation(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest): Promise<unknown> {
  const database = await openDraftStore();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction('local-drafts', mode);
      const request = operation(transaction.objectStore('local-drafts'));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export async function saveDeviceDraft(draft: string) {
  await draftOperation('readwrite', (store) => store.put({draft, savedAt: Date.now()}, 'current'));
}

export async function restoreDeviceDraft(): Promise<string | undefined> {
  const database = await openDraftStore();
  try {
    return await new Promise<string | undefined>((resolve,reject) => {
      // Read and remove invalid data in one transaction so another tab's newer save survives.
      const tx = database.transaction('local-drafts','readwrite');
      const store = tx.objectStore('local-drafts');
      const request = store.get('current');
      let draft: string | undefined;
      request.onsuccess = () => {
        const value = request.result;
        if (!value) return;
        try {
          const age = Date.now() - value.savedAt;
          if (!Number.isFinite(age) || age < 0 || age >= draftLifetime || typeof value.draft !== 'string') throw Error('Invalid draft');
          decodeDraft(value.draft);
          draft = value.draft;
        } catch {store.delete('current');}
      };
      tx.oncomplete = () => resolve(draft);
      tx.onabort = () => reject(tx.error);
      tx.onerror = () => reject(tx.error);
    });
  } finally {database.close();}
}

export async function clearDeviceDraft() {
  await draftOperation('readwrite', (store) => store.delete('current'));
}
