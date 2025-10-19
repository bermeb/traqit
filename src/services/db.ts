/**
 * IndexedDB Service
 * Handles all database operations for Fields, Entries, Images, and View Configurations
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Field, Entry, StoredImage, ViewConfiguration } from '../types';

const DB_NAME = 'traqit-db';
const DB_VERSION = 2;

interface TraqItDB extends DBSchema {
  fields: {
    key: string;
    value: Field;
    indexes: { 'by-order': number };
  };
  entries: {
    key: string;
    value: Entry;
    indexes: { 'by-date': Date };
  };
  images: {
    key: string;
    value: StoredImage;
    indexes: { 'by-entry': string };
  };
  viewConfigs: {
    key: string;
    value: ViewConfiguration;
    indexes: { 'by-order': number };
  };
}

let dbInstance: IDBPDatabase<TraqItDB> | null = null;

/**
 * Initialize the database
 */
export async function initDB(): Promise<IDBPDatabase<TraqItDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<TraqItDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create Fields store
      if (!db.objectStoreNames.contains('fields')) {
        const fieldStore = db.createObjectStore('fields', { keyPath: 'id' });
        fieldStore.createIndex('by-order', 'order');
      }

      // Create Entries store
      if (!db.objectStoreNames.contains('entries')) {
        const entryStore = db.createObjectStore('entries', { keyPath: 'id' });
        entryStore.createIndex('by-date', 'date');
      }

      // Create Images store
      if (!db.objectStoreNames.contains('images')) {
        const imageStore = db.createObjectStore('images', { keyPath: 'id' });
        imageStore.createIndex('by-entry', 'entryId');
      }

      // Create View Configurations store
      if (!db.objectStoreNames.contains('viewConfigs')) {
        const viewConfigStore = db.createObjectStore('viewConfigs', { keyPath: 'id' });
        viewConfigStore.createIndex('by-order', 'order');
      }
    },
  });

  return dbInstance;
}

/**
 * Get database instance
 */
async function getDB(): Promise<IDBPDatabase<TraqItDB>> {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
}

// ==================== FIELD OPERATIONS ====================

/**
 * Add a new field
 */
export async function addField(field: Field): Promise<void> {
  const db = await getDB();
  await db.add('fields', field);
}

/**
 * Get all fields
 */
export async function getFields(): Promise<Field[]> {
  const db = await getDB();
  return await db.getAllFromIndex('fields', 'by-order');
}

/**
 * Get a single field by ID
 */
export async function getField(id: string): Promise<Field | undefined> {
  const db = await getDB();
  return await db.get('fields', id);
}

/**
 * Update a field
 */
export async function updateField(id: string, updates: Partial<Field>): Promise<void> {
  const db = await getDB();
  const field = await db.get('fields', id);
  if (!field) {
    throw new Error(`Field with id ${id} not found`);
  }
  const updatedField = { ...field, ...updates };
  await db.put('fields', updatedField);
}

/**
 * Delete a field
 */
export async function deleteField(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('fields', id);
}

/**
 * Reorder fields
 */
export async function reorderFields(fieldIds: string[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('fields', 'readwrite');

  await Promise.all(
    fieldIds.map(async (id, index) => {
      const field = await tx.store.get(id);
      if (field) {
        field.order = index;
        await tx.store.put(field);
      }
    })
  );

  await tx.done;
}

// ==================== ENTRY OPERATIONS ====================

/**
 * Add a new entry
 */
export async function addEntry(entry: Entry): Promise<void> {
  const db = await getDB();
  await db.add('entries', entry);
}

/**
 * Get all entries
 */
export async function getEntries(): Promise<Entry[]> {
  const db = await getDB();
  return await db.getAllFromIndex('entries', 'by-date');
}

/**
 * Get a single entry by ID
 */
export async function getEntry(id: string): Promise<Entry | undefined> {
  const db = await getDB();
  return await db.get('entries', id);
}

/**
 * Get entries by date range
 */
export async function getEntriesByDateRange(startDate: Date, endDate: Date): Promise<Entry[]> {
  const db = await getDB();
  const allEntries = await db.getAllFromIndex('entries', 'by-date');

  return allEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

/**
 * Update an entry
 */
export async function updateEntry(id: string, updates: Partial<Entry>): Promise<void> {
  const db = await getDB();
  const entry = await db.get('entries', id);
  if (!entry) {
    throw new Error(`Entry with id ${id} not found`);
  }
  const updatedEntry = { ...entry, ...updates, updatedAt: new Date() };
  await db.put('entries', updatedEntry);
}

/**
 * Delete an entry
 */
export async function deleteEntry(id: string): Promise<void> {
  const db = await getDB();

  // Get entry to find associated image
  const entry = await db.get('entries', id);

  // Delete associated image if exists
  if (entry?.imageId) {
    await deleteImage(entry.imageId);
  }

  // Delete entry
  await db.delete('entries', id);
}

// ==================== IMAGE OPERATIONS ====================

/**
 * Save an image
 */
export async function saveImage(image: StoredImage): Promise<void> {
  const db = await getDB();
  await db.add('images', image);
}

/**
 * Get an image by ID
 */
export async function getImage(id: string): Promise<StoredImage | undefined> {
  const db = await getDB();
  return await db.get('images', id);
}

/**
 * Get image by entry ID
 */
export async function getImageByEntryId(entryId: string): Promise<StoredImage | undefined> {
  const db = await getDB();
  const images = await db.getAllFromIndex('images', 'by-entry', entryId);
  return images[0];
}

/**
 * Delete an image
 */
export async function deleteImage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('images', id);
}

/**
 * Get all images
 */
export async function getAllImages(): Promise<StoredImage[]> {
  const db = await getDB();
  return await db.getAll('images');
}

// ==================== UTILITY OPERATIONS ====================

/**
 * Clear all data from the database
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['fields', 'entries', 'images', 'viewConfigs'], 'readwrite');

  await Promise.all([
    tx.objectStore('fields').clear(),
    tx.objectStore('entries').clear(),
    tx.objectStore('images').clear(),
    tx.objectStore('viewConfigs').clear(),
  ]);

  await tx.done;
}

/**
 * Get database statistics
 */
export async function getDBStats(): Promise<{
  fieldsCount: number;
  entriesCount: number;
  imagesCount: number;
}> {
  const db = await getDB();

  const [fieldsCount, entriesCount, imagesCount] = await Promise.all([
    db.count('fields'),
    db.count('entries'),
    db.count('images'),
  ]);

  return { fieldsCount, entriesCount, imagesCount };
}

// ==================== VIEW CONFIGURATION OPERATIONS ====================

/**
 * Add a new view configuration
 */
export async function addViewConfig(config: ViewConfiguration): Promise<void> {
  const db = await getDB();
  await db.add('viewConfigs', config);
}

/**
 * Get all view configurations
 */
export async function getViewConfigs(): Promise<ViewConfiguration[]> {
  const db = await getDB();
  return await db.getAllFromIndex('viewConfigs', 'by-order');
}

/**
 * Get a single view configuration by ID
 */
export async function getViewConfig(id: string): Promise<ViewConfiguration | undefined> {
  const db = await getDB();
  return await db.get('viewConfigs', id);
}

/**
 * Update a view configuration
 */
export async function updateViewConfig(
  id: string,
  updates: Partial<ViewConfiguration>
): Promise<void> {
  const db = await getDB();
  const config = await db.get('viewConfigs', id);
  if (!config) {
    throw new Error(`View configuration with id ${id} not found`);
  }
  const updatedConfig = { ...config, ...updates, updatedAt: new Date() };
  await db.put('viewConfigs', updatedConfig);
}

/**
 * Delete a view configuration
 */
export async function deleteViewConfig(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('viewConfigs', id);
}

/**
 * Check if a field is used in any view configuration
 */
export async function getViewConfigsUsingField(fieldId: string): Promise<ViewConfiguration[]> {
  const db = await getDB();
  const allConfigs = await db.getAll('viewConfigs');
  return allConfigs.filter((config) => config.fieldIds.includes(fieldId));
}
