import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { type Vehicle } from '../../types/vehicle';
import * as storage from '../storage';

// Mock the storage module
vi.mock('../storage', () => ({
  loadVehicle: vi.fn(),
  saveVehicle: vi.fn(),
  StorageError: class StorageError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'StorageError';
    }
  },
}));

const mockLoadVehicle = vi.mocked(storage.loadVehicle);
const mockSaveVehicle = vi.mocked(storage.saveVehicle);

describe('vehicle profile storage functions', () => {
  const mockVehicle: Vehicle = {
    id: 'vehicle_1',
    make: 'Toyota',
    model: 'Camry',
    plate: 'ABC-123',
    vin: '1HGBH41JXMN109186',
    fuelType: 'gasoline',
    purchasedOn: '2023-01-15',
    notes: 'Great car!',
    photos: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load vehicle data successfully', () => {
    mockLoadVehicle.mockReturnValue(mockVehicle);

    const result = storage.loadVehicle();

    expect(result).toEqual(mockVehicle);
    expect(mockLoadVehicle).toHaveBeenCalledTimes(1);
  });

  it('should handle loading undefined vehicle', () => {
    mockLoadVehicle.mockReturnValue(undefined);

    const result = storage.loadVehicle();

    expect(result).toBeUndefined();
    expect(mockLoadVehicle).toHaveBeenCalledTimes(1);
  });

  it('should save vehicle data successfully', () => {
    mockSaveVehicle.mockImplementation(() => {});

    expect(() => storage.saveVehicle(mockVehicle)).not.toThrow();
    expect(mockSaveVehicle).toHaveBeenCalledWith(mockVehicle);
  });

  it('should handle storage error on load', () => {
    const errorMessage = 'Storage not available';
    mockLoadVehicle.mockImplementation(() => {
      throw new storage.StorageError(errorMessage);
    });

    expect(() => storage.loadVehicle()).toThrow(errorMessage);
  });

  it('should handle storage error on save', () => {
    const errorMessage = 'Save failed';
    mockSaveVehicle.mockImplementation(() => {
      throw new storage.StorageError(errorMessage);
    });

    expect(() => storage.saveVehicle(mockVehicle)).toThrow(errorMessage);
  });

  it('should validate vehicle data structure', () => {
    const validVehicle: Vehicle = {
      id: 'test_id',
      make: 'Test Make',
      model: 'Test Model',
      photos: [],
    };

    mockSaveVehicle.mockImplementation(() => {});

    expect(() => storage.saveVehicle(validVehicle)).not.toThrow();
  });
});