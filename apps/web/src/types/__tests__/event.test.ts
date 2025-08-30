import { describe, it, expect } from 'vitest';
import { CarEventSchema, AttachmentSchema, EventKindSchema } from '../event';

describe('Event Types and Schemas', () => {
  it('should validate a valid CarEvent', () => {
    const validEvent = {
      id: 'event-1',
      type: 'fuel',
      title: 'Gas fill-up',
      occurredAt: '2024-01-15T10:30:00Z',
      mileageKm: 50000,
      notes: 'Regular gas station visit',
      tags: ['routine', 'fuel'],
      attachments: [],
      fuel: {
        liters: 45.5,
        totalAmount: 65.50,
        station: 'Shell Station'
      }
    };

    const result = CarEventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it('should validate EventKind enum values', () => {
    const validTypes = ['fuel', 'service', 'tires', 'damage', 'obd', 'custom'];
    
    validTypes.forEach(type => {
      const result = EventKindSchema.safeParse(type);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid EventKind values', () => {
    const result = EventKindSchema.safeParse('invalid-type');
    expect(result.success).toBe(false);
  });

  it('should validate a valid Attachment', () => {
    const validAttachment = {
      id: 'att-1',
      kind: 'image',
      name: 'receipt.jpg',
      mime: 'image/jpeg',
      sizeBytes: 1024000,
      url: 'blob:http://localhost:3000/abc123',
      createdAt: '2024-01-15T10:30:00Z'
    };

    const result = AttachmentSchema.safeParse(validAttachment);
    expect(result.success).toBe(true);
  });
});