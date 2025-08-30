'use client';

import { useState } from 'react';
import { type Vehicle } from '../types/vehicle';
import { type Attachment } from '../types/event';

interface VehicleProfileDisplayProps {
  vehicle: Vehicle;
  onEdit?: () => void;
  className?: string;
}

export function VehicleProfileDisplay({ 
  vehicle, 
  onEdit, 
  className = '' 
}: VehicleProfileDisplayProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Attachment | null>(null);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Get display value with fallback
  const getDisplayValue = (value?: string) => {
    return value || 'Not specified';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Vehicle Profile
        </h2>
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Vehicle Photos */}
        {vehicle.photos && vehicle.photos.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Photos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {vehicle.photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                >
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-24 object-cover rounded-md border border-gray-300 dark:border-gray-600 group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-md transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Vehicle Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Basic Information
            </h3>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Make</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{getDisplayValue(vehicle.make)}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Model</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{getDisplayValue(vehicle.model)}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">License Plate</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{getDisplayValue(vehicle.plate)}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Fuel Type</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{getDisplayValue(vehicle.fuelType)}</dd>
            </div>
          </div>

          {/* Technical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Technical Information
            </h3>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">VIN</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono break-all">{getDisplayValue(vehicle.vin)}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Purchase Date</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(vehicle.purchasedOn)}</dd>
            </div>
          </div>
        </div>

        {/* Notes */}
        {vehicle.notes && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
              Notes
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {vehicle.notes}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!vehicle.make && !vehicle.model && !vehicle.plate && !vehicle.vin && !vehicle.notes && (!vehicle.photos || vehicle.photos.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              No vehicle information
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Add your vehicle details to get started with your car journal.
            </p>
            {onEdit && (
              <button
                onClick={onEdit}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Vehicle Information
              </button>
            )}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white rounded"
            >
              <span className="sr-only">Close</span>
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
              <p className="text-sm font-medium">{selectedPhoto.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}