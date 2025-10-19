/**
 * Entry Type Definitions
 * Defines the structure for measurement entries
 */

export interface Entry {
  id: string;                            // UUID
  date: Date;                            // Measurement date
  values: Record<string, number | string>; // fieldId -> value
  imageId?: string;                      // Optional: Reference to image
  notes?: string;                        // Optional: User notes
  createdAt: Date;                       // Creation timestamp
  updatedAt: Date;                       // Last update timestamp
}

export interface EntryFormData {
  date: Date;
  values: Record<string, number | string>;
  image?: File;
  notes?: string;
}

export interface EntryUpdateData {
  date?: Date;
  values?: Record<string, number | string>;
  imageId?: string;
  notes?: string;
}

export interface EntryFilter {
  startDate?: Date;
  endDate?: Date;
  fieldIds?: string[];
}
