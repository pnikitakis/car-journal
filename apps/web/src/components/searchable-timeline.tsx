'use client';

import { useState, useEffect, useMemo } from 'react';
import { CarEvent, EventKind } from '../types';
import { loadEvents } from '../lib/storage';
import { filterAndSearchEvents, getUniqueTagsFromEvents, SearchFilters } from '../lib/search-utils';
import { SearchBar } from './search-bar';
import { EventFilters } from './event-filters';
import { EventCard } from './event-card';
import { EventDetailModal } from './event-detail-modal';

interface SearchableTimelineProps {
  className?: string;
}

export function SearchableTimeline({ className = '' }: SearchableTimelineProps) {
  const [allEvents, setAllEvents] = useState<CarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventTypes, setSelectedEventTypes] = useState<EventKind[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    loadEventsData();
  }, []);

  const loadEventsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedEvents = loadEvents();
      // Sort events in reverse chronological order (newest first)
      const sortedEvents = loadedEvents.sort((a, b) => 
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      );
      setAllEvents(sortedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Memoized filtered events
  const filteredEvents = useMemo(() => {
    const filters: SearchFilters = {
      searchQuery: searchQuery.trim() || undefined,
      eventTypes: selectedEventTypes.length > 0 ? selectedEventTypes : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      dateRange: dateRange || undefined,
    };

    return filterAndSearchEvents(allEvents, filters);
  }, [allEvents, searchQuery, selectedEventTypes, selectedTags, dateRange]);

  // Available tags from all events
  const availableTags = useMemo(() => {
    return getUniqueTagsFromEvents(allEvents);
  }, [allEvents]);

  const handleEventClick = (event: CarEvent) => {
    setSelectedEvent(event);
  };

  const handleEventDeleted = () => {
    setSelectedEvent(null);
    loadEventsData(); // Reload events after deletion
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedEventTypes([]);
    setSelectedTags([]);
    setDateRange(null);
  };

  const hasActiveFilters = searchQuery || selectedEventTypes.length > 0 || selectedTags.length > 0 || dateRange;

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-gray-500 dark:text-gray-400">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium">Error Loading Events</h3>
          <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
          <button
            onClick={loadEventsData}
            className="mt-2 text-sm text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full"
        />

        {/* Filters */}
        <EventFilters
          selectedEventTypes={selectedEventTypes}
          onEventTypesChange={setSelectedEventTypes}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          availableTags={availableTags}
        />

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            {hasActiveFilters ? (
              <>
                Showing {filteredEvents.length} of {allEvents.length} events
                {filteredEvents.length !== allEvents.length && (
                  <button
                    onClick={clearAllFilters}
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline"
                  >
                    Clear filters
                  </button>
                )}
              </>
            ) : (
              `${allEvents.length} events`
            )}
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            {allEvents.length === 0 ? (
              // No events at all
              <>
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Events Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
                  Start building your car's history by adding your first event. Record fuel-ups, 
                  maintenance, repairs, and more.
                </p>
              </>
            ) : (
              // No events match filters
              <>
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Events Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
                  No events match your current search and filter criteria. Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline"
                >
                  Clear all filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={handleCloseModal}
          onEventDeleted={handleEventDeleted}
        />
      )}
    </div>
  );
}