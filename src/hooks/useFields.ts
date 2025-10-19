/**
 * useFields Hook
 * Manages field operations
 */

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Field, FieldFormData, FieldUpdateData } from '../types';
import { useAppContext } from '../context';
import * as db from '../services/db';
import { validateFieldName, validateFieldUnit } from '../utils';

export function useFields() {
  const { fields, refreshFields, setError } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * Add a new field
   */
  const addField = useCallback(
    async (data: FieldFormData): Promise<void> => {
      setLoading(true);
      setLocalError(null);

      try {
        // Validate
        const nameValidation = validateFieldName(data.name);
        if (!nameValidation.valid) {
          throw new Error(nameValidation.error);
        }

        const unitValidation = validateFieldUnit(data.unit);
        if (!unitValidation.valid) {
          throw new Error(unitValidation.error);
        }

        // Create field
        const field: Field = {
          id: uuidv4(),
          name: data.name.trim(),
          unit: data.unit.trim(),
          type: data.type,
          createdAt: new Date(),
          order: fields.length, // Add at the end
        };

        // Save to DB
        await db.addField(field);

        // Refresh
        await refreshFields();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Fehler beim Hinzufügen';
        setLocalError(errorMsg);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fields.length, refreshFields, setError]
  );

  /**
   * Update a field
   */
  const updateField = useCallback(
    async (id: string, updates: FieldUpdateData): Promise<void> => {
      setLoading(true);
      setLocalError(null);

      try {
        // Validate if name is being updated
        if (updates.name !== undefined) {
          const nameValidation = validateFieldName(updates.name);
          if (!nameValidation.valid) {
            throw new Error(nameValidation.error);
          }
        }

        // Validate if unit is being updated
        if (updates.unit !== undefined) {
          const unitValidation = validateFieldUnit(updates.unit);
          if (!unitValidation.valid) {
            throw new Error(unitValidation.error);
          }
        }

        // Update in DB
        await db.updateField(id, updates);

        // Refresh
        await refreshFields();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Fehler beim Aktualisieren';
        setLocalError(errorMsg);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshFields, setError]
  );

  /**
   * Delete a field
   */
  const deleteField = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setLocalError(null);

      try {
        await db.deleteField(id);
        await refreshFields();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Fehler beim Löschen';
        setLocalError(errorMsg);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshFields, setError]
  );

  /**
   * Reorder fields
   */
  const reorderFields = useCallback(
    async (reorderedIds: string[]): Promise<void> => {
      setLoading(true);
      setLocalError(null);

      try {
        await db.reorderFields(reorderedIds);
        await refreshFields();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Fehler beim Sortieren';
        setLocalError(errorMsg);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshFields, setError]
  );

  return {
    fields,
    addField,
    updateField,
    deleteField,
    reorderFields,
    loading,
    error: localError,
  };
}
