import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from '../use-settings';
import * as storage from '../storage';

// Mock the storage module
vi.mock('../storage', () => ({
  loadSettings: vi.fn(),
  saveSettings: vi.fn(),
  StorageError: class StorageError extends Error {
    constructor(message: string, public readonly cause?: Error) {
      super(message);
      this.name = 'StorageError';
    }
  },
}));

const mockLoadSettings = vi.mocked(storage.loadSettings);
const mockSaveSettings = vi.mocked(storage.saveSettings);

const defaultSettings = {
  enabledEventTypes: ['fuel', 'service', 'tires', 'damage', 'obd', 'custom'] as const,
  tags: ['maintenance', 'urgent'],
};

describe('useSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadSettings.mockReturnValue(defaultSettings);
  });

  it('loads settings on mount', async () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.isLoading).toBe(true);
    
    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.settings).toEqual(defaultSettings);
    expect(result.current.error).toBe(null);
    expect(mockLoadSettings).toHaveBeenCalledOnce();
  });

  it('handles storage errors when loading', async () => {
    const error = new storage.StorageError('localStorage not available');
    mockLoadSettings.mockImplementation(() => {
      throw error;
    });

    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.settings).toBe(null);
    expect(result.current.error).toBe('localStorage not available');
  });

  it('toggles event type on', async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Remove 'fuel' from enabled types first
    const settingsWithoutFuel = {
      ...defaultSettings,
      enabledEventTypes: ['service', 'tires', 'damage', 'obd', 'custom'] as const,
    };
    
    await act(async () => {
      result.current.setSettings(settingsWithoutFuel);
    });

    // Now toggle fuel back on
    await act(async () => {
      await result.current.toggleEventType('fuel');
    });

    expect(mockSaveSettings).toHaveBeenCalledWith({
      ...settingsWithoutFuel,
      enabledEventTypes: ['service', 'tires', 'damage', 'obd', 'custom', 'fuel'],
    });
  });

  it('toggles event type off', async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.toggleEventType('fuel');
    });

    expect(mockSaveSettings).toHaveBeenCalledWith({
      ...defaultSettings,
      enabledEventTypes: ['service', 'tires', 'damage', 'obd', 'custom'],
    });
  });

  it('adds a new tag', async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addTag('new-tag');
    });

    expect(mockSaveSettings).toHaveBeenCalledWith({
      ...defaultSettings,
      tags: ['maintenance', 'urgent', 'new-tag'],
    });
  });

  it('does not add duplicate tags', async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addTag('maintenance'); // Already exists
    });

    expect(mockSaveSettings).not.toHaveBeenCalled();
  });

  it('does not add empty tags', async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addTag('   '); // Only whitespace
    });

    expect(mockSaveSettings).not.toHaveBeenCalled();
  });

  it('removes a tag', async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.removeTag('maintenance');
    });

    expect(mockSaveSettings).toHaveBeenCalledWith({
      ...defaultSettings,
      tags: ['urgent'],
    });
  });

  it('edits a tag', async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.editTag('maintenance', 'scheduled-maintenance');
    });

    expect(mockSaveSettings).toHaveBeenCalledWith({
      ...defaultSettings,
      tags: ['scheduled-maintenance', 'urgent'],
    });
  });

  it('throws error when editing to existing tag', async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await expect(
      act(async () => {
        await result.current.editTag('maintenance', 'urgent'); // 'urgent' already exists
      })
    ).rejects.toThrow('Tag already exists');
  });

  it('checks if event type is enabled', async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isEventTypeEnabled('fuel')).toBe(true);
    expect(result.current.isEventTypeEnabled('service')).toBe(true);
  });

  it('returns enabled event types', async () => {
    const { result } = renderHook(() => useSettings());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.getEnabledEventTypes()).toEqual([
      'fuel', 'service', 'tires', 'damage', 'obd', 'custom'
    ]);
  });
});