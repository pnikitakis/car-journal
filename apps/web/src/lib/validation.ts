import { z } from 'zod';

/**
 * Generic validation utility that parses data with a Zod schema
 * and returns either the parsed data or validation errors
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}

/**
 * File size validation constants
 */
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * Validates file size against the 10MB limit
 */
export function validateFileSize(file: File): boolean {
  return file.size <= FILE_SIZE_LIMITS.MAX_FILE_SIZE_BYTES;
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}