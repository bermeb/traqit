/**
 * Field Type Definitions
 * Defines the structure for user-defined measurement fields
 */

export type FieldType = 'number' | 'text';

export interface Field {
  id: string;              // UUID
  name: string;            // e.g., "Gewicht", "Körperfett"
  unit: string;            // e.g., "kg", "%", "cm"
  type: FieldType;         // Data type for validation
  createdAt: Date;         // Creation timestamp
  order: number;           // Display order (for drag & drop)
}

export interface FieldFormData {
  name: string;
  unit: string;
  type: FieldType;
}

export interface FieldUpdateData {
  name?: string;
  unit?: string;
  type?: FieldType;
  order?: number;
}
