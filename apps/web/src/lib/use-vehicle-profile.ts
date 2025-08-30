'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Vehicle } from '../types/vehicle';
import { loadVehicle, saveVehicle, StorageError } from './storage';

interface UseVehicleProfileReturn {
  vehicle: Vehicle | undefined;
  isLoading: boolean;
  error: string | null;
  saveVehicleProfile: (vehicle: Vehicle) => Promise<void>;
  refreshVehicle: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for managing vehicle profile state and operations
 */
export function useVehicleProfile(): UseVehicleProfileReturn {
  const [vehicle, setVehicle] = useState<Vehicle | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load vehicle data
  const loadVehicleData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const vehicleData = loadVehicle();
      setVehicle(vehicleData);
    } catch (err) {
      if (err instanceof StorageError) {
        setError(err.message);
      } else {
        setError('Failed to load vehicle profile');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save vehicle profile
  const saveVehicleProfile = useCallback(async (vehicleData: Vehicle) => {
    try {
      setError(null);
      saveVehicle(vehicleData);
      setVehicle(vehicleData);
    } catch (err) {
      if (err instanceof StorageError) {
        setError(err.message);
        throw err;
      } else {
        const error = new Error('Failed to save vehicle profile');
        setError(error.message);
        throw error;
      }
    }
  }, []);

  // Refresh vehicle data
  const refreshVehicle = useCallback(async () => {
    await loadVehicleData();
  }, [loadVehicleData]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load vehicle data on mount
  useEffect(() => {
    loadVehicleData();
  }, [loadVehicleData]);

  return {
    vehicle,
    isLoading,
    error,
    saveVehicleProfile,
    refreshVehicle,
    clearError,
  };
}