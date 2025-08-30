'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { type Vehicle, VehicleSchema } from '../types/vehicle';
import { type Attachment } from '../types/event';
import { processFileAttachment, FileHandlingError } from '../lib/file-handling';
import { validateData } from '../lib/validation';

/**
 * Form data schema for vehicle profile
 */
const VehicleFormSchema = VehicleSchema.omit({ id: true, photos: true }).extend({
  photos: z.array(z.instanceof(File)).optional(),
});

type VehicleFormData = z.infer<typeof VehicleFormSchema>;

interface VehicleProfileFormProps {
  vehicle?: Vehicle;
  onSave: (vehicle: Vehicle) => void;
  onCancel?: () => void;
  className?: string;
}

export function VehicleProfileForm({ 
  vehicle, 
  onSave, 
  onCancel, 
  className = '' 
}: VehicleProfileFormProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    plate: vehicle?.plate || '',
    vin: vehicle?.vin || '',
    fuelType: vehicle?.fuelType || '',
    purchasedOn: vehicle?.purchasedOn || '',
    notes: vehicle?.notes || '',
  });

  const [existingPhotos, setExistingPhotos] = useState<Attachment[]>(vehicle?.photos || []);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  // Handle form field changes
  const handleFieldChange = (field: keyof VehicleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle photo file selection
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFileErrors([]);
    
    // Filter for image files only
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const nonImageFiles = files.filter(file => !file.type.startsWith('image/'));
    
    if (nonImageFiles.length > 0) {
      setFileErrors(['Only image files are allowed for vehicle photos']);
      return;
    }
    
    setNewPhotos(prev => [...prev, ...imageFiles]);
  };

  // Remove existing photo
  const removeExistingPhoto = (photoId: string) => {
    setExistingPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  // Remove new photo
  const removeNewPhoto = (index: number) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Validate form data
  const validateForm = (): boolean => {
    const validation = validateData(VehicleFormSchema, formData);
    
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.errors.issues.forEach(issue => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setFileErrors([]);
    
    try {
      // Process new photo files into attachments
      const newPhotoAttachments: Attachment[] = [];
      
      for (const file of newPhotos) {
        try {
          const attachment = await processFileAttachment(file);
          newPhotoAttachments.push(attachment);
        } catch (error) {
          if (error instanceof FileHandlingError) {
            setFileErrors(prev => [...prev, `${file.name}: ${error.message}`]);
          } else {
            setFileErrors(prev => [...prev, `${file.name}: Failed to process file`]);
          }
        }
      }
      
      // If there were file processing errors, don't submit
      if (fileErrors.length > 0) {
        setIsSubmitting(false);
        return;
      }
      
      // Create the vehicle object
      const vehicleData: Vehicle = {
        id: vehicle?.id || `vehicle_${Date.now()}`,
        make: formData.make || undefined,
        model: formData.model || undefined,
        plate: formData.plate || undefined,
        vin: formData.vin || undefined,
        fuelType: formData.fuelType || undefined,
        purchasedOn: formData.purchasedOn || undefined,
        notes: formData.notes || undefined,
        photos: [...existingPhotos, ...newPhotoAttachments],
      };
      
      onSave(vehicleData);
    } catch (error) {
      setFileErrors(['An unexpected error occurred while saving the vehicle profile']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Make */}
        <div>
          <label htmlFor="make" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Make
          </label>
          <input
            type="text"
            id="make"
            value={formData.make}
            onChange={(e) => handleFieldChange('make', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., Toyota, Honda, Ford"
          />
          {errors.make && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.make}</p>
          )}
        </div>

        {/* Model */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Model
          </label>
          <input
            type="text"
            id="model"
            value={formData.model}
            onChange={(e) => handleFieldChange('model', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., Camry, Civic, F-150"
          />
          {errors.model && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.model}</p>
          )}
        </div>

        {/* License Plate */}
        <div>
          <label htmlFor="plate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            License Plate
          </label>
          <input
            type="text"
            id="plate"
            value={formData.plate}
            onChange={(e) => handleFieldChange('plate', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., ABC-123"
          />
          {errors.plate && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.plate}</p>
          )}
        </div>

        {/* VIN */}
        <div>
          <label htmlFor="vin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            VIN
          </label>
          <input
            type="text"
            id="vin"
            value={formData.vin}
            onChange={(e) => handleFieldChange('vin', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="17-character VIN"
            maxLength={17}
          />
          {errors.vin && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.vin}</p>
          )}
        </div>

        {/* Fuel Type */}
        <div>
          <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fuel Type
          </label>
          <select
            id="fuelType"
            value={formData.fuelType}
            onChange={(e) => handleFieldChange('fuelType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select fuel type</option>
            <option value="gasoline">Gasoline</option>
            <option value="diesel">Diesel</option>
            <option value="hybrid">Hybrid</option>
            <option value="electric">Electric</option>
            <option value="other">Other</option>
          </select>
          {errors.fuelType && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fuelType}</p>
          )}
        </div>

        {/* Purchase Date */}
        <div>
          <label htmlFor="purchasedOn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Purchase Date
          </label>
          <input
            type="date"
            id="purchasedOn"
            value={formData.purchasedOn}
            onChange={(e) => handleFieldChange('purchasedOn', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          {errors.purchasedOn && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.purchasedOn}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Additional notes about your vehicle..."
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.notes}</p>
        )}
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Vehicle Photos
        </label>
        
        {/* Existing Photos */}
        {existingPhotos.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Current Photos</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingPhotos.map((photo) => (
                <div key={photo.id} className="relative">
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-24 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingPhoto(photo.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Photos */}
        {newPhotos.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">New Photos</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newPhotos.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-24 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewPhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photo Upload */}
        <input
          type="file"
          id="photos"
          multiple
          accept="image/*"
          onChange={handlePhotoChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Select multiple image files (max 10MB each)
        </p>
        
        {fileErrors.length > 0 && (
          <div className="mt-2 space-y-1">
            {fileErrors.map((error, index) => (
              <p key={index} className="text-sm text-red-600 dark:text-red-400">{error}</p>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Vehicle Profile'}
        </button>
      </div>
    </form>
  );
}