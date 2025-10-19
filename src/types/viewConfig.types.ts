/**
 * View Configuration Types
 * For managing dashboard view configurations
 */

import { ChartType } from './app.types';

export interface ViewConfiguration {
  id: string;
  name: string;
  description?: string;
  fieldIds: string[]; // IDs of fields to display
  icon?: string;
  chartType?: ChartType; // Preferred chart type for this view
  createdAt: Date;
  updatedAt: Date;
  order: number;
  isDefault?: boolean; // Cannot be deleted
}

export interface ViewConfigFormData {
  name: string;
  description?: string;
  fieldIds: string[];
  icon?: string;
  chartType?: ChartType;
}
