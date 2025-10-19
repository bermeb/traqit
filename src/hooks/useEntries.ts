/**
 * useEntries Hook
 * Manages entry operations
 */

import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Entry, EntryFormData, EntryUpdateData, EntryFilter } from '../types';
import { useAppContext } from '../context';
import * as db from '../services/db';

export function useEntries(filter?: EntryFilter) {
  const { entries, refreshEntries, setError } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * Filter entries based on criteria
   */
  const filteredEntries = useMemo(() => {
    if (!filter) return entries;

    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);

      // Filter by date range
      if (filter.startDate && entryDate < filter.startDate) {
        return false;
      }
      if (filter.endDate && entryDate > filter.endDate) {
        return false;
      }

      // Filter by field IDs (entry must have at least one of these fields)
      if (filter.fieldIds && filter.fieldIds.length > 0) {
        const hasField = filter.fieldIds.some((fieldId) => fieldId in entry.values);
        if (!hasField) return false;
      }

      return true;
    });
  }, [entries, filter]);

  /**
   * Add a new entry
   */
  const addEntry = useCallback(
    async (data: EntryFormData, imageId?: string): Promise<void> => {
      setLoading(true);
      setLocalError(null);

      try {
        const entry: Entry = {
          id: uuidv4(),
          date: data.date,
          values: data.values,
          imageId,
          notes: data.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.addEntry(entry);
        await refreshEntries();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Fehler beim Hinzufügen';
        setLocalError(errorMsg);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshEntries, setError]
  );

  /**
   * Update an entry
   */
  const updateEntry = useCallback(
    async (id: string, updates: EntryUpdateData): Promise<void> => {
      setLoading(true);
      setLocalError(null);

      try {
        await db.updateEntry(id, updates);
        await refreshEntries();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Fehler beim Aktualisieren';
        setLocalError(errorMsg);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshEntries, setError]
  );

  /**
   * Delete an entry
   */
  const deleteEntry = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setLocalError(null);

      try {
        await db.deleteEntry(id);
        await refreshEntries();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Fehler beim Löschen';
        setLocalError(errorMsg);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshEntries, setError]
  );

  /**
   * Get entry by ID
   */
  const getEntryById = useCallback(
    (id: string): Entry | undefined => {
      return entries.find((entry) => entry.id === id);
    },
    [entries]
  );

  return {
    entries: filteredEntries,
    allEntries: entries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntryById,
    loading,
    error: localError,
  };
}
