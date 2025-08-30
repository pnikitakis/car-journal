import { EventTimeline } from '../../src/components/event-timeline';

export default function TimelinePage() {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Event Timeline
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all your car events in chronological order
          </p>
        </div>
        
        <EventTimeline />
      </div>
    </div>
  );
}