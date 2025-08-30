import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  loadSettings, 
  saveSettings, 
  loadAppData, 
  saveAppData 
} from '../storage';
import { 
  getEnabledEventTypes, 
  isEventTypeEnabled, 
  getSavedTags 
} from '../settings-utils';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Settings Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should save and load settings correctly', () => {
    const testSettings = {
      enabledEventTypes: ['fuel', 'service'] as const,
      tags: ['maintenance', 'urgent'],
    };

    // Mock the storage to return our test data
    const appData = {
      events: [],
      vehicle: undefined,
      settings: testSettings,
      version: '1.0.0',
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(appData));

    // Test loading settings
    const loadedSettings = loadSettings();
    expect(loadedSettings).toEqual(testSettings);

    // Test utility functions
    expect(getEnabledEventTypes()).toEqual(['fuel', 'service']);
    expect(isEventTypeEnabled('fuel')).toBe(true);
    expect(isEventTypeEnabled('tires')).toBe(false);
    expect(getSavedTags()).toEqual(['maintenance', 'urgent']);
  });

  it('should handle settings updates correctly', () => {
    const initialSettings = {
      enabledEventTypes: ['fuel', 'service', 'tires'] as const,
      tags: ['maintenance'],
    };

    const updatedSettings = {
      enabledEventTypes: ['fuel', 'service'] as const, // removed 'tires'
      tags: ['maintenance', 'urgent'], // added 'urgent'
    };

    // Mock existing data in localStorage
    const existingData = {
      events: [],
      vehicle: undefined,
      settings: initialSettings,
      version: '1.0.0',
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingData));

    // Save updated settings
    saveSettings(updatedSettings);

    // Verify saveAppData was called (skip the localStorage availability check call)
    expect(localStorageMock.setItem).toHaveBeenCalled();
    
    // Find the call that saves the actual data (not the availability test)
    const saveCalls = localStorageMock.setItem.mock.calls.filter(
      ([key]) => key === 'car-journal/v1'
    );
    expect(saveCalls.length).toBeGreaterThan(0);
    
    const [key, value] = saveCalls[0];
    expect(key).toBe('car-journal/v1');
    
    const savedData = JSON.parse(value);
    expect(savedData.settings).toEqual(updatedSettings);
  });

  it('should provide fallback behavior when localStorage fails', () => {
    // Mock localStorage to throw an error
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });

    // Utility functions should still work with fallbacks
    expect(getEnabledEventTypes()).toEqual([
      'fuel', 'service', 'tires', 'damage', 'obd', 'custom'
    ]);
    expect(isEventTypeEnabled('fuel')).toBe(true);
    expect(getSavedTags()).toEqual([]);
  });

  it('should handle corrupted localStorage data gracefully', () => {
    // Mock corrupted JSON data
    localStorageMock.getItem.mockReturnValue('invalid json');

    // Should fall back to defaults
    expect(getEnabledEventTypes()).toEqual([
      'fuel', 'service', 'tires', 'damage', 'obd', 'custom'
    ]);
    expect(getSavedTags()).toEqual([]);
  });
});