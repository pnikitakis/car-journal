# File Handling System

This directory contains the complete file handling and attachment system for the Car Journal application. The system provides comprehensive file upload, validation, processing, and thumbnail generation capabilities.

## Overview

The file handling system supports:
- **File Types**: Images (JPEG, PNG, GIF, WebP, BMP, SVG), PDFs, Audio files (MP3, WAV, OGG, M4A), and common document formats
- **Size Limits**: 10MB per file
- **Validation**: File type and size validation with detailed error messages
- **Thumbnails**: Automatic thumbnail generation for images
- **Previews**: Object URL generation for file previews
- **Text Notes**: Support for text-only attachments without file size limits

## Core Files

### `file-handling.ts`
Main utility functions for file processing:
- `processFileAttachment()` - Processes uploaded files into attachment objects
- `createTextAttachment()` - Creates text-only attachments
- `createImageThumbnail()` - Generates thumbnails for images
- `validateFileSize()` / `validateFileType()` - File validation
- `cleanupAttachmentUrls()` - Memory management for object URLs

### `thumbnail-utils.ts`
Advanced thumbnail generation utilities:
- `generateEventThumbnail()` - Creates thumbnails from event attachments
- `createCustomThumbnail()` - Custom thumbnail generation with options
- `generateResponsiveThumbnails()` - Multiple thumbnail sizes
- `createPlaceholderThumbnail()` - Placeholder thumbnails for non-image files

### `use-file-handling.ts`
React hook for file handling:
- `useFileHandling()` - Complete file handling hook with state management
- Progress tracking for uploads
- Error handling and user feedback
- Batch file processing

## Components

### `file-upload.tsx`
Complete file upload component with:
- Drag and drop support
- File selection dialog
- Progress indicators
- Error display
- Text note input
- Attachment preview and management

### `example-usage.tsx`
Demonstration component showing:
- File upload integration
- Event creation with attachments
- Storage integration
- Complete workflow example

## Usage Examples

### Basic File Processing
```typescript
import { processFileAttachment, createTextAttachment } from '../lib/file-handling';

// Process a file upload
const file = event.target.files[0];
const attachment = await processFileAttachment(file);

// Create a text note
const textNote = createTextAttachment('My note content', 'Note Title');
```

### Using the React Hook
```typescript
import { useFileHandling } from '../lib/use-file-handling';

function MyComponent() {
  const { uploadFiles, uploadState, createTextNote } = useFileHandling();
  
  const handleFiles = async (files: FileList) => {
    const attachments = await uploadFiles(files);
    // Handle uploaded attachments
  };
}
```

### Thumbnail Generation
```typescript
import { createImageThumbnail, generateEventThumbnail } from '../lib/thumbnail-utils';

// Generate thumbnail for a single image
const thumbnail = await createImageThumbnail(imageFile);

// Generate thumbnail from event attachments
const eventThumbnail = await generateEventThumbnail(event.attachments);
```

## File Type Support

### Images
- **MIME Types**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/bmp`, `image/svg+xml`
- **Features**: Automatic thumbnail generation, inline preview
- **Use Cases**: Photos, receipts, damage documentation

### PDFs
- **MIME Types**: `application/pdf`
- **Features**: Object URL preview, placeholder thumbnails
- **Use Cases**: Service manuals, receipts, documentation

### Audio
- **MIME Types**: `audio/mpeg`, `audio/wav`, `audio/ogg`, `audio/m4a`
- **Features**: Object URL for playback, placeholder thumbnails
- **Use Cases**: Voice notes, engine sounds

### Documents
- **MIME Types**: `text/plain`, `text/csv`, `application/json`, Office formats, etc.
- **Features**: Object URL download, placeholder thumbnails
- **Use Cases**: Service records, spreadsheets, notes

### Text Notes
- **Special Type**: No file required, stored as `textBody`
- **Features**: No size limits, inline display
- **Use Cases**: Quick notes, observations, reminders

## Error Handling

The system provides comprehensive error handling:

### File Size Errors
```typescript
// Throws FileHandlingError with code 'SIZE_LIMIT'
validateFileSize(15 * 1024 * 1024); // 15MB file
// Error: "File size 15.0MB exceeds the 10MB limit. Please choose a smaller file."
```

### File Type Errors
```typescript
// Throws FileHandlingError with code 'INVALID_TYPE'
validateFileType('video/mp4');
// Error: "File type "video/mp4" is not supported. Please use images, PDFs, audio files, or common document formats."
```

### Processing Errors
All processing functions catch and wrap errors in `FileHandlingError` with appropriate error codes and user-friendly messages.

## Memory Management

The system uses `URL.createObjectURL()` for file previews, which requires proper cleanup:

```typescript
import { cleanupAttachmentUrls } from '../lib/file-handling';

// Clean up when component unmounts or attachments change
useEffect(() => {
  return () => {
    cleanupAttachmentUrls(attachments);
  };
}, [attachments]);
```

## Testing

Comprehensive test suites are provided:
- **Unit Tests**: `__tests__/file-handling.test.ts`, `__tests__/thumbnail-utils.test.ts`
- **Coverage**: File validation, error handling, utility functions
- **Mocking**: URL APIs, Canvas APIs for thumbnail generation

Run tests:
```bash
pnpm test
```

## Integration with Storage

The file handling system integrates seamlessly with the storage system:

```typescript
import { addEvent } from '../lib/storage';
import { processFileAttachment } from '../lib/file-handling';

// Create event with attachments
const attachments = await Promise.all(
  files.map(file => processFileAttachment(file))
);

const event: CarEvent = {
  // ... event data
  attachments,
};

addEvent(event);
```

## Performance Considerations

- **Thumbnails**: Generated on-demand and cached as data URLs
- **Object URLs**: Created for previews, must be cleaned up to prevent memory leaks
- **File Processing**: Asynchronous with progress tracking
- **Batch Processing**: Supports multiple file uploads with individual error handling

## Security

- **File Type Validation**: Strict MIME type checking
- **Size Limits**: 10MB per file to prevent abuse
- **No Server Upload**: Files stay in browser memory/localStorage only
- **Sanitization**: File names and content are validated before processing

## Future Enhancements

The system is designed to be extensible:
- Additional file type support can be added to `SUPPORTED_FILE_TYPES`
- Custom thumbnail generators can be implemented
- Compression algorithms can be added for large files
- Cloud storage integration can be added while maintaining the same API