import { SearchableTimeline } from '../../src/components/searchable-timeline';

export default function SearchEventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Search Events
      </h1>
      <SearchableTimeline />
    </div>
  );
}