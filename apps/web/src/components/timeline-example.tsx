'use client';

import { EventTimeline } from './event-timeline';

/**
 * Example component demonstrating the EventTimeline usage
 */
export function TimelineExample() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Car Journal Timeline
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your vehicle's event history
        </p>
      </div>

      <EventTimeline className="space-y-4" />
    </div>
  );
}