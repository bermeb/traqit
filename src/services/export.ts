/**
 * Export Service
 * Handles CSV and ZIP export functionality
 */

import JSZip from 'jszip';
import {saveAs} from 'file-saver';
import {Field, Entry, ExportData} from '../types';
import {getFields, getEntries, getAllImages} from './db';
import {DATA_FORMAT_VERSION, APP_NAME, escapeCsvValue, sanitizeFilename, formatDate} from '../utils';

/**
 * Generate CSV from entries and fields
 */
export async function generateCSV(fields: Field[], entries: Entry[]): Promise<string> {
    if (entries.length === 0) {
        return '';
    }

    // Header row
    const headers = ['Datum', 'Notizen'];
    fields.forEach((field) => {
        headers.push(`${field.name} (${field.unit})`);
    });

    let csv = headers.map(escapeCsvValue).join(',') + '\n';

    // Data rows
    entries.forEach((entry) => {
        const row: string[] = [
            formatDate(entry.date),
            entry.notes || '',
        ];

        fields.forEach((field) => {
            const value = entry.values[field.id];
            row.push(value !== undefined ? String(value) : '');
        });

        csv += row.map(escapeCsvValue).join(',') + '\n';
    });

    return csv;
}

/**
 * Export all data as ZIP with CSV and images
 */
export async function exportAsZip(): Promise<void> {
    try {
        const zip = new JSZip();

        // Get all data from database
        const fields = await getFields();
        const entries = await getEntries();
        const images = await getAllImages();

        // Create export metadata
        const exportData: ExportData = {
            version: DATA_FORMAT_VERSION,
            exportDate: new Date(),
            fields,
            entries,
        };

        // Add metadata JSON
        zip.file('metadata.json', JSON.stringify(exportData, null, 2));

        // Add CSV
        const csv = await generateCSV(fields, entries);
        zip.file('data.csv', csv);

        // Add images
        if (images.length > 0) {
            const imagesFolder = zip.folder('images');
            if (imagesFolder) {
                for (const image of images) {
                    const ext = image.mimeType.split('/')[1] || 'jpg';
                    imagesFolder.file(`${image.entryId}.${ext}`, image.blob);
                }
            }
        }

        // Generate ZIP
        const blob = await zip.generateAsync({type: 'blob'});

        // Download
        const filename = sanitizeFilename(`${APP_NAME}_Backup_${formatDate(new Date())}.zip`);
        saveAs(blob, filename);
    } catch (error) {
        console.error('Export failed:', error);
        throw new Error('Export fehlgeschlagen. Bitte versuche es erneut.');
    }
}

/**
 * Export only CSV (without images)
 */
export async function exportCSV(): Promise<void> {
    try {
        const fields = await getFields();
        const entries = await getEntries();

        const csv = await generateCSV(fields, entries);
        const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});

        const filename = sanitizeFilename(`${APP_NAME}_Export_${formatDate(new Date())}.csv`);
        saveAs(blob, filename);
    } catch (error) {
        console.error('CSV export failed:', error);
        throw new Error('CSV-Export fehlgeschlagen. Bitte versuche es erneut.');
    }
}
