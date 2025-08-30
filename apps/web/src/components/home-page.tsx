'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadEvents, loadVehicleProfile, getStorageStats } from '../lib/storage';
import { CarEvent, Vehicle } from '../types';
import { EventCard } from './event-card';
import { LoadingCard, LoadingList } from './loading-states';

export function HomePage() {
  const [events, setEvents] = useState<CarEvent[]>([]);
  const [vehicleProfile, setVehicleProfile] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storageStats, setStorageStats] = useState(getStorageStats());

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsData, profileData] = await Promise.all([
          loadEvents(),
          loadVehicleProfile()
        ]);
        
        // Sort events by date (newest first) and take the latest 5
        const sortedEvents = eventsData
          .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
          .slice(0, 5);
        
        setEvents(sortedEvents);
        setVehicleProfile(profileData);
        setStorageStats(getStorageStats());
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LoadingList items={3} />
            </div>
            <div>
              <LoadingCard hasImage />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasData = events.length > 0 || vehicleProfile;

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome to Car Journal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your media-first car logbook for tracking maintenance and incidents
          </p>
        </div>

        {!hasData ? (
          /* Getting Started */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl" role="img" aria-label="Car">🚗</span>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Get Started with Your Car Journal
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Start by setting up your vehicle profile and adding your first event. 
              Track maintenance, fuel-ups, repairs, and more with rich attachments.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/vehicle"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="mr-2" role="img" aria-hidden="true">🚗</span>
                Set Up Vehicle Profile
              </Link>
              
              <Link
                href="/add-event"
                className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <span className="mr-2" role="img" aria-hidden="true">➕</span>
                Add First Event
              </Link>
            </div>
          </div>
        ) : (
          /* Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Events */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Recent Events
                </h2>
                <Link
                  href="/timeline"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                >
                  View All →
                </Link>
              </div>
              
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => {
                        // Navigate to event detail or open modal
                        console.log('Event clicked:', event.id);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No events recorded yet
                  </p>
                  <Link
                    href="/add-event"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <span className="mr-2" role="img" aria-hidden="true">➕</span>
                    Add Your First Event
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/add-event"
                    className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors group"
                  >
                    <span className="text-xl mr-3" role="img" aria-hidden="true">➕</span>
                    <div>
                      <div className="font-medium text-blue-900 dark:text-blue-100">Add Event</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Record maintenance or incident</div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/search"
                    className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors group"
                  >
                    <span className="text-xl mr-3" role="img" aria-hidden="true">🔍</span>
                    <div>
                      <div className="font-medium text-green-900 dark:text-green-100">Search Events</div>
                      <div className="text-sm text-green-700 dark:text-green-300">Find specific records</div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/data-management"
                    className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors group"
                  >
                    <span className="text-xl mr-3" role="img" aria-hidden="true">📤</span>
                    <div>
                      <div className="font-medium text-purple-900 dark:text-purple-100">Export Data</div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">Generate sale pack</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Vehicle Summary */}
              {vehicleProfile && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Vehicle
                    </h3>
                    <Link
                      href="/vehicle"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                    >
                      Edit →
                    </Link>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {vehicleProfile.make && vehicleProfile.model && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Vehicle:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {vehicleProfile.make} {vehicleProfile.model}
                        </span>
                      </div>
                    )}
                    {vehicleProfile.plate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Plate:</span>
                        <span className="text-gray-900 dark:text-gray-100">{vehicleProfile.plate}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Storage Stats */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Storage
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Events:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {storageStats.events}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Vehicle Profile:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {storageStats.hasVehicleProfile ? 'Set up' : 'Not set up'}
                    </span>
                  </div>
                  
                  {storageStats.available && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Storage Used:</span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {Math.round((storageStats.used / storageStats.total) * 100)}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((storageStats.used / storageStats.total) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}