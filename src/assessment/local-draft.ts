const DRAFT_EXPIRY = 30 * 24 * 60 * 60 * 1000;

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
  const value = await draftOperation('readonly', (store) => store.get('current')) as {draft?: unknown; savedAt?: unknown} | undefined;
  if (value && typeof value.draft === 'string' && typeof value.savedAt === 'number') {
    if (Date.now() - value.savedAt < DRAFT_EXPIRY) return value.draft;
    await clearDeviceDraft();
  }
}

export async function clearDeviceDraft() {
  await draftOperation('readwrite', (store) => store.delete('current'));
}
