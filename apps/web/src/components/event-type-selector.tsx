'use client';

import { useSettings } from '../lib/use-settings';
import { type EventKind } from '../types/settings';

const EVENT_TYPE_LABELS: Record<EventKind, string> = {
  fuel: 'Fuel',
  service: 'Service',
  tires: 'Tires',
  damage: 'Damage',
  obd: 'OBD',
  custom: 'Custom',
};

interface EventTypeSelectorProps {
  selectedType?: EventKind;
  onTypeSelect: (type: EventKind) => void;
  className?: string;
}

/**
 * Example component that demonstrates how to use settings to hide disabled event types
 * This would be used in the event creation wizard
 */
export function EventTypeSelector({ 
  selectedType, 
  onTypeSelect, 
  className = '' 
}: EventTypeSelectorProps) {
  const { settings, isLoading } = useSettings();

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Only show enabled event types
  const enabledEventTypes = settings?.enabledEventTypes ?? [];

  if (enabledEventTypes.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">
          No event types are enabled. Please enable some event types in settings.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3">
        {enabledEventTypes.map((eventType) => (
          <button
            key={eventType}
            onClick={() => onTypeSelect(eventType)}
            className={`
              p-4 rounded-lg border-2 text-left transition-colors
              ${selectedType === eventType
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }
            `}
          >
            <div className="font-medium text-sm">
              {EVENT_TYPE_LABELS[eventType]}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}