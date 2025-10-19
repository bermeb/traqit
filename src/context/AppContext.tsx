/**
 * App Context
 * Global state management using React Context API
 */

import { createContext, useContext } from 'react';
import { Field, Entry, Route } from '../types';

export interface AppContextValue {
  // State
  fields: Field[];
  entries: Entry[];
  currentRoute: Route;
  isLoading: boolean;
  error: string | null;

  // Actions
  setFields: (fields: Field[]) => void;
  setEntries: (entries: Entry[]) => void;
  setCurrentRoute: (route: Route) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshFields: () => Promise<void>;
  refreshEntries: () => Promise<void>;
  clearError: () => void;
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * Hook to use App Context
 */
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  return context;
}
