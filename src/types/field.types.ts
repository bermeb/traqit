/**
 * Field Type Definitions
 * Defines the structure for user-defined measurement fields
 */

export type FieldType = 'number' | 'text';
export type GoalDirection = 'increase' | 'decrease';

export interface Field {
  id: string;              // UUID
  name: string;            // e.g., "Gewicht", "Körperfett"
  unit: string;            // e.g., "kg", "%", "cm"
  type: FieldType;         // Data type for validation
  createdAt: Date;         // Creation timestamp
  order: number;           // Display order (for drag & drop)
  goalDirection?: GoalDirection; // Whether increase or decrease is positive (default: 'increase')
}

export interface FieldFormData {
  name: string;
  unit: string;
  type: FieldType;
  goalDirection: GoalDirection;
}

export interface FieldUpdateData {
  name?: string;
  unit?: string;
  type?: FieldType;
  order?: number;
  goalDirection?: GoalDirection;
}
