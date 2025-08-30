import { type Attachment } from '../types/event';
import { createImageThumbnail, FileHandlingError } from './file-handling';

/**
 * Thumbnail generation options
 */
export interface ThumbnailOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Default thumbnail options
 */
const DEFAULT_THUMBNAIL_OPTIONS: Required<ThumbnailOptions> = {
  maxWidth: 200,
  maxHeight: 200,
  quality: 0.8,
  format: 'jpeg',
};

/**
 * Generates thumbnails for event attachments
 */
export async function generateEventThumbnail(
  attachments: Attachment[],
  options: ThumbnailOptions = {}
): Promise<string | null> {
  const opts = { ...DEFAULT_THUMBNAIL_OPTIONS, ...options };
  
  // Find the first image attachment
  const imageAttachment = attachments.find(att => att.kind === 'image' && att.url);
  
  if (!imageAttachment?.url) {
    return null;
  }

  try {
    // Create a temporary file object from the blob URL to generate thumbnail
    const response = await fetch(imageAttachment.url);
    const blob = await response.blob();
    const file = new File([blob], imageAttachment.name, { type: imageAttachment.mime });
    
    return await createImageThumbnail(file);
  } catch (error) {
    console.warn('Failed to generate event thumbnail:', error);
    return null;
  }
}

/**
 * Creates a custom thumbnail with specific dimensions
 */
export function createCustomThumbnail(
  file: File,
  options: ThumbnailOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_THUMBNAIL_OPTIONS, ...options };
  
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
          let thumbnailWidth = opts.maxWidth;
          let thumbnailHeight = opts.maxHeight;
          
          const aspectRatio = width / height;
          
          if (aspectRatio > 1) {
            // Landscape
            thumbnailHeight = thumbnailWidth / aspectRatio;
            if (thumbnailHeight > opts.maxHeight) {
              thumbnailHeight = opts.maxHeight;
              thumbnailWidth = thumbnailHeight * aspectRatio;
            }
          } else {
            // Portrait or square
            thumbnailWidth = thumbnailHeight * aspectRatio;
            if (thumbnailWidth > opts.maxWidth) {
              thumbnailWidth = opts.maxWidth;
              thumbnailHeight = thumbnailWidth / aspectRatio;
            }
          }
          
          canvas.width = thumbnailWidth;
          canvas.height = thumbnailHeight;
          
          // Draw the resized image
          ctx.drawImage(img, 0, 0, thumbnailWidth, thumbnailHeight);
          
          // Convert to data URL with specified format and quality
          const mimeType = `image/${opts.format}`;
          const thumbnailUrl = canvas.toDataURL(mimeType, opts.quality);
          resolve(thumbnailUrl);
        } catch (error) {
          reject(new FileHandlingError(
            'Failed to generate custom thumbnail',
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
        'Failed to create custom thumbnail',
        'THUMBNAIL_ERROR',
        error as Error
      ));
    }
  });
}

/**
 * Generates multiple thumbnail sizes for responsive display
 */
export async function generateResponsiveThumbnails(
  file: File
): Promise<{ small: string; medium: string; large: string }> {
  try {
    const [small, medium, large] = await Promise.all([
      createCustomThumbnail(file, { maxWidth: 100, maxHeight: 100 }),
      createCustomThumbnail(file, { maxWidth: 200, maxHeight: 200 }),
      createCustomThumbnail(file, { maxWidth: 400, maxHeight: 400 }),
    ]);

    return { small, medium, large };
  } catch (error) {
    throw new FileHandlingError(
      'Failed to generate responsive thumbnails',
      'THUMBNAIL_ERROR',
      error as Error
    );
  }
}

/**
 * Checks if an attachment needs a thumbnail
 */
export function needsThumbnail(attachment: Attachment): boolean {
  return attachment.kind === 'image' && !attachment.textBody;
}

/**
 * Gets the best available preview URL for an attachment
 */
export function getPreviewUrl(attachment: Attachment): string | null {
  // For images, return the object URL for preview
  if (attachment.kind === 'image' && attachment.url) {
    return attachment.url;
  }
  
  // For text attachments, no URL needed (display textBody directly)
  if (attachment.kind === 'text') {
    return null;
  }
  
  // For other file types, return the object URL if available
  return attachment.url || null;
}

/**
 * Creates a placeholder thumbnail for non-image attachments
 */
export function createPlaceholderThumbnail(
  attachment: Attachment,
  size: number = 200
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return '';
  }
  
  canvas.width = size;
  canvas.height = size;
  
  // Set background color based on attachment type
  const colors = {
    pdf: '#dc2626', // Red
    audio: '#7c3aed', // Purple
    file: '#059669', // Green
    text: '#2563eb', // Blue
  };
  
  const color = colors[attachment.kind as keyof typeof colors] || '#6b7280';
  
  // Draw background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  
  // Draw icon text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.2}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const iconText = {
    pdf: 'PDF',
    audio: '♪',
    file: '📄',
    text: 'T',
  };
  
  const text = iconText[attachment.kind as keyof typeof iconText] || '📎';
  ctx.fillText(text, size / 2, size / 2);
  
  return canvas.toDataURL('image/png');
}