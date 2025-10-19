/**
 * Initialize Default View Configurations
 * Creates default view configurations on first app start after update
 */

import { addViewConfig, getViewConfigs, getFields } from '../services/db';
import { STORAGE_KEYS } from './constants';
import { ViewConfiguration } from '../types';

/**
 * Initialize default view configurations if not already created
 * Returns true if configs were created, false if they were already initialized before
 */
export async function initializeViewConfigs(): Promise<boolean> {
  // Check if default configs have already been initialized
  const alreadyInitialized = localStorage.getItem(STORAGE_KEYS.VIEW_CONFIGS_CREATED);

  if (alreadyInitialized === 'true') {
    return false;
  }

  // Mark as initialized IMMEDIATELY to prevent race conditions
  localStorage.setItem(STORAGE_KEYS.VIEW_CONFIGS_CREATED, 'true');

  console.log('Creating default view configurations...');

  try {
    // Get existing fields to find matching field IDs
    const existingFields = await getFields();
    const existingConfigs = await getViewConfigs();
    let order = existingConfigs.length;

    // Create default "Körperzusammensetzung" configuration
    const bodyCompositionFields = [
      'KFA',
      'Knochenmasse',
      'Muskelmasse',
      'Wasseranteil',
      'Gewicht',
    ];

    const matchedFieldIds = bodyCompositionFields
      .map((fieldName) => {
        const field = existingFields.find(
          (f) => f.name.toLowerCase() === fieldName.toLowerCase()
        );
        return field?.id;
      })
      .filter((id): id is string => id !== undefined);

    // Only create if at least some fields exist
    if (matchedFieldIds.length > 0) {
      const bodyCompositionConfig: ViewConfiguration = {
        id: crypto.randomUUID(),
        name: 'Körperzusammensetzung',
        description: 'Übersicht über Körperfett, Muskeln und Gewicht',
        fieldIds: matchedFieldIds,
        icon: '🧬',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: order++,
        isDefault: true,
      };

      await addViewConfig(bodyCompositionConfig);
      console.log('Created default view configuration: Körperzusammensetzung');
    }

    return true;
  } catch (error) {
    console.error('Failed to create default view configurations:', error);
    // On error, remove the flag so we can try again
    localStorage.removeItem(STORAGE_KEYS.VIEW_CONFIGS_CREATED);
    return false;
  }
}
