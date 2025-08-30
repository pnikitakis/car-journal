/**
 * Example usage of the storage utilities
 * This file demonstrates how to use the storage functions
 */

import { 
  loadAppData, 
  saveAppData, 
  addEvent, 
  loadEvents, 
  saveVehicle, 
  loadVehicle,
  saveSettings,
  loadSettings,
  StorageError 
} from './storage';
import type { CarEvent, Vehicle, UserSettings } from '../types';

/**
 * Example: Adding a fuel event
 */
export function addFuelEvent() {
  try {
    const fuelEvent: CarEvent = {
      id: `fuel-${Date.now()}`,
      type: 'fuel',
      title: 'Gas Station Fill-up',
      occurredAt: new Date().toISOString(),
      mileageKm: 50000,
      notes: 'Regular 87 octane',
      tags: ['routine', 'fuel'],
      attachments: [],
      fuel: {
        liters: 45.5,
        totalAmount: 62.75,
        station: 'Shell Station'
      }
    };

    addEvent(fuelEvent);
    console.log('Fuel event added successfully');
  } catch (error) {
    if (error instanceof StorageError) {
      console.error('Storage error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example: Loading and displaying events
 */
export function displayEvents() {
  try {
    const events = loadEvents();
    console.log(`Found ${events.length} events:`);
    
    events.forEach(event => {
      console.log(`- ${event.title} (${event.type}) - ${event.occurredAt}`);
    });
  } catch (error) {
    if (error instanceof StorageError) {
      console.error('Storage error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example: Setting up vehicle profile
 */
export function setupVehicleProfile() {
  try {
    const vehicle: Vehicle = {
      id: 'my-vehicle',
      make: 'Toyota',
      model: 'Camry',
      plate: 'ABC-123',
      vin: '1HGBH41JXMN109186',
      fuelType: 'gasoline',
      purchasedOn: '2020-01-15',
      notes: 'Reliable daily driver',
      photos: []
    };

    saveVehicle(vehicle);
    console.log('Vehicle profile saved successfully');
  } catch (error) {
    if (error instanceof StorageError) {
      console.error('Storage error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example: Configuring user settings
 */
export function configureSettings() {
  try {
    const settings: UserSettings = {
      enabledEventTypes: ['fuel', 'service', 'tires'],
      tags: ['routine', 'maintenance', 'emergency', 'warranty']
    };

    saveSettings(settings);
    console.log('Settings saved successfully');
  } catch (error) {
    if (error instanceof StorageError) {
      console.error('Storage error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example: Complete data initialization
 */
export function initializeAppData() {
  try {
    // Load existing data or get defaults
    const appData = loadAppData();
    console.log('App data loaded:', {
      eventsCount: appData.events.length,
      hasVehicle: !!appData.vehicle,
      enabledEventTypes: appData.settings.enabledEventTypes.length
    });

    // If no vehicle is set up, create a default one
    if (!appData.vehicle) {
      setupVehicleProfile();
    }

    // If no events exist, add a sample one
    if (appData.events.length === 0) {
      addFuelEvent();
    }

    console.log('App initialization complete');
  } catch (error) {
    if (error instanceof StorageError) {
      console.error('Storage error during initialization:', error.message);
      console.log('This might be the first run or localStorage is unavailable');
    } else {
      console.error('Unexpected error during initialization:', error);
    }
  }
}