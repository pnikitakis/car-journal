'use client';

import { useState, useEffect } from 'react';
import { SearchableTimeline } from '../../src/components/searchable-timeline';
import { addEvent } from '../../src/lib/storage';
import { CarEvent } from '../../src/types';

// Sample events for demonstration
const sampleEvents: CarEvent[] = [
  {
    id: 'demo-1',
    type: 'fuel',
    title: 'Gas Station Fill-up',
    occurredAt: '2024-01-20T10:30:00Z',
    mileageKm: 52000,
    notes: 'Regular fuel stop at Shell station on highway',
    tags: ['routine', 'highway'],
    attachments: [],
    fuel: {
      liters: 45,
      totalAmount: 67.50,
      station: 'Shell'
    }
  },
  {
    id: 'demo-2',
    type: 'service',
    title: 'Oil Change & Filter',
    occurredAt: '2024-01-15T14:00:00Z',
    mileageKm: 51500,
    notes: 'Regular maintenance at AutoShop. Changed oil and air filter.',
    tags: ['maintenance', 'routine'],
    attachments: [],
    service: {
      workshop: 'AutoShop Plus',
      cost: 89.99,
      nextDueAt: '2024-07-15T00:00:00Z',
      nextDueMileage: 56500
    }
  },
  {
    id: 'demo-3',
    type: 'damage',
    title: 'Minor Parking Lot Scratch',
    occurredAt: '2024-01-10T16:45:00Z',
    mileageKm: 51200,
    notes: 'Small scratch on rear bumper from shopping cart. Needs touch-up paint.',
    tags: ['damage', 'cosmetic'],
    attachments: []
  },
  {
    id: 'demo-4',
    type: 'tires',
    title: 'New Winter Tires',
    occurredAt: '2024-01-05T11:00:00Z',
    mileageKm: 51000,
    notes: 'Installed new winter tires for the season. All four tires replaced.',
    tags: ['tires', 'winter', 'safety'],
    attachments: [],
    tires: {
      brand: 'Michelin',
      model: 'X-Ice Snow',
      size: '225/60R16',
      position: 'All four',
      price: 680.00
    }
  },
  {
    id: 'demo-5',
    type: 'fuel',
    title: 'Costco Gas Fill-up',
    occurredAt: '2024-01-25T09:15:00Z',
    mileageKm: 52300,
    notes: 'Cheaper gas at Costco, saved $5 compared to Shell',
    tags: ['routine', 'savings'],
    attachments: [],
    fuel: {
      liters: 42,
      totalAmount: 58.80,
      station: 'Costco'
    }
  },
  {
    id: 'demo-6',
    type: 'obd',
    title: 'Engine Diagnostic Scan',
    occurredAt: '2024-01-12T13:30:00Z',
    mileageKm: 51300,
    notes: 'Check engine light came on. Diagnostic scan showed O2 sensor issue.',
    tags: ['diagnostic', 'engine'],
    attachments: [],
    obd: {
      source: 'car_scanner',
      fileName: 'diagnostic_report.pdf'
    }
  }
];

export default function SearchDemoPage() {
  const [sampleDataLoaded, setSampleDataLoaded] = useState(false);

  const loadSampleData = () => {
    try {
      sampleEvents.forEach(event => {
        addEvent(event);
      });
      setSampleDataLoaded(true);
      // Refresh the page to show the new data
      window.location.reload();
    } catch (error) {
      console.error('Failed to load sample data:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Search & Filter Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Interactive demonstration of the search and filtering functionality
        </p>
        
        {!sampleDataLoaded && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="text-blue-800 dark:text-blue-200 font-medium mb-2">
              Load Sample Data
            </h3>
            <p className="text-blue-600 dark:text-blue-300 text-sm mb-3">
              To see the search and filtering in action, load some sample events first.
            </p>
            <button
              onClick={loadSampleData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Load Sample Events
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          Try These Features:
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Search for "Shell", "oil", "winter", or "diagnostic"</li>
          <li>• Filter by event types (fuel, service, tires, etc.)</li>
          <li>• Filter by tags (routine, maintenance, safety, etc.)</li>
          <li>• Set date ranges to narrow down results</li>
          <li>• Combine multiple filters for precise results</li>
          <li>• Click on events to see detailed information</li>
        </ul>
      </div>

      <SearchableTimeline />
    </div>
  );
}