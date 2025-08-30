import { useState, useEffect, useCallback } from 'react';
import { type UserSettings, type EventKind } from '../types/settings';
import { loadSettings, saveSettings, StorageError } from './storage';

/**
 * Hook for managing user settings with localStorage persistence
 */
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    try {
      const loadedSettings = loadSettings();
      setSettings(loadedSettings);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof StorageError 
        ? err.message 
        : 'Failed to load settings';
      setError(errorMessage);
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = useCallback(async (newSettings: UserSettings) => {
    try {
      saveSettings(newSettings);
      setSettings(newSettings);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof StorageError 
        ? err.message 
        : 'Failed to save settings';
      setError(errorMessage);
      console.error('Failed to save settings:', err);
      throw err;
    }
  }, []);

  // Toggle event type enabled/disabled
  const toggleEventType = useCallback(async (eventType: EventKind) => {
    if (!settings) return;

    const isEnabled = settings.enabledEventTypes.includes(eventType);
    const newEnabledTypes = isEnabled
      ? settings.enabledEventTypes.filter(type => type !== eventType)
      : [...settings.enabledEventTypes, eventType];

    await updateSettings({
      ...settings,
      enabledEventTypes: newEnabledTypes,
    });
  }, [settings, updateSettings]);

  // Add a new tag
  const addTag = useCallback(async (tag: string) => {
    if (!settings) return;

    const trimmedTag = tag.trim();
    if (!trimmedTag || settings.tags.includes(trimmedTag)) {
      return; // Don't add empty or duplicate tags
    }

    await updateSettings({
      ...settings,
      tags: [...settings.tags, trimmedTag],
    });
  }, [settings, updateSettings]);

  // Remove a tag
  const removeTag = useCallback(async (tagToRemove: string) => {
    if (!settings) return;

    await updateSettings({
      ...settings,
      tags: settings.tags.filter(tag => tag !== tagToRemove),
    });
  }, [settings, updateSettings]);

  // Edit a tag
  const editTag = useCallback(async (oldTag: string, newTag: string) => {
    if (!settings) return;

    const trimmedNewTag = newTag.trim();
    if (!trimmedNewTag) {
      // If new tag is empty, remove the old tag
      await removeTag(oldTag);
      return;
    }

    if (trimmedNewTag === oldTag) {
      return; // No change
    }

    if (settings.tags.includes(trimmedNewTag)) {
      throw new Error('Tag already exists');
    }

    const updatedTags = settings.tags.map(tag => 
      tag === oldTag ? trimmedNewTag : tag
    );

    await updateSettings({
      ...settings,
      tags: updatedTags,
    });
  }, [settings, updateSettings, removeTag]);

  // Check if an event type is enabled
  const isEventTypeEnabled = useCallback((eventType: EventKind): boolean => {
    return settings?.enabledEventTypes.includes(eventType) ?? true;
  }, [settings]);

  // Get enabled event types for filtering
  const getEnabledEventTypes = useCallback((): EventKind[] => {
    return settings?.enabledEventTypes ?? [];
  }, [settings]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    toggleEventType,
    addTag,
    removeTag,
    editTag,
    isEventTypeEnabled,
    getEnabledEventTypes,
  };
}