/**
 * Import Service
 * Handles ZIP import functionality
 */

import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import { ExportData, ImportResult, ImportMode, StoredImage } from '../types';
import { validateExportVersion, DATA_FORMAT_VERSION } from '../utils';
import { addField, addEntry, updateEntry, saveImage, clearAllData } from './db';

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

    // Validate data structure
    const validationErrors: string[] = [];

    if (!exportData.fields || !Array.isArray(exportData.fields)) {
      validationErrors.push('Felder fehlen oder sind ungültig');
    }

    if (!exportData.entries || !Array.isArray(exportData.entries)) {
      validationErrors.push('Einträge fehlen oder sind ungültig');
    }

    // Validate that all field references in entries exist
    if (exportData.fields && exportData.entries) {
      const fieldIds = new Set(exportData.fields.map((f) => f.id));
      for (const entry of exportData.entries) {
        if (entry.values) {
          for (const fieldId of Object.keys(entry.values)) {
            if (!fieldIds.has(fieldId)) {
              validationErrors.push(
                `Eintrag vom ${new Date(entry.date).toLocaleDateString()} referenziert ungültiges Feld: ${fieldId}`
              );
              break; // Only report once per entry
            }
          }
        }
      }
    }

    if (validationErrors.length > 0) {
      return {
        success: false,
        message: `Validierung fehlgeschlagen:\n${validationErrors.join('\n')}`,
      };
    }

    // Clear existing data if overwrite mode
    if (mode === 'overwrite') {
      await clearAllData();
    }

    let fieldsImported = 0;
    let entriesImported = 0;
    let imagesImported = 0;
    const errors: string[] = [];

    // Import fields
    const fieldIdMapping = new Map<string, string>(); // Old ID -> New ID

    for (const field of exportData.fields) {
      try {
        const newId = mode === 'overwrite' ? field.id : uuidv4();
        fieldIdMapping.set(field.id, newId);

        await addField({
          ...field,
          id: newId,
          createdAt: new Date(field.createdAt),
        });
        fieldsImported++;
      } catch (err) {
        const errorMsg = `Feld "${field.name}" konnte nicht importiert werden: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(errorMsg);
        console.warn(errorMsg);
      }
    }

    // Import entries
    const entryIdMapping = new Map<string, string>(); // Old ID -> New ID

    for (const entry of exportData.entries) {
      try {
        const newId = mode === 'overwrite' ? entry.id : uuidv4();
        entryIdMapping.set(entry.id, newId);

        // Remap field IDs in entry values (critical for merge mode)
        const remappedValues: Record<string, number | string> = {};
        for (const [oldFieldId, value] of Object.entries(entry.values)) {
          const newFieldId = fieldIdMapping.get(oldFieldId) || oldFieldId;
          remappedValues[newFieldId] = value;
        }

        // Exclude imageId from entry - it will be set after images are imported
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { imageId, ...entryWithoutImage } = entry;

        await addEntry({
          ...entryWithoutImage,
          id: newId,
          values: remappedValues,
          imageId: undefined, // Don't copy old imageId, will be set after image import
          date: new Date(entry.date),
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
        });
        entriesImported++;
      } catch (err) {
        const errorMsg = `Eintrag vom ${new Date(entry.date).toLocaleDateString()} konnte nicht importiert werden: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(errorMsg);
        console.warn(errorMsg);
      }
    }

    // Import images
    const entryImageMapping = new Map<string, string>(); // New Entry ID -> New Image ID
    const imagesFolder = zip.folder('images');
    if (imagesFolder) {
      const imageFiles = Object.keys(zip.files).filter((name) => name.startsWith('images/') && !zip.files[name].dir);

      for (const imagePath of imageFiles) {
        const imageFile = zip.file(imagePath);
        if (!imageFile) continue;

        try {
          const blob = await imageFile.async('blob');
          const filename = imagePath.split('/').pop();
          if (!filename) continue;

          // Extract old entry ID from filename
          const oldEntryId = filename.split('.')[0];

          // Skip orphaned images (e.g., "temp.jpeg" that don't correspond to any entry)
          if (oldEntryId === 'temp' || !entryIdMapping.has(oldEntryId)) {
            const warningMsg = `Bild "${filename}" übersprungen: Kein zugehöriger Eintrag gefunden`;
            errors.push(warningMsg);
            console.warn(warningMsg);
            continue;
          }

          const newEntryId = entryIdMapping.get(oldEntryId) || oldEntryId;

          // Determine MIME type from extension
          const ext = filename.split('.').pop()?.toLowerCase();
          const mimeType =
            ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

          const newImageId = uuidv4();
          const storedImage: StoredImage = {
            id: newImageId,
            entryId: newEntryId,
            blob,
            mimeType,
            size: blob.size,
            uploadedAt: new Date(),
          };

          await saveImage(storedImage);

          // Track the entry -> image mapping for later update
          entryImageMapping.set(newEntryId, newImageId);

          imagesImported++;
        } catch (err) {
          const errorMsg = `Bild "${imagePath}" konnte nicht importiert werden: ${err instanceof Error ? err.message : String(err)}`;
          errors.push(errorMsg);
          console.warn(errorMsg);
        }
      }
    }

    // Update entries' imageId fields to reference the new imported images
    if (entryImageMapping.size > 0) {
      for (const entry of exportData.entries) {
        const newEntryId = entryIdMapping.get(entry.id);
        if (newEntryId && entry.imageId && entryImageMapping.has(newEntryId)) {
          try {
            const newImageId = entryImageMapping.get(newEntryId);
            await updateEntry(newEntryId, { imageId: newImageId });
          } catch (err) {
            console.warn(`Failed to update imageId for entry ${newEntryId}:`, err);
          }
        }
      }
    }

    // Build result message
    let message = 'Import erfolgreich abgeschlossen.';
    if (errors.length > 0) {
      message += `\n\nWarnungen:\n${errors.slice(0, 5).join('\n')}`;
      if (errors.length > 5) {
        message += `\n... und ${errors.length - 5} weitere Warnungen`;
      }
    }

    // Check if nothing was imported
    if (fieldsImported === 0 && entriesImported === 0 && imagesImported === 0) {
      return {
        success: false,
        message: 'Import fehlgeschlagen: Keine Daten wurden importiert.\n\n' + (errors.length > 0 ? `Fehler:\n${errors.join('\n')}` : 'Unbekannter Fehler.'),
        fieldsImported,
        entriesImported,
        imagesImported,
      };
    }

    return {
      success: true,
      message,
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
