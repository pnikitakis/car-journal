'use client';

import { VehicleProfile } from './vehicle-profile';

/**
 * Example usage of the VehicleProfile component
 * This demonstrates how to integrate the vehicle profile management
 * into a page or larger component structure.
 */
export function VehicleProfileExample() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vehicle Profile
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your vehicle information and photos for your car journal.
          </p>
        </div>

        <VehicleProfile />
      </div>
    </div>
  );
}

export default VehicleProfileExample;