import { describe, it, expect } from 'vitest';
import {
  needsThumbnail,
  getPreviewUrl,
} from '../thumbnail-utils';
import type { Attachment } from '../../types/event';

describe('thumbnail-utils', () => {

  // Note: DOM-dependent tests (generateEventThumbnail, createCustomThumbnail, etc.) 
  // would require proper DOM setup and are better suited for integration tests

  describe('needsThumbnail', () => {
    it('should return true for image attachments without textBody', () => {
      const attachment: Attachment = {
        id: '1',
        kind: 'image',
        name: 'photo.jpg',
        mime: 'image/jpeg',
        createdAt: '2024-01-01T00:00:00Z',
      };
      
      expect(needsThumbnail(attachment)).toBe(true);
    });

    it('should return false for image attachments with textBody', () => {
      const attachment: Attachment = {
        id: '1',
        kind: 'image',
        name: 'photo.jpg',
        mime: 'image/jpeg',
        textBody: 'some text',
        createdAt: '2024-01-01T00:00:00Z',
      };
      
      expect(needsThumbnail(attachment)).toBe(false);
    });

    it('should return false for non-image attachments', () => {
      const attachment: Attachment = {
        id: '1',
        kind: 'pdf',
        name: 'document.pdf',
        mime: 'application/pdf',
        createdAt: '2024-01-01T00:00:00Z',
      };
      
      expect(needsThumbnail(attachment)).toBe(false);
    });
  });

  describe('getPreviewUrl', () => {
    it('should return URL for image attachments', () => {
      const attachment: Attachment = {
        id: '1',
        kind: 'image',
        name: 'photo.jpg',
        mime: 'image/jpeg',
        url: 'blob:mock-url',
        createdAt: '2024-01-01T00:00:00Z',
      };
      
      expect(getPreviewUrl(attachment)).toBe('blob:mock-url');
    });

    it('should return null for text attachments', () => {
      const attachment: Attachment = {
        id: '1',
        kind: 'text',
        name: 'note.txt',
        mime: 'text/plain',
        textBody: 'test',
        createdAt: '2024-01-01T00:00:00Z',
      };
      
      expect(getPreviewUrl(attachment)).toBeNull();
    });

    it('should return URL for other file types', () => {
      const attachment: Attachment = {
        id: '1',
        kind: 'pdf',
        name: 'document.pdf',
        mime: 'application/pdf',
        url: 'blob:mock-url',
        createdAt: '2024-01-01T00:00:00Z',
      };
      
      expect(getPreviewUrl(attachment)).toBe('blob:mock-url');
    });

    it('should return null if no URL available', () => {
      const attachment: Attachment = {
        id: '1',
        kind: 'pdf',
        name: 'document.pdf',
        mime: 'application/pdf',
        createdAt: '2024-01-01T00:00:00Z',
      };
      
      expect(getPreviewUrl(attachment)).toBeNull();
    });
  });

  // Note: createPlaceholderThumbnail test requires canvas mocking
});