/**
 * useViewConfigs Hook
 * Manages view configuration operations
 */

import { useState, useCallback, useEffect } from 'react';
import { ViewConfiguration, ViewConfigFormData } from '../types';
import * as db from '../services/db';

export function useViewConfigs() {
  const [viewConfigs, setViewConfigs] = useState<ViewConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all view configurations
   */
  const loadViewConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const configs = await db.getViewConfigs();
      setViewConfigs(configs);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Fehler beim Laden';
      setError(errorMsg);
      console.error('Error loading view configs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a new view configuration
   */
  const addViewConfig = useCallback(
    async (data: ViewConfigFormData): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const config: ViewConfiguration = {
          id: crypto.randomUUID(),
          name: data.name.trim(),
          description: data.description?.trim(),
          fieldIds: data.fieldIds,
          icon: data.icon || '📊',
          createdAt: new Date(),
          updatedAt: new Date(),
          order: viewConfigs.length,
          isDefault: false,
        };

        await db.addViewConfig(config);
        await loadViewConfigs();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Fehler beim Hinzufügen';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [viewConfigs.length, loadViewConfigs]
  );

  /**
   * Update a view configuration
   */
  const updateViewConfig = useCallback(
    async (id: string, updates: Partial<ViewConfiguration>): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await db.updateViewConfig(id, updates);
        await loadViewConfigs();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Fehler beim Aktualisieren';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadViewConfigs]
  );

  /**
   * Delete a view configuration
   */
  const deleteViewConfig = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await db.deleteViewConfig(id);
        await loadViewConfigs();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Fehler beim Löschen';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadViewConfigs]
  );

  // Load view configs on mount
  useEffect(() => {
    loadViewConfigs();
  }, [loadViewConfigs]);

  return {
    viewConfigs,
    addViewConfig,
    updateViewConfig,
    deleteViewConfig,
    refreshViewConfigs: loadViewConfigs,
    loading,
    error,
  };
}
