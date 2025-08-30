import { z } from 'zod';
import { type Attachment, type AttachmentKind, AttachmentSchema } from '../types/event';
import { validateData } from './validation';

/**
 * File size limits and validation constants
 */
export const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB in bytes
export const THUMBNAIL_SIZE = 200; // Thumbnail max width/height in pixels

/**
 * Supported file types and their MIME types
 */
export const SUPPORTED_FILE_TYPES = {
  image: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml'
  ],
  pdf: ['application/pdf'],
  audio: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/m4a'
  ],
  // Generic file types - we'll accept most common ones
  file: [
    'text/plain',
    'text/csv',
    'application/json',
    'application/xml',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed'
  ]
} as const;

/**
 * File handling error types
 */
export class FileHandlingError extends Error {
  constructor(
    message: string, 
    public readonly code: 'SIZE_LIMIT' | 'INVALID_TYPE' | 'PROCESSING_ERROR' | 'THUMBNAIL_ERROR',
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'FileHandlingError';
  }
}

/**
 * Determines the attachment kind based on MIME type
 */
export function getAttachmentKind(mimeType: string): AttachmentKind {
  if ((SUPPORTED_FILE_TYPES.image as readonly string[]).includes(mimeType)) {
    return 'image';
  }
  if ((SUPPORTED_FILE_TYPES.pdf as readonly string[]).includes(mimeType)) {
    return 'pdf';
  }
  if ((SUPPORTED_FILE_TYPES.audio as readonly string[]).includes(mimeType)) {
    return 'audio';
  }
  return 'file';
}

/**
 * Validates if a file type is supported
 */
export function isFileTypeSupported(mimeType: string): boolean {
  return Object.values(SUPPORTED_FILE_TYPES).some(types => 
    (types as readonly string[]).includes(mimeType)
  );
}

/**
 * Validates file size against the limit
 */
export function validateFileSize(sizeBytes: number): void {
  if (sizeBytes > FILE_SIZE_LIMIT) {
    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(1);
    const limitMB = (FILE_SIZE_LIMIT / (1024 * 1024)).toFixed(0);
    throw new FileHandlingError(
      `File size ${sizeMB}MB exceeds the ${limitMB}MB limit. Please choose a smaller file.`,
      'SIZE_LIMIT'
    );
  }
}

/**
 * Validates file type against supported types
 */
export function validateFileType(mimeType: string): void {
  if (!isFileTypeSupported(mimeType)) {
    throw new FileHandlingError(
      `File type "${mimeType}" is not supported. Please use images, PDFs, audio files, or common document formats.`,
      'INVALID_TYPE'
    );
  }
}

/**
 * Generates a unique ID for attachments
 */
export function generateAttachmentId(): string {
  return `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates a thumbnail for image files
 */
export function createImageThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      if (!ctx) {
        throw new FileHandlingError(
          'Canvas context not available for thumbnail generation',
          'THUMBNAIL_ERROR'
        );
      }

      img.onload = () => {
        try {
          // Calculate thumbnail dimensions maintaining aspect ratio
          const { width, height } = img;
          let thumbnailWidth = THUMBNAIL_SIZE;
          let thumbnailHeight = THUMBNAIL_SIZE;
          
          if (width > height) {
            thumbnailHeight = (height * THUMBNAIL_SIZE) / width;
          } else {
            thumbnailWidth = (width * THUMBNAIL_SIZE) / height;
          }
          
          canvas.width = thumbnailWidth;
          canvas.height = thumbnailHeight;
          
          // Draw the resized image
          ctx.drawImage(img, 0, 0, thumbnailWidth, thumbnailHeight);
          
          // Convert to data URL
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(thumbnailUrl);
        } catch (error) {
          reject(new FileHandlingError(
            'Failed to generate thumbnail',
            'THUMBNAIL_ERROR',
            error as Error
          ));
        }
      };

      img.onerror = () => {
        reject(new FileHandlingError(
          'Failed to load image for thumbnail generation',
          'THUMBNAIL_ERROR'
        ));
      };

      // Create object URL for the image
      img.src = URL.createObjectURL(file);
    } catch (error) {
      reject(new FileHandlingError(
        'Failed to create thumbnail',
        'THUMBNAIL_ERROR',
        error as Error
      ));
    }
  });
}

/**
 * Processes a file and creates an attachment object
 */
export async function processFileAttachment(file: File): Promise<Attachment> {
  try {
    // Validate file size and type
    validateFileSize(file.size);
    validateFileType(file.type);
    
    // Determine attachment kind
    const kind = getAttachmentKind(file.type);
    
    // Create object URL for preview
    const url = URL.createObjectURL(file);
    
    // Create base attachment object
    const attachment: Attachment = {
      id: generateAttachmentId(),
      kind,
      name: file.name,
      mime: file.type,
      sizeBytes: file.size,
      url,
      createdAt: new Date().toISOString(),
    };
    
    // Validate the attachment object
    const validation = validateData(AttachmentSchema, attachment);
    if (!validation.success) {
      throw new FileHandlingError(
        `Invalid attachment data: ${validation.errors.message}`,
        'PROCESSING_ERROR'
      );
    }
    
    return validation.data;
  } catch (error) {
    if (error instanceof FileHandlingError) {
      throw error;
    }
    throw new FileHandlingError(
      'Failed to process file attachment',
      'PROCESSING_ERROR',
      error as Error
    );
  }
}

/**
 * Creates a text attachment (no file size limit for text)
 */
export function createTextAttachment(text: string, name?: string): Attachment {
  try {
    const attachment: Attachment = {
      id: generateAttachmentId(),
      kind: 'text',
      name: name || `Note ${new Date().toLocaleDateString()}`,
      mime: 'text/plain',
      textBody: text,
      createdAt: new Date().toISOString(),
    };
    
    // Validate the attachment object
    const validation = validateData(AttachmentSchema, attachment);
    if (!validation.success) {
      throw new FileHandlingError(
        `Invalid text attachment data: ${validation.errors.message}`,
        'PROCESSING_ERROR'
      );
    }
    
    return validation.data;
  } catch (error) {
    if (error instanceof FileHandlingError) {
      throw error;
    }
    throw new FileHandlingError(
      'Failed to create text attachment',
      'PROCESSING_ERROR',
      error as Error
    );
  }
}

/**
 * Cleans up object URLs to prevent memory leaks
 */
export function cleanupAttachmentUrls(attachments: Attachment[]): void {
  attachments.forEach(attachment => {
    if (attachment.url && attachment.url.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.url);
    }
  });
}

/**
 * Gets a human-readable file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Gets appropriate file icon/preview type for rendering
 */
export function getFilePreviewType(attachment: Attachment): 'image' | 'pdf' | 'audio' | 'text' | 'file' {
  return attachment.kind;
}

/**
 * Checks if an attachment can be previewed inline
 */
export function canPreviewInline(attachment: Attachment): boolean {
  return ['image', 'text'].includes(attachment.kind);
}

/**
 * Gets display name for attachment with fallback
 */
export function getAttachmentDisplayName(attachment: Attachment): string {
  return attachment.name || `${attachment.kind} attachment`;
}