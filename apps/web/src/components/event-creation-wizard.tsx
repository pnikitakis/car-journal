'use client';

import { useState, useCallback, useEffect } from 'react';
import { type CarEvent, type EventKind, type Attachment } from '../types/event';
import { EventTypeSelector } from './event-type-selector';
import { FileUpload } from './file-upload';
import { useSettings } from '../lib/use-settings';
import { validateData } from '../lib/validation';
import { CarEventSchema } from '../types/event';

interface EventCreationWizardProps {
  onEventCreated?: (event: CarEvent) => void;
  onCancel?: () => void;
  className?: string;
}

type WizardStep = 'type-selection' | 'core-fields' | 'attachments' | 'type-specific' | 'review';

interface EventFormData {
  type?: EventKind;
  title: string;
  occurredAt: string;
  mileageKm?: number;
  notes: string;
  tags: string[];
  attachments: Attachment[];
  // Type-specific fields
  fuel?: {
    liters?: number;
    totalAmount?: number;
    station?: string;
  };
  service?: {
    workshop?: string;
    cost?: number;
    nextDueAt?: string;
    nextDueMileage?: number;
  };
  tires?: {
    brand?: string;
    model?: string;
    size?: string;
    position?: string;
    price?: number;
  };
  obd?: {
    source?: 'car_scanner' | 'torque' | 'photo_only';
    fileName?: string;
  };
}

export function EventCreationWizard({ 
  onEventCreated, 
  onCancel, 
  className = '' 
}: EventCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('type-selection');
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    occurredAt: new Date().toISOString().split('T')[0], // Today's date
    notes: '',
    tags: [],
    attachments: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { settings } = useSettings();

  // Get today's date for validation
  const today = new Date().toISOString().split('T')[0];

  const updateFormData = useCallback((updates: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors and warnings when field is updated
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(updates).forEach(key => {
        delete newErrors[key];
      });
      return newErrors;
    });
    setWarnings(prev => {
      const newWarnings = { ...prev };
      Object.keys(updates).forEach(key => {
        delete newWarnings[key];
      });
      return newWarnings;
    });
    
    // Check for mileage warnings (this would typically check against previous events)
    if ('mileageKm' in updates && updates.mileageKm !== undefined) {
      // For demo purposes, we'll show a warning if mileage is less than 50000
      // In a real app, this would check against the last event's mileage
      if (updates.mileageKm < 50000) {
        setWarnings(prev => ({
          ...prev,
          mileageKm: 'This mileage appears to be lower than expected. Please verify the reading.'
        }));
      }
    }
  }, []);

  const validateCurrentStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 'type-selection':
        if (!formData.type) {
          newErrors.type = 'Please select an event type';
        }
        break;

      case 'core-fields':
        if (!formData.title.trim()) {
          newErrors.title = 'Title is required';
        }
        if (!formData.occurredAt) {
          newErrors.occurredAt = 'Date is required';
        } else if (formData.occurredAt > today) {
          newErrors.occurredAt = 'Future dates are not allowed';
        }
        if (formData.mileageKm !== undefined && formData.mileageKm < 0) {
          newErrors.mileageKm = 'Mileage cannot be negative';
        }
        break;

      case 'type-specific':
        // Type-specific validation
        if (formData.type === 'fuel') {
          if (formData.fuel?.liters !== undefined && formData.fuel.liters <= 0) {
            newErrors['fuel.liters'] = 'Liters must be greater than 0';
          }
          if (formData.fuel?.totalAmount !== undefined && formData.fuel.totalAmount <= 0) {
            newErrors['fuel.totalAmount'] = 'Amount must be greater than 0';
          }
        }
        if (formData.type === 'service') {
          if (formData.service?.cost !== undefined && formData.service.cost < 0) {
            newErrors['service.cost'] = 'Cost cannot be negative';
          }
          if (formData.service?.nextDueMileage !== undefined && formData.service.nextDueMileage < 0) {
            newErrors['service.nextDueMileage'] = 'Mileage cannot be negative';
          }
        }
        if (formData.type === 'tires') {
          if (formData.tires?.price !== undefined && formData.tires.price < 0) {
            newErrors['tires.price'] = 'Price cannot be negative';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData, today]);

  const handleNext = useCallback(() => {
    if (!validateCurrentStep()) return;

    const stepOrder: WizardStep[] = ['type-selection', 'core-fields', 'attachments', 'type-specific', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  }, [currentStep, validateCurrentStep]);

  const handleBack = useCallback(() => {
    const stepOrder: WizardStep[] = ['type-selection', 'core-fields', 'attachments', 'type-specific', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep() || !formData.type) return;

    setIsSubmitting(true);
    try {
      // Create the event object
      const eventData: Omit<CarEvent, 'id'> = {
        type: formData.type,
        title: formData.title.trim(),
        occurredAt: formData.occurredAt,
        mileageKm: formData.mileageKm,
        notes: formData.notes.trim() || undefined,
        tags: formData.tags,
        attachments: formData.attachments,
        thumbnailUrl: formData.attachments.find(att => att.kind === 'image')?.url,
        fuel: formData.fuel,
        service: formData.service,
        tires: formData.tires,
        obd: formData.obd,
      };

      // Generate ID and validate
      const event: CarEvent = {
        ...eventData,
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const validation = validateData(CarEventSchema, event);
      if (!validation.success) {
        console.error('Event validation failed:', validation.errors);
        setErrors({ submit: 'Invalid event data. Please check all fields.' });
        return;
      }

      onEventCreated?.(validation.data);
    } catch (error) {
      console.error('Failed to create event:', error);
      setErrors({ submit: 'Failed to create event. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateCurrentStep, onEventCreated]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'type-selection':
        return (
          <TypeSelectionStep
            selectedType={formData.type}
            onTypeSelect={(type) => updateFormData({ type })}
            error={errors.type}
          />
        );

      case 'core-fields':
        return (
          <CoreFieldsStep
            formData={formData}
            onUpdate={updateFormData}
            errors={errors}
            warnings={warnings}
            availableTags={settings?.tags ?? []}
          />
        );

      case 'attachments':
        return (
          <AttachmentsStep
            attachments={formData.attachments}
            onAttachmentsUpdate={(attachments) => updateFormData({ attachments })}
          />
        );

      case 'type-specific':
        return (
          <TypeSpecificStep
            eventType={formData.type!}
            formData={formData}
            onUpdate={updateFormData}
            errors={errors}
          />
        );

      case 'review':
        return (
          <ReviewStep
            formData={formData}
            onEdit={(step) => setCurrentStep(step)}
            error={errors.submit}
          />
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'type-selection': return 'Select Event Type';
      case 'core-fields': return 'Event Details';
      case 'attachments': return 'Add Attachments';
      case 'type-specific': return 'Additional Details';
      case 'review': return 'Review & Create';
      default: return '';
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'type-selection': return !!formData.type;
      case 'core-fields': return !!formData.title.trim() && !!formData.occurredAt;
      case 'attachments': return true; // Optional step
      case 'type-specific': return true; // Optional fields
      case 'review': return true;
      default: return false;
    }
  };

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create New Event
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {getStepTitle()}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Step {['type-selection', 'core-fields', 'attachments', 'type-specific', 'review'].indexOf(currentStep) + 1} of 5</span>
        </div>
        <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${((['type-selection', 'core-fields', 'attachments', 'type-specific', 'review'].indexOf(currentStep) + 1) / 5) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <div>
          {currentStep !== 'type-selection' && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              ← Back
            </button>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>

          {currentStep === 'review' ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components

interface TypeSelectionStepProps {
  selectedType?: EventKind;
  onTypeSelect: (type: EventKind) => void;
  error?: string;
}

function TypeSelectionStep({ selectedType, onTypeSelect, error }: TypeSelectionStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-400">
        What type of event would you like to record?
      </p>
      
      <EventTypeSelector
        selectedType={selectedType}
        onTypeSelect={onTypeSelect}
      />
      
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}

interface CoreFieldsStepProps {
  formData: EventFormData;
  onUpdate: (updates: Partial<EventFormData>) => void;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  availableTags: string[];
}

function CoreFieldsStep({ formData, onUpdate, errors, warnings, availableTags }: CoreFieldsStepProps) {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      onUpdate({ tags: [...formData.tags, trimmedTag] });
    }
    setNewTag('');
  }, [formData.tags, onUpdate]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    onUpdate({ tags: formData.tags.filter(tag => tag !== tagToRemove) });
  }, [formData.tags, onUpdate]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Event Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="e.g., Oil change, Fuel up, Tire replacement"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
        />
        {errors.title && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label htmlFor="occurredAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date *
        </label>
        <input
          type="date"
          id="occurredAt"
          value={formData.occurredAt}
          onChange={(e) => onUpdate({ occurredAt: e.target.value })}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
        />
        {errors.occurredAt && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.occurredAt}</p>
        )}
      </div>

      {/* Mileage */}
      <div>
        <label htmlFor="mileageKm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mileage (km)
        </label>
        <input
          type="number"
          id="mileageKm"
          value={formData.mileageKm ?? ''}
          onChange={(e) => onUpdate({ mileageKm: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Current odometer reading"
          min="0"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
        />
        {errors.mileageKm && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.mileageKm}</p>
        )}
        {warnings.mileageKm && (
          <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">⚠️ {warnings.mileageKm}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="Additional details about this event..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        
        {/* Current Tags */}
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add New Tag */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag(newTag);
              }
            }}
            placeholder="Add a tag..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
          <button
            type="button"
            onClick={() => handleAddTag(newTag)}
            disabled={!newTag.trim()}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>

        {/* Suggested Tags */}
        {availableTags.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggested tags:</p>
            <div className="flex flex-wrap gap-2">
              {availableTags
                .filter(tag => !formData.tags.includes(tag))
                .slice(0, 5)
                .map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    + {tag}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface AttachmentsStepProps {
  attachments: Attachment[];
  onAttachmentsUpdate: (attachments: Attachment[]) => void;
}

function AttachmentsStep({ attachments, onAttachmentsUpdate }: AttachmentsStepProps) {
  const handleFilesUploaded = useCallback((newAttachments: Attachment[]) => {
    onAttachmentsUpdate([...attachments, ...newAttachments]);
  }, [attachments, onAttachmentsUpdate]);

  const handleTextNoteAdded = useCallback((attachment: Attachment) => {
    onAttachmentsUpdate([...attachments, attachment]);
  }, [attachments, onAttachmentsUpdate]);

  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    onAttachmentsUpdate(attachments.filter(att => att.id !== attachmentId));
  }, [attachments, onAttachmentsUpdate]);

  return (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-400">
        Add photos, documents, or notes to this event. This step is optional.
      </p>
      
      <FileUpload
        onFilesUploaded={handleFilesUploaded}
        onTextNoteAdded={handleTextNoteAdded}
        maxFiles={10}
      />

      {/* Show current attachments if any were added via FileUpload */}
      {attachments.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Attachments ({attachments.length})
          </h4>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  {attachment.kind === 'image' && attachment.url ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-lg">
                        {attachment.kind === 'pdf' ? '📄' : 
                         attachment.kind === 'audio' ? '🎵' : 
                         attachment.kind === 'text' ? '📝' : '📎'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {attachment.kind}
                      {attachment.sizeBytes && ` • ${Math.round(attachment.sizeBytes / 1024)} KB`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface TypeSpecificStepProps {
  eventType: EventKind;
  formData: EventFormData;
  onUpdate: (updates: Partial<EventFormData>) => void;
  errors: Record<string, string>;
}

function TypeSpecificStep({ eventType, formData, onUpdate, errors }: TypeSpecificStepProps) {
  const renderTypeSpecificFields = () => {
    switch (eventType) {
      case 'fuel':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Fuel Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fuel-liters" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Liters
                </label>
                <input
                  type="number"
                  id="fuel-liters"
                  value={formData.fuel?.liters ?? ''}
                  onChange={(e) => onUpdate({ 
                    fuel: { 
                      ...formData.fuel, 
                      liters: e.target.value ? Number(e.target.value) : undefined 
                    } 
                  })}
                  placeholder="Amount of fuel"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
                {errors['fuel.liters'] && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors['fuel.liters']}</p>
                )}
              </div>

              <div>
                <label htmlFor="fuel-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Amount ($)
                </label>
                <input
                  type="number"
                  id="fuel-amount"
                  value={formData.fuel?.totalAmount ?? ''}
                  onChange={(e) => onUpdate({ 
                    fuel: { 
                      ...formData.fuel, 
                      totalAmount: e.target.value ? Number(e.target.value) : undefined 
                    } 
                  })}
                  placeholder="Total cost"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
                {errors['fuel.totalAmount'] && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors['fuel.totalAmount']}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="fuel-station" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gas Station
              </label>
              <input
                type="text"
                id="fuel-station"
                value={formData.fuel?.station ?? ''}
                onChange={(e) => onUpdate({ 
                  fuel: { 
                    ...formData.fuel, 
                    station: e.target.value || undefined 
                  } 
                })}
                placeholder="e.g., Shell, BP, Exxon"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        );

      case 'service':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Service Details</h3>
            
            <div>
              <label htmlFor="service-workshop" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Workshop/Mechanic
              </label>
              <input
                type="text"
                id="service-workshop"
                value={formData.service?.workshop ?? ''}
                onChange={(e) => onUpdate({ 
                  service: { 
                    ...formData.service, 
                    workshop: e.target.value || undefined 
                  } 
                })}
                placeholder="Name of service provider"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="service-cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cost ($)
              </label>
              <input
                type="number"
                id="service-cost"
                value={formData.service?.cost ?? ''}
                onChange={(e) => onUpdate({ 
                  service: { 
                    ...formData.service, 
                    cost: e.target.value ? Number(e.target.value) : undefined 
                  } 
                })}
                placeholder="Total service cost"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
              {errors['service.cost'] && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors['service.cost']}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="service-next-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Next Service Date
                </label>
                <input
                  type="date"
                  id="service-next-date"
                  value={formData.service?.nextDueAt ?? ''}
                  onChange={(e) => onUpdate({ 
                    service: { 
                      ...formData.service, 
                      nextDueAt: e.target.value || undefined 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="service-next-mileage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Next Service Mileage (km)
                </label>
                <input
                  type="number"
                  id="service-next-mileage"
                  value={formData.service?.nextDueMileage ?? ''}
                  onChange={(e) => onUpdate({ 
                    service: { 
                      ...formData.service, 
                      nextDueMileage: e.target.value ? Number(e.target.value) : undefined 
                    } 
                  })}
                  placeholder="Next service mileage"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
                {errors['service.nextDueMileage'] && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors['service.nextDueMileage']}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'tires':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tire Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tires-brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  id="tires-brand"
                  value={formData.tires?.brand ?? ''}
                  onChange={(e) => onUpdate({ 
                    tires: { 
                      ...formData.tires, 
                      brand: e.target.value || undefined 
                    } 
                  })}
                  placeholder="e.g., Michelin, Bridgestone"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="tires-model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  id="tires-model"
                  value={formData.tires?.model ?? ''}
                  onChange={(e) => onUpdate({ 
                    tires: { 
                      ...formData.tires, 
                      model: e.target.value || undefined 
                    } 
                  })}
                  placeholder="Tire model name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tires-size" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Size
                </label>
                <input
                  type="text"
                  id="tires-size"
                  value={formData.tires?.size ?? ''}
                  onChange={(e) => onUpdate({ 
                    tires: { 
                      ...formData.tires, 
                      size: e.target.value || undefined 
                    } 
                  })}
                  placeholder="e.g., 225/60R16"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="tires-position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position
                </label>
                <select
                  id="tires-position"
                  value={formData.tires?.position ?? ''}
                  onChange={(e) => onUpdate({ 
                    tires: { 
                      ...formData.tires, 
                      position: e.target.value || undefined 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select position</option>
                  <option value="front-left">Front Left</option>
                  <option value="front-right">Front Right</option>
                  <option value="rear-left">Rear Left</option>
                  <option value="rear-right">Rear Right</option>
                  <option value="all-four">All Four</option>
                  <option value="front-pair">Front Pair</option>
                  <option value="rear-pair">Rear Pair</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="tires-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price ($)
              </label>
              <input
                type="number"
                id="tires-price"
                value={formData.tires?.price ?? ''}
                onChange={(e) => onUpdate({ 
                  tires: { 
                    ...formData.tires, 
                    price: e.target.value ? Number(e.target.value) : undefined 
                  } 
                })}
                placeholder="Total cost for tires"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
              {errors['tires.price'] && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors['tires.price']}</p>
              )}
            </div>
          </div>
        );

      case 'damage':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Damage Details</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Use the notes field and attachments to document the damage. Photos are especially helpful for insurance claims.
            </p>
          </div>
        );

      case 'obd':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">OBD Details</h3>
            
            <div>
              <label htmlFor="obd-source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Source
              </label>
              <select
                id="obd-source"
                value={formData.obd?.source ?? ''}
                onChange={(e) => onUpdate({ 
                  obd: { 
                    ...formData.obd, 
                    source: e.target.value as 'car_scanner' | 'torque' | 'photo_only' || undefined 
                  } 
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select source</option>
                <option value="car_scanner">Car Scanner App</option>
                <option value="torque">Torque Pro</option>
                <option value="photo_only">Photo Only</option>
              </select>
            </div>

            <div>
              <label htmlFor="obd-filename" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                File Name
              </label>
              <input
                type="text"
                id="obd-filename"
                value={formData.obd?.fileName ?? ''}
                onChange={(e) => onUpdate({ 
                  obd: { 
                    ...formData.obd, 
                    fileName: e.target.value || undefined 
                  } 
                })}
                placeholder="Name of the OBD data file"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        );

      case 'custom':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Custom Event</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Use the title, notes, and attachments to document your custom event. No additional fields are required.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-400">
        Add specific details for this {eventType} event. All fields are optional.
      </p>
      
      {renderTypeSpecificFields()}
    </div>
  );
}

interface ReviewStepProps {
  formData: EventFormData;
  onEdit: (step: WizardStep) => void;
  error?: string;
}

function ReviewStep({ formData, onEdit, error }: ReviewStepProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventTypeLabel = (type: EventKind) => {
    const labels: Record<EventKind, string> = {
      fuel: 'Fuel',
      service: 'Service',
      tires: 'Tires',
      damage: 'Damage',
      obd: 'OBD',
      custom: 'Custom',
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600 dark:text-gray-400">
        Review your event details before creating. You can go back to edit any section.
      </p>

      {/* Event Type */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Event Type</h3>
            <p className="text-gray-600 dark:text-gray-400">{getEventTypeLabel(formData.type!)}</p>
          </div>
          <button
            type="button"
            onClick={() => onEdit('type-selection')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Core Details */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-white">Event Details</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Title:</span> {formData.title}</p>
              <p><span className="font-medium">Date:</span> {formatDate(formData.occurredAt)}</p>
              {formData.mileageKm && (
                <p><span className="font-medium">Mileage:</span> {formData.mileageKm.toLocaleString()} km</p>
              )}
              {formData.notes && (
                <p><span className="font-medium">Notes:</span> {formData.notes}</p>
              )}
              {formData.tags.length > 0 && (
                <div>
                  <span className="font-medium">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEdit('core-fields')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Attachments */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Attachments</h3>
            {formData.attachments.length > 0 ? (
              <div className="mt-2 space-y-2">
                {formData.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center space-x-2 text-sm">
                    <span className="capitalize">{attachment.kind}:</span>
                    <span className="text-gray-600 dark:text-gray-400">{attachment.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-sm">No attachments</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onEdit('attachments')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Type-specific Details */}
      {(formData.fuel || formData.service || formData.tires || formData.obd) && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {getEventTypeLabel(formData.type!)} Details
              </h3>
              <div className="mt-2 space-y-1 text-sm">
                {formData.fuel && (
                  <>
                    {formData.fuel.liters && <p><span className="font-medium">Liters:</span> {formData.fuel.liters}</p>}
                    {formData.fuel.totalAmount && <p><span className="font-medium">Amount:</span> ${formData.fuel.totalAmount}</p>}
                    {formData.fuel.station && <p><span className="font-medium">Station:</span> {formData.fuel.station}</p>}
                  </>
                )}
                {formData.service && (
                  <>
                    {formData.service.workshop && <p><span className="font-medium">Workshop:</span> {formData.service.workshop}</p>}
                    {formData.service.cost && <p><span className="font-medium">Cost:</span> ${formData.service.cost}</p>}
                    {formData.service.nextDueAt && <p><span className="font-medium">Next Service:</span> {formatDate(formData.service.nextDueAt)}</p>}
                    {formData.service.nextDueMileage && <p><span className="font-medium">Next Service Mileage:</span> {formData.service.nextDueMileage.toLocaleString()} km</p>}
                  </>
                )}
                {formData.tires && (
                  <>
                    {formData.tires.brand && <p><span className="font-medium">Brand:</span> {formData.tires.brand}</p>}
                    {formData.tires.model && <p><span className="font-medium">Model:</span> {formData.tires.model}</p>}
                    {formData.tires.size && <p><span className="font-medium">Size:</span> {formData.tires.size}</p>}
                    {formData.tires.position && <p><span className="font-medium">Position:</span> {formData.tires.position}</p>}
                    {formData.tires.price && <p><span className="font-medium">Price:</span> ${formData.tires.price}</p>}
                  </>
                )}
                {formData.obd && (
                  <>
                    {formData.obd.source && <p><span className="font-medium">Source:</span> {formData.obd.source.replace('_', ' ')}</p>}
                    {formData.obd.fileName && <p><span className="font-medium">File:</span> {formData.obd.fileName}</p>}
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onEdit('type-specific')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}