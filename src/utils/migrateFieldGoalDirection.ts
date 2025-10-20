/**
 * Migrate existing fields to add goalDirection property
 * This migration adds a sensible default based on field names
 */

import { getFields, updateField } from '../services/db';
import { STORAGE_KEYS } from './constants';

/**
 * Migrate fields to add goalDirection
 * Returns true if migration was performed, false if already done
 */
export async function migrateFieldGoalDirection(): Promise<boolean> {
  // Check if migration has already been performed
  const alreadyMigrated = localStorage.getItem(STORAGE_KEYS.GOAL_DIRECTION_MIGRATED);

  if (alreadyMigrated === 'true') {
    return false;
  }

  console.log('Migrating fields to add goalDirection...');

  try {
    // Get all existing fields
    const fields = await getFields();

    // Migrate each field that doesn't have goalDirection
    for (const field of fields) {
      // Check if field already has goalDirection
      if ('goalDirection' in field && field.goalDirection) {
        continue; // Skip if already has goalDirection
      }

      // Determine sensible default based on field name
      const nameLower = field.name.toLowerCase();
      let goalDirection: 'increase' | 'decrease' = 'increase'; // Default

      // Set to 'decrease' if name suggests lower is better
      if (
        nameLower.includes('gewicht') ||
        nameLower.includes('weight') ||
        nameLower.includes('fett') ||
        nameLower.includes('fat') ||
        nameLower.includes('körperfett') ||
        nameLower.includes('kfa') ||
        nameLower.includes('bf') ||
        nameLower.includes('body fat')
      ) {
        goalDirection = 'decrease';
      }

      // Update field with goalDirection
      await updateField(field.id, { goalDirection });
      console.log(`Migrated field "${field.name}" with goalDirection: ${goalDirection}`);
    }

    // Mark migration as complete
    localStorage.setItem(STORAGE_KEYS.GOAL_DIRECTION_MIGRATED, 'true');
    console.log('Field goalDirection migration completed');

    return true;
  } catch (error) {
    console.error('Failed to migrate field goalDirection:', error);
    // Don't set the flag on error so we can try again
    return false;
  }
}
