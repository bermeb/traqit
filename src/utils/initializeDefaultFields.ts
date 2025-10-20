/**
 * Initialize Default Fields
 * Creates default fields on first app start after update
 */

import { addField, getFields } from '../services/db';
import { DEFAULT_FIELDS, STORAGE_KEYS } from './constants';

/**
 * Initialize default fields if not already created
 * Returns true if fields were created, false if they were already initialized before
 */
export async function initializeDefaultFields(): Promise<boolean> {
  // Check if default fields have already been initialized
  const alreadyInitialized = localStorage.getItem(STORAGE_KEYS.INITIAL_FIELDS_CREATED);

  if (alreadyInitialized === 'true') {
    return false;
  }

  // Mark as initialized IMMEDIATELY to prevent race conditions
  // (React Strict Mode calls useEffect twice in development)
  localStorage.setItem(STORAGE_KEYS.INITIAL_FIELDS_CREATED, 'true');

  // Create default fields (even if other fields already exist)
  console.log('Creating default fields...');

  try {
    // Get existing fields to determine starting order and check for duplicates
    const existingFields = await getFields();
    let order = existingFields.length;

    // Create a set of existing field names (lowercase) to check for duplicates
    const existingFieldNames = new Set(
      existingFields.map((f) => f.name.toLowerCase())
    );

    // Track how many fields we actually create
    let createdCount = 0;

    for (const defaultField of DEFAULT_FIELDS) {
      // Check if field with this name already exists
      const fieldNameLower = defaultField.name.toLowerCase();

      if (!existingFieldNames.has(fieldNameLower)) {
        // Determine goalDirection based on field name
        let goalDirection: 'increase' | 'decrease' = 'increase';
        if (
          fieldNameLower.includes('gewicht') ||
          fieldNameLower.includes('fett') ||
          fieldNameLower.includes('kfa')
        ) {
          goalDirection = 'decrease';
        }

        await addField({
          id: crypto.randomUUID(),
          name: defaultField.name,
          unit: defaultField.unit,
          type: 'number',
          createdAt: new Date(),
          order: order++,
          goalDirection,
        });

        // Add to set to prevent duplicates in this run
        existingFieldNames.add(fieldNameLower);
        createdCount++;
      }
    }

    console.log(`Created ${createdCount} default fields`);

    return true;
  } catch (error) {
    console.error('Failed to create default fields:', error);
    // On error, remove the flag so we can try again
    localStorage.removeItem(STORAGE_KEYS.INITIAL_FIELDS_CREATED);
    return false;
  }
}
