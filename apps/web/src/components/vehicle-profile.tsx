'use client';

import { useState, useEffect } from 'react';
import { type Vehicle } from '../types/vehicle';
import { loadVehicle, saveVehicle, StorageError } from '../lib/storage';
import { VehicleProfileForm } from './vehicle-profile-form';
import { VehicleProfileDisplay } from './vehicle-profile-display';

interface VehicleProfileProps {
  className?: string;
}

export function VehicleProfile({ className = '' }: VehicleProfileProps) {
  const [vehicle, setVehicle] = useState<Vehicle | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load vehicle data on component mount
  useEffect(() => {
    loadVehicleData();
  }, []);

  const loadVehicleData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const vehicleData = loadVehicle();
      setVehicle(vehicleData);
      
      // If no vehicle exists, start in editing mode
      if (!vehicleData) {
        setIsEditing(true);
      }
    } catch (err) {
      if (err instanceof StorageError) {
        setError(err.message);
      } else {
        setError('Failed to load vehicle profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (vehicleData: Vehicle) => {
    try {
      setError(null);
      saveVehicle(vehicleData);
      setVehicle(vehicleData);
      setIsEditing(false);
    } catch (err) {
      if (err instanceof StorageError) {
        setError(err.message);
      } else {
        setError('Failed to save vehicle profile');
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading vehicle profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error loading vehicle profile
            </h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            <div className="mt-4">
              <button
                onClick={loadVehicleData}
                className="text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-700 dark:hover:text-red-100 focus:outline-none focus:underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {isEditing ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {vehicle ? 'Edit Vehicle Profile' : 'Add Vehicle Profile'}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {vehicle 
                ? 'Update your vehicle information and photos.' 
                : 'Add your vehicle details to get started with your car journal.'
              }
            </p>
          </div>
          
          <VehicleProfileForm
            vehicle={vehicle}
            onSave={handleSave}
            onCancel={vehicle ? handleCancel : undefined}
          />
          
          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>
      ) : (
        vehicle && (
          <VehicleProfileDisplay
            vehicle={vehicle}
            onEdit={handleEdit}
          />
        )
      )}
    </div>
  );
}