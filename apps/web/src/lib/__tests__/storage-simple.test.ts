import { describe, it, expect } from 'vitest';
import { validateData } from '../validation';
import { CarEventSchema, VehicleSchema, UserSettingsSchema } from '../../types';

// Test the core validation and serialization logic without localStorage
describe('Storage validation and serialization', () => {
  describe('Data validation', () => {
    it('should validate CarEvent data correctly', () => {
      const validEvent = {
        id: 'event-1',
        type: 'fuel',
        title: 'Gas fill-up',
        occurredAt: '2024-01-01T10:00:00Z',
        mileageKm: 50000,
        notes: 'Regular fill-up',
        tags: ['routine'],
        attachments: [],
        fuel: {
          liters: 45,
          totalAmount: 60.50,
          station: 'Shell',
        },
      };

      const result = validateData(CarEventSchema, validEvent);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('event-1');
        expect(result.data.type).toBe('fuel');
        expect(result.data.fuel?.liters).toBe(45);
      }
    });

    it('should reject invalid CarEvent data', () => {
      const invalidEvent = {
        id: 'event-1',
        type: 'invalid-type', // Invalid event type
        title: 'Gas fill-up',
        occurredAt: '2024-01-01T10:00:00Z',
        tags: ['routine'],
        attachments: [],
      };

      const result = validateData(CarEventSchema, invalidEvent);
      expect(result.success).toBe(false);
    });

    it('should validate Vehicle data correctly', () => {
      const validVehicle = {
        id: 'vehicle-1',
        make: 'Toyota',
        model: 'Camry',
        plate: 'ABC-123',
        vin: '1234567890',
        fuelType: 'gasoline',
        purchasedOn: '2020-01-01',
        notes: 'Great car',
        photos: [],
      };

      const result = validateData(VehicleSchema, validVehicle);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.make).toBe('Toyota');
        expect(result.data.model).toBe('Camry');
      }
    });

    it('should validate UserSettings data correctly', () => {
      const validSettings = {
        enabledEventTypes: ['fuel', 'service'],
        tags: ['maintenance', 'routine'],
      };

      const result = validateData(UserSettingsSchema, validSettings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.enabledEventTypes).toEqual(['fuel', 'service']);
        expect(result.data.tags).toEqual(['maintenance', 'routine']);
      }
    });
  });

  describe('JSON serialization', () => {
    it('should serialize and deserialize data correctly', () => {
      const testData = {
        events: [],
        vehicle: {
          id: 'vehicle-1',
          make: 'Toyota',
          model: 'Camry',
          photos: [],
        },
        settings: {
          enabledEventTypes: ['fuel', 'service'],
          tags: ['maintenance'],
        },
        version: '1.0.0',
      };

      // Test serialization
      const serialized = JSON.stringify(testData);
      expect(typeof serialized).toBe('string');

      // Test deserialization
      const deserialized = JSON.parse(serialized);
      expect(deserialized).toEqual(testData);
    });

    it('should handle malformed JSON gracefully', () => {
      const malformedJson = '{"invalid": json}';
      
      expect(() => JSON.parse(malformedJson)).toThrow();
    });
  });
});