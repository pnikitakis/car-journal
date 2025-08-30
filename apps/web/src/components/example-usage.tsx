'use client';

import { useState } from 'react';
import { loadEvents, saveEvents } from '../lib/storage';
import { FileUpload } from './file-upload';
import type { CarEvent, Attachment } from '../types/event';

export function ExampleUsage() {
  const [events, setEvents] = useState<CarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAttachments, setCurrentAttachments] = useState<Attachment[]>([]);

  const handleLoadEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const loadedEvents = loadEvents();
      setEvents(loadedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      saveEvents(events);
      alert('Events saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save events');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSampleEvent = () => {
    const sampleEvent: CarEvent = {
      id: `event_${Date.now()}`,
      type: 'fuel',
      title: 'Gas Fill-up',
      occurredAt: new Date().toISOString(),
      mileageKm: 50000,
      notes: 'Regular gas station visit',
      tags: ['routine', 'fuel'],
      attachments: [...currentAttachments], // Include current attachments
      fuel: {
        liters: 45.5,
        totalAmount: 65.75,
        station: 'Shell Station'
      }
    };
    
    setEvents(prev => [...prev, sampleEvent]);
    setCurrentAttachments([]); // Clear attachments after adding to event
  };

  const handleFilesUploaded = (attachments: Attachment[]) => {
    setCurrentAttachments(prev => [...prev, ...attachments]);
  };

  const handleTextNoteAdded = (attachment: Attachment) => {
    setCurrentAttachments(prev => [...prev, attachment]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Car Journal File Handling Demo
        </h1>
        
        <div className="space-y-6">
          {/* File Upload Section */}
          <div>
            <h2 className="text-lg font-semibold mb-3">File Upload & Attachments</h2>
            <FileUpload
              onFilesUploaded={handleFilesUploaded}
              onTextNoteAdded={handleTextNoteAdded}
              className="border border-gray-200 rounded-lg p-4"
            />
          </div>

          {/* Event Management Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Event Management</h2>
            
            <div className="flex space-x-4">
              <button
                onClick={handleLoadEvents}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load Events'}
              </button>
              
              <button
                onClick={handleSaveEvents}
                disabled={loading || events.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Events'}
              </button>
              
              <button
                onClick={handleAddSampleEvent}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Add Sample Event {currentAttachments.length > 0 && `(${currentAttachments.length} attachments)`}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">
                Events ({events.length})
              </h3>
              
              {events.length === 0 ? (
                <p className="text-gray-500">No events loaded. Click "Load Events" or "Add Sample Event" to get started.</p>
              ) : (
                <div className="space-y-2">
                  {events.map((event) => (
                    <div key={event.id} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {event.type} • {new Date(event.occurredAt).toLocaleDateString()}
                          </p>
                          {event.notes && (
                            <p className="text-sm text-gray-700 mt-1">{event.notes}</p>
                          )}
                          
                          {/* Display attachments */}
                          {event.attachments.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">
                                Attachments ({event.attachments.length}):
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {event.attachments.map((attachment) => (
                                  <span
                                    key={attachment.id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                  >
                                    {attachment.kind === 'image' && '🖼️'}
                                    {attachment.kind === 'pdf' && '📄'}
                                    {attachment.kind === 'audio' && '🎵'}
                                    {attachment.kind === 'text' && '📝'}
                                    {attachment.kind === 'file' && '📎'}
                                    <span className="ml-1 truncate max-w-20">
                                      {attachment.name}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {event.attachments.length} files
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}