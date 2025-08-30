'use client';

import { useState, useEffect, useRef } from 'react';
import { CarEvent } from '../types';
import { deleteEvent } from '../lib/storage';
import { FocusManager, announceToScreenReader } from '../lib/accessibility';

interface EventDetailModalProps {
  event: CarEvent;
  onClose: () => void;
  onEventDeleted: () => void;
}

export function EventDetailModal({ event, onClose, onEventDeleted }: EventDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const focusManager = useRef(new FocusManager());

  useEffect(() => {
    // Focus management
    if (modalRef.current) {
      const firstFocusable = modalRef.current.querySelector('button') as HTMLElement;
      if (firstFocusable) {
        focusManager.current.pushFocus(firstFocusable);
      }
    }

    // Trap focus within modal
    let cleanup: (() => void) | undefined;
    if (modalRef.current) {
      cleanup = focusManager.current.trapFocus(modalRef.current);
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Announce modal opening
    announceToScreenReader('Event details modal opened');

    return () => {
      document.body.style.overflow = '';
      cleanup?.();
      focusManager.current.popFocus();
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteEvent(event.id);
      announceToScreenReader('Event deleted successfully');
      onEventDeleted();
    } catch (error) {
      console.error('Failed to delete event:', error);
      announceToScreenReader('Failed to delete event', 'assertive');
    } finally {
      setIsDeleting(false);
    }
  };

  const typeColors: Record<string, string> = {
    fuel: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    service: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    tires: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    damage: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    obd: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
  };

  const typeIcons: Record<string, string> = {
    fuel: '⛽',
    service: '🔧',
    tires: '🛞',
    damage: '💥',
    obd: '🔌',
    custom: '📝',
  };

  const renderTypeSpecificFields = () => {
    switch (event.type) {
      case 'fuel':
        if (!event.fuel) return null;
        return (
          <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">Fuel Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {event.fuel.liters && (
                <div>
                  <span className="text-green-700 dark:text-green-300 font-medium">Volume:</span>
                  <span className="ml-2 text-green-900 dark:text-green-100">{event.fuel.liters}L</span>
                </div>
              )}
              {event.fuel.totalAmount && (
                <div>
                  <span className="text-green-700 dark:text-green-300 font-medium">Total Cost:</span>
                  <span className="ml-2 text-green-900 dark:text-green-100">${event.fuel.totalAmount.toFixed(2)}</span>
                </div>
              )}
              {event.fuel.station && (
                <div>
                  <span className="text-green-700 dark:text-green-300 font-medium">Station:</span>
                  <span className="ml-2 text-green-900 dark:text-green-100">{event.fuel.station}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'service':
        if (!event.service) return null;
        return (
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">Service Details</h4>
            <div className="space-y-2 text-sm">
              {event.service.workshop && (
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Workshop:</span>
                  <span className="ml-2 text-blue-900 dark:text-blue-100">{event.service.workshop}</span>
                </div>
              )}
              {event.service.cost && (
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Cost:</span>
                  <span className="ml-2 text-blue-900 dark:text-blue-100">${event.service.cost.toFixed(2)}</span>
                </div>
              )}
              {event.service.nextDueMileage && (
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Next Service:</span>
                  <span className="ml-2 text-blue-900 dark:text-blue-100">{event.service.nextDueMileage.toLocaleString()} km</span>
                </div>
              )}
              {event.service.nextDueAt && (
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Next Service Date:</span>
                  <span className="ml-2 text-blue-900 dark:text-blue-100">{new Date(event.service.nextDueAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'tires':
        if (!event.tires) return null;
        return (
          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-3">Tire Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {event.tires.brand && (
                <div>
                  <span className="text-purple-700 dark:text-purple-300 font-medium">Brand:</span>
                  <span className="ml-2 text-purple-900 dark:text-purple-100">{event.tires.brand}</span>
                </div>
              )}
              {event.tires.model && (
                <div>
                  <span className="text-purple-700 dark:text-purple-300 font-medium">Model:</span>
                  <span className="ml-2 text-purple-900 dark:text-purple-100">{event.tires.model}</span>
                </div>
              )}
              {event.tires.size && (
                <div>
                  <span className="text-purple-700 dark:text-purple-300 font-medium">Size:</span>
                  <span className="ml-2 text-purple-900 dark:text-purple-100">{event.tires.size}</span>
                </div>
              )}
              {event.tires.position && (
                <div>
                  <span className="text-purple-700 dark:text-purple-300 font-medium">Position:</span>
                  <span className="ml-2 text-purple-900 dark:text-purple-100">{event.tires.position}</span>
                </div>
              )}
              {event.tires.price && (
                <div>
                  <span className="text-purple-700 dark:text-purple-300 font-medium">Price:</span>
                  <span className="ml-2 text-purple-900 dark:text-purple-100">${event.tires.price.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'damage':
        // Note: damage type doesn't have a specific schema in the current type definition
        // This case can be removed or a damage schema can be added to the types
        return null;

      case 'obd':
        if (!event.obd) return null;
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-3">OBD Details</h4>
            <div className="space-y-2 text-sm">
              {event.obd.source && (
                <div>
                  <span className="text-yellow-700 dark:text-yellow-300 font-medium">Source:</span>
                  <span className="ml-2 text-yellow-900 dark:text-yellow-100">{event.obd.source}</span>
                </div>
              )}
              {event.obd.fileName && (
                <div>
                  <span className="text-yellow-700 dark:text-yellow-300 font-medium">File:</span>
                  <span className="ml-2 text-yellow-900 dark:text-yellow-100">{event.obd.fileName}</span>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeColors[event.type] || typeColors.custom}`}
              >
                <span className="mr-1" role="img" aria-hidden="true">
                  {typeIcons[event.type] || typeIcons.custom}
                </span>
                {event.type}
              </span>
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {event.title}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Date:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                    {new Date(event.occurredAt).toLocaleDateString()}
                  </span>
                </div>
                {event.mileageKm && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Mileage:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                      {event.mileageKm.toLocaleString()} km
                    </span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {event.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {event.notes}
                  </p>
                </div>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Type-specific fields */}
              {renderTypeSpecificFields()}

              {/* Attachments */}
              {event.attachments && event.attachments.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Attachments</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                      >
                        {attachment.kind === 'image' && attachment.url ? (
                          <div className="aspect-square mb-2 overflow-hidden rounded">
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square mb-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {attachment.name}
                        </p>
                        {attachment.sizeBytes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(attachment.sizeBytes / 1024 / 1024).toFixed(1)} MB
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Created {new Date(event.createdAt).toLocaleDateString()}
            </div>

            <div className="flex space-x-3">
              {!showDeleteConfirm ? (
                <>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <span className="text-sm text-red-600 dark:text-red-400 mr-3">
                    Are you sure? This cannot be undone.
                  </span>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors text-sm"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Event'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}