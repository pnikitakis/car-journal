'use client';

import { useState } from 'react';
import { EventCard } from '../../src/components/event-card';
import { EventDetailModal } from '../../src/components/event-detail-modal';
import { CarEvent } from '../../src/types';

// Mock data for demonstration
const mockEvents: CarEvent[] = [
  {
    id: '1',
    type: 'fuel',
    title: 'Gas Station Fill-up',
    occurredAt: '2024-01-20T10:30:00Z',
    mileageKm: 52000,
    notes: 'Regular fuel stop at Shell station on highway',
    tags: ['routine', 'highway'],
    attachments: [
      {
        id: 'att1',
        kind: 'image',
        name: 'receipt.jpg',
        mime: 'image/jpeg',
        sizeBytes: 1024,
        url: 'https://via.placeholder.com/300x200/4ade80/ffffff?text=Fuel+Receipt',
        createdAt: '2024-01-20T10:30:00Z'
      }
    ],
    thumbnailUrl: 'https://via.placeholder.com/64x64/4ade80/ffffff?text=⛽',
    fuel: {
      liters: 45,
      totalAmount: 67.50,
      station: 'Shell'
    }
  },
  {
    id: '2',
    type: 'service',
    title: 'Oil Change & Filter',
    occurredAt: '2024-01-15T14:00:00Z',
    mileageKm: 51500,
    notes: 'Regular maintenance at AutoShop. Changed oil and air filter.',
    tags: ['maintenance', 'routine'],
    attachments: [
      {
        id: 'att2',
        kind: 'pdf',
        name: 'service_invoice.pdf',
        mime: 'application/pdf',
        sizeBytes: 2048,
        createdAt: '2024-01-15T14:00:00Z'
      }
    ],
    thumbnailUrl: 'https://via.placeholder.com/64x64/3b82f6/ffffff?text=🔧',
    service: {
      workshop: 'AutoShop Plus',
      cost: 89.99,
      nextDueAt: '2024-07-15T00:00:00Z',
      nextDueMileage: 56500
    }
  },
  {
    id: '3',
    type: 'damage',
    title: 'Minor Parking Lot Scratch',
    occurredAt: '2024-01-10T16:45:00Z',
    mileageKm: 51200,
    notes: 'Small scratch on rear bumper from shopping cart. Needs touch-up paint.',
    tags: ['damage', 'cosmetic'],
    attachments: [
      {
        id: 'att3',
        kind: 'image',
        name: 'scratch_photo.jpg',
        mime: 'image/jpeg',
        sizeBytes: 1536,
        url: 'https://via.placeholder.com/300x200/ef4444/ffffff?text=Scratch+Photo',
        createdAt: '2024-01-10T16:45:00Z'
      }
    ],
    thumbnailUrl: 'https://via.placeholder.com/64x64/ef4444/ffffff?text=⚠️'
  },
  {
    id: '4',
    type: 'tires',
    title: 'New Winter Tires',
    occurredAt: '2024-01-05T11:00:00Z',
    mileageKm: 51000,
    notes: 'Installed new winter tires for the season. All four tires replaced.',
    tags: ['tires', 'winter', 'safety'],
    attachments: [],
    thumbnailUrl: 'https://via.placeholder.com/64x64/8b5cf6/ffffff?text=🛞',
    tires: {
      brand: 'Michelin',
      model: 'X-Ice Snow',
      size: '225/60R16',
      position: 'All four',
      price: 680.00
    }
  }
];

export default function TimelineDemoPage() {
  const [selectedEvent, setSelectedEvent] = useState<CarEvent | null>(null);

  const handleEventClick = (event: CarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleEventDeleted = () => {
    setSelectedEvent(null);
    // In a real app, this would remove the event from the list
    alert('Event deleted! (This is just a demo)');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Car Journal Timeline Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive demonstration of the event timeline and detail views
        </p>
      </div>

      <div className="space-y-4">
        {mockEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => handleEventClick(event)}
          />
        ))}
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={handleCloseModal}
          onEventDeleted={handleEventDeleted}
        />
      )}
    </div>
  );
}