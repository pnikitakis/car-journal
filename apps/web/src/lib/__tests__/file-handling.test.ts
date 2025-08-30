import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  FILE_SIZE_LIMIT,
  FileHandlingError,
  getAttachmentKind,
  isFileTypeSupported,
  validateFileSize,
  validateFileType,
  generateAttachmentId,
  createTextAttachment,
  formatFileSize,
  getFilePreviewType,
  canPreviewInline,
  getAttachmentDisplayName,
} from '../file-handling';

// Mock URL methods
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

// Setup URL mocks
beforeEach(() => {
  vi.clearAllMocks();
  mockCreateObjectURL.mockReturnValue('blob:mock-url');
  
  Object.defineProperty(global, 'URL', {
    value: {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    },
    writable: true,
  });
});

describe('file-handling', () => {

  describe('getAttachmentKind', () => {
    it('should return "image" for image MIME types', () => {
      expect(getAttachmentKind('image/jpeg')).toBe('image');
      expect(getAttachmentKind('image/png')).toBe('image');
      expect(getAttachmentKind('image/gif')).toBe('image');
    });

    it('should return "pdf" for PDF MIME type', () => {
      expect(getAttachmentKind('application/pdf')).toBe('pdf');
    });

    it('should return "audio" for audio MIME types', () => {
      expect(getAttachmentKind('audio/mpeg')).toBe('audio');
      expect(getAttachmentKind('audio/wav')).toBe('audio');
    });

    it('should return "file" for other supported types', () => {
      expect(getAttachmentKind('text/plain')).toBe('file');
      expect(getAttachmentKind('application/json')).toBe('file');
    });

    it('should return "file" for unsupported types', () => {
      expect(getAttachmentKind('application/unknown')).toBe('file');
    });
  });

  describe('isFileTypeSupported', () => {
    it('should return true for supported image types', () => {
      expect(isFileTypeSupported('image/jpeg')).toBe(true);
      expect(isFileTypeSupported('image/png')).toBe(true);
    });

    it('should return true for supported PDF type', () => {
      expect(isFileTypeSupported('application/pdf')).toBe(true);
    });

    it('should return true for supported audio types', () => {
      expect(isFileTypeSupported('audio/mpeg')).toBe(true);
    });

    it('should return true for supported file types', () => {
      expect(isFileTypeSupported('text/plain')).toBe(true);
      expect(isFileTypeSupported('application/json')).toBe(true);
    });

    it('should return false for unsupported types', () => {
      expect(isFileTypeSupported('application/unknown')).toBe(false);
      expect(isFileTypeSupported('video/mp4')).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should not throw for files within size limit', () => {
      expect(() => validateFileSize(1024)).not.toThrow();
      expect(() => validateFileSize(FILE_SIZE_LIMIT)).not.toThrow();
    });

    it('should throw FileHandlingError for files exceeding size limit', () => {
      expect(() => validateFileSize(FILE_SIZE_LIMIT + 1)).toThrow(FileHandlingError);
      expect(() => validateFileSize(FILE_SIZE_LIMIT + 1)).toThrow(/exceeds the 10MB limit/);
    });

    it('should include file size in error message', () => {
      const largeSize = 15 * 1024 * 1024; // 15MB
      expect(() => validateFileSize(largeSize)).toThrow(/15\.0MB exceeds/);
    });
  });

  describe('validateFileType', () => {
    it('should not throw for supported file types', () => {
      expect(() => validateFileType('image/jpeg')).not.toThrow();
      expect(() => validateFileType('application/pdf')).not.toThrow();
      expect(() => validateFileType('text/plain')).not.toThrow();
    });

    it('should throw FileHandlingError for unsupported file types', () => {
      expect(() => validateFileType('video/mp4')).toThrow(FileHandlingError);
      expect(() => validateFileType('application/unknown')).toThrow(/not supported/);
    });
  });

  describe('generateAttachmentId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateAttachmentId();
      const id2 = generateAttachmentId();
      
      expect(id1).toMatch(/^att_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^att_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  // Note: createImageThumbnail and processFileAttachment tests require DOM environment
  // These would be tested in integration tests or with proper DOM setup

  describe('createTextAttachment', () => {
    it('should create text attachment with provided name', () => {
      const attachment = createTextAttachment('Hello world', 'My Note');
      
      expect(attachment).toMatchObject({
        kind: 'text',
        name: 'My Note',
        mime: 'text/plain',
        textBody: 'Hello world',
      });
      expect(attachment.id).toMatch(/^att_\d+_[a-z0-9]+$/);
      expect(attachment.createdAt).toBeDefined();
    });

    it('should create text attachment with default name', () => {
      const attachment = createTextAttachment('Hello world');
      
      expect(attachment.name).toMatch(/^Note \d+\/\d+\/\d+$/);
    });
  });

  // Note: cleanupAttachmentUrls test requires URL.revokeObjectURL mock

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
    });
  });

  describe('getFilePreviewType', () => {
    it('should return attachment kind', () => {
      expect(getFilePreviewType({ kind: 'image' } as any)).toBe('image');
      expect(getFilePreviewType({ kind: 'pdf' } as any)).toBe('pdf');
      expect(getFilePreviewType({ kind: 'text' } as any)).toBe('text');
    });
  });

  describe('canPreviewInline', () => {
    it('should return true for previewable types', () => {
      expect(canPreviewInline({ kind: 'image' } as any)).toBe(true);
      expect(canPreviewInline({ kind: 'text' } as any)).toBe(true);
    });

    it('should return false for non-previewable types', () => {
      expect(canPreviewInline({ kind: 'pdf' } as any)).toBe(false);
      expect(canPreviewInline({ kind: 'audio' } as any)).toBe(false);
      expect(canPreviewInline({ kind: 'file' } as any)).toBe(false);
    });
  });

  describe('getAttachmentDisplayName', () => {
    it('should return attachment name', () => {
      expect(getAttachmentDisplayName({ name: 'test.jpg' } as any)).toBe('test.jpg');
    });

    it('should return fallback for missing name', () => {
      expect(getAttachmentDisplayName({ name: '', kind: 'image' } as any)).toBe('image attachment');
      expect(getAttachmentDisplayName({ kind: 'pdf' } as any)).toBe('pdf attachment');
    });
  });
});