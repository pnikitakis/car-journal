import { type EventKind } from '../types/settings';
import { loadSettings } from './storage';

/**
 * Gets the currently enabled event types from settings
 * Falls back to all event types if settings can't be loaded
 */
export function getEnabledEventTypes(): EventKind[] {
  try {
    const settings = loadSettings();
    return settings.enabledEventTypes;
  } catch {
    // Fallback to all event types if settings can't be loaded
    return ['fuel', 'service', 'tires', 'damage', 'obd', 'custom'];
  }
}

/**
 * Checks if a specific event type is enabled
 */
export function isEventTypeEnabled(eventType: EventKind): boolean {
  const enabledTypes = getEnabledEventTypes();
  return enabledTypes.includes(eventType);
}

/**
 * Filters an array of event types to only include enabled ones
 */
export function filterEnabledEventTypes(eventTypes: EventKind[]): EventKind[] {
  const enabledTypes = getEnabledEventTypes();
  return eventTypes.filter(type => enabledTypes.includes(type));
}

/**
 * Gets all available event types (for settings UI)
 */
export function getAllEventTypes(): EventKind[] {
  return ['fuel', 'service', 'tires', 'damage', 'obd', 'custom'];
}

/**
 * Gets saved tags from settings
 */
export function getSavedTags(): string[] {
  try {
    const settings = loadSettings();
    return settings.tags;
  } catch {
    return [];
  }
}