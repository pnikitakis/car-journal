'use client';

import { useState, useEffect } from 'react';
import { CarEvent } from '../types';
import { loadEvents } from '../lib/storage';
import { EventCard } from './event-card';
import { EventDetailModal } from './event-detail-modal';

interface EventTimelineProps {
  className?: string;
}

export function EventTimeline({ className = '' }: EventTimelineProps) {
  const [events, setEvents] = useState<CarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setEvents(sortedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

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

  if (events.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
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
        <button
          onClick={() => {
            // This would typically navigate to the event creation wizard
            // For now, we'll just show a placeholder
            console.log('Navigate to event creation');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add Your First Event
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => handleEventClick(event)}
          />
        ))}
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