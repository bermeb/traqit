/**
 * Import Service
 * Handles ZIP import functionality
 */

import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import { ExportData, ImportResult, ImportMode, StoredImage } from '../types';
import { validateExportVersion, DATA_FORMAT_VERSION } from '../utils';
import { addField, addEntry, saveImage, clearAllData } from './db';

/**
 * Import data from ZIP file
 */
export async function importFromZip(file: File, mode: ImportMode = 'merge'): Promise<ImportResult> {
  try {
    // Load ZIP
    const zip = await JSZip.loadAsync(file);

    // Read metadata
    const metadataFile = zip.file('metadata.json');
    if (!metadataFile) {
      return {
        success: false,
        message: 'Ungültige Backup-Datei: metadata.json nicht gefunden.',
      };
    }

    const metadataContent = await metadataFile.async('string');
    const exportData: ExportData = JSON.parse(metadataContent);

    // Validate version
    if (!validateExportVersion(exportData.version)) {
      return {
        success: false,
        message: `Inkompatible Version: ${exportData.version}. Aktuelle Version: ${DATA_FORMAT_VERSION}`,
      };
    }

    // Clear existing data if overwrite mode
    if (mode === 'overwrite') {
      await clearAllData();
    }

    let fieldsImported = 0;
    let entriesImported = 0;
    let imagesImported = 0;

    // Import fields
    for (const field of exportData.fields) {
      try {
        await addField({
          ...field,
          id: mode === 'overwrite' ? field.id : uuidv4(), // Generate new IDs in merge mode
          createdAt: new Date(field.createdAt),
        });
        fieldsImported++;
      } catch (err) {
        console.warn('Failed to import field:', field.name, err);
      }
    }

    // Import entries
    const entryIdMapping = new Map<string, string>(); // Old ID -> New ID

    for (const entry of exportData.entries) {
      try {
        const newId = mode === 'overwrite' ? entry.id : uuidv4();
        entryIdMapping.set(entry.id, newId);

        await addEntry({
          ...entry,
          id: newId,
          date: new Date(entry.date),
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
        });
        entriesImported++;
      } catch (err) {
        console.warn('Failed to import entry:', entry.id, err);
      }
    }

    // Import images
    const imagesFolder = zip.folder('images');
    if (imagesFolder) {
      const imageFiles = Object.keys(zip.files).filter((name) => name.startsWith('images/'));

      for (const imagePath of imageFiles) {
        const imageFile = zip.file(imagePath);
        if (!imageFile) continue;

        try {
          const blob = await imageFile.async('blob');
          const filename = imagePath.split('/').pop();
          if (!filename) continue;

          // Extract old entry ID from filename
          const oldEntryId = filename.split('.')[0];
          const newEntryId = entryIdMapping.get(oldEntryId) || oldEntryId;

          // Determine MIME type from extension
          const ext = filename.split('.').pop()?.toLowerCase();
          const mimeType =
            ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

          const storedImage: StoredImage = {
            id: uuidv4(),
            entryId: newEntryId,
            blob,
            mimeType,
            size: blob.size,
            uploadedAt: new Date(),
          };

          await saveImage(storedImage);
          imagesImported++;
        } catch (err) {
          console.warn('Failed to import image:', imagePath, err);
        }
      }
    }

    return {
      success: true,
      message: 'Import erfolgreich abgeschlossen.',
      fieldsImported,
      entriesImported,
      imagesImported,
    };
  } catch (error) {
    console.error('Import failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Import fehlgeschlagen.',
    };
  }
}
