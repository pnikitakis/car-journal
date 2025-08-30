'use client';

import { useState } from 'react';
import { SettingsPage } from './settings-page';
import { EventTypeSelector } from './event-type-selector';
import { type EventKind } from '../types/settings';

/**
 * Example component demonstrating the settings system integration
 */
export function SettingsExample() {
  const [selectedEventType, setSelectedEventType] = useState<EventKind | undefined>();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Settings System Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This demonstrates how the settings system works to customize the Car Journal experience.
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          {showSettings ? 'Hide Settings' : 'Show Settings'}
        </button>
      </div>

      {showSettings && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <SettingsPage />
        </div>
      )}

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Event Type Selector (Respects Settings)
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This component only shows event types that are enabled in settings. 
          Try disabling some event types above and see how this selector updates.
        </p>
        
        <EventTypeSelector
          selectedType={selectedEventType}
          onTypeSelect={setSelectedEventType}
          className="max-w-md"
        />
        
        {selectedEventType && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-green-800 dark:text-green-200 text-sm">
              Selected event type: <strong>{selectedEventType}</strong>
            </p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          How it works
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>• Settings are persisted to localStorage with key "car-journal/v1"</li>
          <li>• Event type toggles control which types appear in the UI</li>
          <li>• Tag management allows creating reusable tags for events</li>
          <li>• Components use the useSettings hook to respect user preferences</li>
          <li>• Utility functions provide easy access to settings for filtering</li>
        </ul>
      </div>
    </div>
  );
}