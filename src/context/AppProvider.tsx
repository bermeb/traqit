/**
 * App Provider
 * Provides global state to the entire application
 */

import { ReactNode, useState, useEffect, useCallback } from 'react';
import { AppContext } from './AppContext';
import { Field, Entry, Route } from '../types';
import { initDB, getFields, getEntries } from '../services/db';
import { initializeDefaultFields } from '../utils/initializeDefaultFields';
import { initializeViewConfigs } from '../utils/initializeViewConfigs';
import { migrateFieldGoalDirection } from '../utils/migrateFieldGoalDirection';
import { useImagePrivacy } from '../hooks';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [fields, setFields] = useState<Field[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route>('/');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Image privacy hook
  const { isBlurred, toggleBlur, enableBlur, disableBlur } = useImagePrivacy();

  /**
   * Initialize database and load data
   */
  const initializeApp = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize IndexedDB
      await initDB();

      // Initialize default fields if this is the first start
      await initializeDefaultFields();

      // Initialize default view configurations
      await initializeViewConfigs();

      // Run migration for existing fields to add goalDirection
      await migrateFieldGoalDirection();

      // Load initial data
      const [loadedFields, loadedEntries] = await Promise.all([
        getFields(),
        getEntries(),
      ]);

      setFields(loadedFields);
      setEntries(loadedEntries);
    } catch (err) {
      console.error('Failed to initialize app:', err);
      setError('Fehler beim Laden der Daten. Bitte Seite neu laden.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh fields from database
   */
  const refreshFields = useCallback(async () => {
    try {
      const loadedFields = await getFields();
      setFields(loadedFields);
    } catch (err) {
      console.error('Failed to refresh fields:', err);
      setError('Fehler beim Laden der Felder');
    }
  }, []);

  /**
   * Refresh entries from database
   */
  const refreshEntries = useCallback(async () => {
    try {
      const loadedEntries = await getEntries();
      setEntries(loadedEntries);
    } catch (err) {
      console.error('Failed to refresh entries:', err);
      setError('Fehler beim Laden der Einträge');
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Initialize app on mount
   */
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  /**
   * Handle route changes via hash
   */
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || '/';
      const validRoutes: Route[] = ['/', '/fields', '/entries', '/charts', '/backup', '/view-configs', '/image-compare'];

      if (validRoutes.includes(hash as Route)) {
        setCurrentRoute(hash as Route);
      } else {
        setCurrentRoute('/');
        window.location.hash = '';
      }
    };

    // Set initial route
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const value = {
    // State
    fields,
    entries,
    currentRoute,
    isLoading,
    error,
    isImagesBlurred: isBlurred,

    // Actions
    setFields,
    setEntries,
    setCurrentRoute,
    setIsLoading,
    setError,
    refreshFields,
    refreshEntries,
    clearError,
    toggleImageBlur: toggleBlur,
    enableImageBlur: enableBlur,
    disableImageBlur: disableBlur,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
