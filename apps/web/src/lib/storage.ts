import { z } from 'zod';
import { CarEventSchema, type CarEvent } from '../types/event';
import { VehicleSchema, type Vehicle } from '../types/vehicle';
import { UserSettingsSchema, type UserSettings, type EventKind } from '../types/settings';
import { validateData } from './validation';

/**
 * Storage key for localStorage persistence
 */
const STORAGE_KEY = 'car-journal/v1';

/**
 * Default user settings
 */
const DEFAULT_SETTINGS: UserSettings = {
  enabledEventTypes: ['fuel', 'service', 'tires', 'damage', 'obd', 'custom'] as EventKind[],
  tags: [],
};

/**
 * Application data structure stored in localStorage
 */
const AppDataSchema = z.object({
  events: z.array(CarEventSchema),
  vehicle: VehicleSchema.optional(),
  settings: UserSettingsSchema,
  version: z.string(),
});

type AppData = z.infer<typeof AppDataSchema>;

/**
 * Default application data structure
 */
const DEFAULT_APP_DATA: AppData = {
  events: [],
  vehicle: undefined,
  settings: DEFAULT_SETTINGS,
  version: '1.0.0',
};

/**
 * Storage error types
 */
export class StorageError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Checks if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely serializes data to JSON string
 */
function serializeData(data: AppData): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    throw new StorageError('Failed to serialize data', error as Error);
  }
}

/**
 * Safely deserializes JSON string to data
 */
function deserializeData(jsonString: string): AppData {
  try {
    const parsed = JSON.parse(jsonString);
    const validation = validateData(AppDataSchema, parsed);
    
    if (!validation.success) {
      throw new StorageError(`Invalid data format: ${validation.errors.message}`);
    }
    
    return validation.data;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Failed to deserialize data', error as Error);
  }
}

/**
 * Loads all application data from localStorage
 */
export function loadAppData(): AppData {
  if (!isLocalStorageAvailable()) {
    throw new StorageError('localStorage is not available in this environment');
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      // No data stored yet, return defaults
      return DEFAULT_APP_DATA;
    }
    
    return deserializeData(stored);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Failed to load data from localStorage', error as Error);
  }
}

/**
 * Saves all application data to localStorage
 */
export function saveAppData(data: AppData): void {
  if (!isLocalStorageAvailable()) {
    throw new StorageError('localStorage is not available in this environment');
  }

  try {
    const serialized = serializeData(data);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Failed to save data to localStorage', error as Error);
  }
}

/**
 * Loads events from localStorage
 */
export function loadEvents(): CarEvent[] {
  const data = loadAppData();
  return data.events;
}

/**
 * Saves events to localStorage
 */
export function saveEvents(events: CarEvent[]): void {
  const data = loadAppData();
  data.events = events;
  saveAppData(data);
}

/**
 * Adds a new event to localStorage
 */
export function addEvent(event: CarEvent): void {
  const events = loadEvents();
  events.push(event);
  saveEvents(events);
}

/**
 * Updates an existing event in localStorage
 */
export function updateEvent(eventId: string, updatedEvent: CarEvent): void {
  const events = loadEvents();
  const index = events.findIndex(e => e.id === eventId);
  
  if (index === -1) {
    throw new StorageError(`Event with id ${eventId} not found`);
  }
  
  events[index] = updatedEvent;
  saveEvents(events);
}

/**
 * Deletes an event from localStorage
 */
export function deleteEvent(eventId: string): void {
  const events = loadEvents();
  const filteredEvents = events.filter(e => e.id !== eventId);
  
  if (filteredEvents.length === events.length) {
    throw new StorageError(`Event with id ${eventId} not found`);
  }
  
  saveEvents(filteredEvents);
}

/**
 * Loads vehicle profile from localStorage
 */
export function loadVehicle(): Vehicle | undefined {
  const data = loadAppData();
  return data.vehicle;
}

/**
 * Alias for loadVehicle to match expected import name
 */
export function loadVehicleProfile(): Vehicle | undefined {
  return loadVehicle();
}

/**
 * Saves vehicle profile to localStorage
 */
export function saveVehicle(vehicle: Vehicle): void {
  const data = loadAppData();
  data.vehicle = vehicle;
  saveAppData(data);
}

/**
 * Loads user settings from localStorage
 */
export function loadSettings(): UserSettings {
  const data = loadAppData();
  return data.settings;
}

/**
 * Saves user settings to localStorage
 */
export function saveSettings(settings: UserSettings): void {
  const data = loadAppData();
  data.settings = settings;
  saveAppData(data);
}

/**
 * Clears all application data from localStorage
 */
export function clearAllData(): void {
  if (!isLocalStorageAvailable()) {
    throw new StorageError('localStorage is not available in this environment');
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    throw new StorageError('Failed to clear data from localStorage', error as Error);
  }
}

/**
 * Gets the current storage usage in bytes
 */
export function getStorageUsage(): number {
  if (!isLocalStorageAvailable()) {
    return 0;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? new Blob([stored]).size : 0;
}

/**
 * Storage statistics interface
 */
export interface StorageStats {
  available: boolean;
  events: number;
  hasVehicleProfile: boolean;
  used: number;
  total: number;
}

/**
 * Gets comprehensive storage statistics
 */
export function getStorageStats(): StorageStats {
  if (!isLocalStorageAvailable()) {
    return {
      available: false,
      events: 0,
      hasVehicleProfile: false,
      used: 0,
      total: 0,
    };
  }

  try {
    const data = loadAppData();
    const used = getStorageUsage();
    
    // Estimate total localStorage capacity (typically 5-10MB, we'll use 5MB as conservative estimate)
    const total = 5 * 1024 * 1024; // 5MB in bytes

    return {
      available: true,
      events: data.events.length,
      hasVehicleProfile: !!data.vehicle,
      used,
      total,
    };
  } catch (error) {
    return {
      available: false,
      events: 0,
      hasVehicleProfile: false,
      used: 0,
      total: 0,
    };
  }
}

/**
 * Exports all application data as JSON string
 */
export function exportData(): string {
  const data = loadAppData();
  return JSON.stringify(data, null, 2);
}

/**
 * Imports application data from JSON string
 */
export function importData(jsonString: string): void {
  const data = deserializeData(jsonString);
  saveAppData(data);
}