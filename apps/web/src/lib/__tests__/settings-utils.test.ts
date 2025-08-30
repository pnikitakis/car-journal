import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getEnabledEventTypes, 
  isEventTypeEnabled, 
  filterEnabledEventTypes,
  getAllEventTypes,
  getSavedTags 
} from '../settings-utils';
import * as storage from '../storage';

// Mock the storage module
vi.mock('../storage', () => ({
  loadSettings: vi.fn(),
}));

const mockLoadSettings = vi.mocked(storage.loadSettings);

const mockSettings = {
  enabledEventTypes: ['fuel', 'service', 'tires'] as const,
  tags: ['maintenance', 'urgent', 'warranty'],
};

describe('settings-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadSettings.mockReturnValue(mockSettings);
  });

  describe('getEnabledEventTypes', () => {
    it('returns enabled event types from settings', () => {
      const result = getEnabledEventTypes();
      expect(result).toEqual(['fuel', 'service', 'tires']);
      expect(mockLoadSettings).toHaveBeenCalledOnce();
    });

    it('returns all event types when settings cannot be loaded', () => {
      mockLoadSettings.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = getEnabledEventTypes();
      expect(result).toEqual(['fuel', 'service', 'tires', 'damage', 'obd', 'custom']);
    });
  });

  describe('isEventTypeEnabled', () => {
    it('returns true for enabled event types', () => {
      expect(isEventTypeEnabled('fuel')).toBe(true);
      expect(isEventTypeEnabled('service')).toBe(true);
      expect(isEventTypeEnabled('tires')).toBe(true);
    });

    it('returns false for disabled event types', () => {
      expect(isEventTypeEnabled('damage')).toBe(false);
      expect(isEventTypeEnabled('obd')).toBe(false);
      expect(isEventTypeEnabled('custom')).toBe(false);
    });

    it('returns true for all types when settings cannot be loaded', () => {
      mockLoadSettings.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(isEventTypeEnabled('fuel')).toBe(true);
      expect(isEventTypeEnabled('damage')).toBe(true);
      expect(isEventTypeEnabled('custom')).toBe(true);
    });
  });

  describe('filterEnabledEventTypes', () => {
    it('filters array to only include enabled types', () => {
      const allTypes = ['fuel', 'service', 'tires', 'damage', 'obd', 'custom'] as const;
      const result = filterEnabledEventTypes([...allTypes]);
      expect(result).toEqual(['fuel', 'service', 'tires']);
    });

    it('returns empty array when no types are enabled', () => {
      mockLoadSettings.mockReturnValue({
        enabledEventTypes: [],
        tags: [],
      });

      const allTypes = ['fuel', 'service', 'tires', 'damage', 'obd', 'custom'] as const;
      const result = filterEnabledEventTypes([...allTypes]);
      expect(result).toEqual([]);
    });

    it('returns all types when settings cannot be loaded', () => {
      mockLoadSettings.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const allTypes = ['fuel', 'service', 'tires', 'damage', 'obd', 'custom'] as const;
      const result = filterEnabledEventTypes([...allTypes]);
      expect(result).toEqual(allTypes);
    });
  });

  describe('getAllEventTypes', () => {
    it('returns all available event types', () => {
      const result = getAllEventTypes();
      expect(result).toEqual(['fuel', 'service', 'tires', 'damage', 'obd', 'custom']);
    });
  });

  describe('getSavedTags', () => {
    it('returns saved tags from settings', () => {
      const result = getSavedTags();
      expect(result).toEqual(['maintenance', 'urgent', 'warranty']);
      expect(mockLoadSettings).toHaveBeenCalledOnce();
    });

    it('returns empty array when settings cannot be loaded', () => {
      mockLoadSettings.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = getSavedTags();
      expect(result).toEqual([]);
    });
  });
});