/**
 * App-wide Type Definitions
 * Defines global state and shared types
 */

import { Field } from './field.types';
import { Entry } from './entry.types';

export interface AppState {
  fields: Field[];
  entries: Entry[];
  isLoading: boolean;
  error: string | null;
}

export type ChartType = 'line' | 'bar' | 'pie';

export interface ChartFilter {
  fieldIds: string[];
  startDate: Date;
  endDate: Date;
  chartType: ChartType;
}

export interface ExportData {
  version: string;         // Data format version
  exportDate: Date;        // When export was created
  fields: Field[];
  entries: Entry[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  fieldsImported?: number;
  entriesImported?: number;
  imagesImported?: number;
}

export type ImportMode = 'overwrite' | 'merge';

export interface BackupMetadata {
  version: string;
  exportDate: string;
  fieldsCount: number;
  entriesCount: number;
  imagesCount: number;
}

export type Route = '/' | '/fields' | '/entries' | '/charts' | '/backup' | '/view-configs' | '/image-compare' | '/analytics';
