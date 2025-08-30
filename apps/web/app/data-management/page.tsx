import { DataExport } from '../../src/components/data-export';

export default function DataManagementPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Data Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Export, import, and manage your car journal data
        </p>
      </div>

      <DataExport />
    </div>
  );
}