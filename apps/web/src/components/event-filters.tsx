'use client';

import { useState } from 'react';
import { EventKind } from '../types';
import { formatEventType } from '../lib/format-utils';

interface EventFiltersProps {
  selectedEventTypes: EventKind[];
  onEventTypesChange: (types: EventKind[]) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  dateRange: { start: string; end: string } | null;
  onDateRangeChange: (range: { start: string; end: string } | null) => void;
  availableTags: string[];
  className?: string;
}

const ALL_EVENT_TYPES: EventKind[] = ['fuel', 'service', 'tires', 'damage', 'obd', 'custom'];

export function EventFilters({
  selectedEventTypes,
  onEventTypesChange,
  selectedTags,
  onTagsChange,
  dateRange,
  onDateRangeChange,
  availableTags,
  className = ''
}: EventFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEventTypeToggle = (eventType: EventKind) => {
    if (selectedEventTypes.includes(eventType)) {
      onEventTypesChange(selectedEventTypes.filter(type => type !== eventType));
    } else {
      onEventTypesChange([...selectedEventTypes, eventType]);
    }
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    if (!value) {
      onDateRangeChange(null);
      return;
    }

    const newRange = dateRange || { start: '', end: '' };
    onDateRangeChange({
      ...newRange,
      [field]: value
    });
  };

  const clearAllFilters = () => {
    onEventTypesChange([]);
    onTagsChange([]);
    onDateRangeChange(null);
  };

  const hasActiveFilters = selectedEventTypes.length > 0 || selectedTags.length > 0 || dateRange;

  const getEventTypeColor = (type: EventKind) => {
    const colors = {
      fuel: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700',
      service: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700',
      tires: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700',
      damage: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700',
      obd: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700',
      custom: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700',
    };
    return colors[type];
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Filters
          </h3>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-6">
            {/* Event Types */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Event Types
              </h4>
              <div className="flex flex-wrap gap-2">
                {ALL_EVENT_TYPES.map((eventType) => (
                  <button
                    key={eventType}
                    onClick={() => handleEventTypeToggle(eventType)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      selectedEventTypes.includes(eventType)
                        ? getEventTypeColor(eventType)
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                    }`}
                  >
                    {formatEventType(eventType)}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Date Range
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={dateRange?.start || ''}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    value={dateRange?.end || ''}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            {availableTags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}