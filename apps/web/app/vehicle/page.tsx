import { VehicleProfile } from '../../src/components/vehicle-profile';

export default function VehiclePage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Vehicle Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your vehicle information and photos
          </p>
        </div>
        
        <VehicleProfile />
      </div>
    </div>
  );
}