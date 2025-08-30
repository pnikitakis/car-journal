'use client';

import { useState } from 'react';
import { EventCreationWizard } from './event-creation-wizard';
import { type CarEvent } from '../types/event';

/**
 * Example component demonstrating the Event Creation Wizard
 */
export function EventCreationExample() {
  const [showWizard, setShowWizard] = useState(false);
  const [createdEvents, setCreatedEvents] = useState<CarEvent[]>([]);

  const handleEventCreated = (event: CarEvent) => {
    setCreatedEvents(prev => [event, ...prev]);
    setShowWizard(false);
    console.log('Event created:', event);
  };

  const handleCancel = () => {
    setShowWizard(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Event Creation Wizard Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This demonstrates the multi-step event creation wizard with type selection, 
          core fields, attachments, and type-specific details.
        </p>
      </div>

      {!showWizard ? (
        <div className="space-y-6">
          {/* Create Event Button */}
          <div className="text-center">
            <button
              onClick={() => setShowWizard(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              + Create New Event
            </button>
          </div>

          {/* Created Events List */}
          {createdEvents.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Created Events ({createdEvents.length})
              </h2>
              <div className="space-y-4">
                {createdEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </h3>
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p>
                            <span className="font-medium">Type:</span> {event.type}
                          </p>
                          <p>
                            <span className="font-medium">Date:</span>{' '}
                            {new Date(event.occurredAt).toLocaleDateString()}
                          </p>
                          {event.mileageKm && (
                            <p>
                              <span className="font-medium">Mileage:</span>{' '}
                              {event.mileageKm.toLocaleString()} km
                            </p>
                          )}
                          {event.notes && (
                            <p>
                              <span className="font-medium">Notes:</span> {event.notes}
                            </p>
                          )}
                          {event.tags.length > 0 && (
                            <div>
                              <span className="font-medium">Tags:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {event.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {event.attachments.length > 0 && (
                            <p>
                              <span className="font-medium">Attachments:</span>{' '}
                              {event.attachments.length} file(s)
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {event.type}
                      </span>
                    </div>

                    {/* Type-specific details */}
                    {(event.fuel || event.service || event.tires || event.obd) && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {event.fuel && (
                            <div>
                              <span className="font-medium">Fuel Details:</span>
                              {event.fuel.liters && ` ${event.fuel.liters}L`}
                              {event.fuel.totalAmount && ` $${event.fuel.totalAmount}`}
                              {event.fuel.station && ` at ${event.fuel.station}`}
                            </div>
                          )}
                          {event.service && (
                            <div>
                              <span className="font-medium">Service Details:</span>
                              {event.service.workshop && ` ${event.service.workshop}`}
                              {event.service.cost && ` $${event.service.cost}`}
                            </div>
                          )}
                          {event.tires && (
                            <div>
                              <span className="font-medium">Tire Details:</span>
                              {event.tires.brand && ` ${event.tires.brand}`}
                              {event.tires.model && ` ${event.tires.model}`}
                              {event.tires.size && ` ${event.tires.size}`}
                              {event.tires.position && ` (${event.tires.position})`}
                            </div>
                          )}
                          {event.obd && (
                            <div>
                              <span className="font-medium">OBD Details:</span>
                              {event.obd.source && ` Source: ${event.obd.source}`}
                              {event.obd.fileName && ` File: ${event.obd.fileName}`}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {createdEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No events created yet. Click the button above to create your first event.
              </p>
            </div>
          )}
        </div>
      ) : (
        <EventCreationWizard
          onEventCreated={handleEventCreated}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}