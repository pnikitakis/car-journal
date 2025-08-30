import { EventCreationWizard } from '../../src/components/event-creation-wizard';

export default function AddEventPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Add New Event
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Record a new maintenance event, fuel-up, or incident
          </p>
        </div>
        
        <EventCreationWizard />
      </div>
    </div>
  );
}