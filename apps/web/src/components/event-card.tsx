'use client';

import { CarEvent } from '../types';

// Simple date formatter without external dependencies
const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

interface EventCardProps {
  event: CarEvent;
  onClick: () => void;
  className?: string;
}

export function EventCard({ event, onClick, className = '' }: EventCardProps) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      formatted: date.toLocaleDateString(),
      relative: formatDistanceToNow(date)
    };
  };

  const getTypeSpecificInfo = () => {
    switch (event.type) {
      case 'fuel':
        if (event.fuel) {
          const parts = [];
          if (event.fuel.liters) parts.push(`${event.fuel.liters}L`);
          if (event.fuel.totalAmount) parts.push(`$${event.fuel.totalAmount.toFixed(2)}`);
          if (event.fuel.station) parts.push(event.fuel.station);
          return parts.join(' • ');
        }
        break;
      case 'service':
        if (event.service) {
          const parts = [];
          if (event.service.workshop) parts.push(event.service.workshop);
          if (event.service.cost) parts.push(`$${event.service.cost.toFixed(2)}`);
          return parts.join(' • ');
        }
        break;
      case 'tires':
        if (event.tires) {
          const parts = [];
          if (event.tires.brand) parts.push(event.tires.brand);
          if (event.tires.size) parts.push(event.tires.size);
          if (event.tires.position) parts.push(event.tires.position);
          return parts.join(' • ');
        }
        break;
      case 'damage':
        // Note: damage type doesn't have a specific schema in the current type definition
        break;
      case 'obd':
        if (event.obd) {
          const parts = [];
          if (event.obd.source) parts.push(`Source: ${event.obd.source}`);
          if (event.obd.fileName) parts.push(event.obd.fileName);
          return parts.join(' • ');
        }
        break;
    }
    return null;
  };

  const dateInfo = formatDate(event.occurredAt);
  const typeSpecificInfo = getTypeSpecificInfo();
  const hasAttachments = event.attachments && event.attachments.length > 0;
  const imageAttachments = event.attachments?.filter(att => att.kind === 'image') || [];

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-pointer ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View details for ${event.title}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[event.type] || typeColors.custom}`}
          >
            <span className="mr-1" role="img" aria-hidden="true">
              {typeIcons[event.type] || typeIcons.custom}
            </span>
            {event.type}
          </span>
          
          {event.mileageKm && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {event.mileageKm.toLocaleString()} km
            </span>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {dateInfo.formatted}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {dateInfo.relative}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          {event.title}
        </h3>
        
        {typeSpecificInfo && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {typeSpecificInfo}
          </p>
        )}
        
        {event.notes && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {event.notes}
          </p>
        )}
      </div>

      {event.tags && event.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {event.tags.map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {hasAttachments && (
        <div className="flex items-center justify-between">
          {imageAttachments.length > 0 && (
            <div className="flex -space-x-2">
              {imageAttachments.slice(0, 3).map((attachment) => (
                <div
                  key={attachment.id}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 overflow-hidden"
                >
                  {attachment.url && (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
              {imageAttachments.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    +{imageAttachments.length - 3}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {event.attachments?.length || 0} attachment{(event.attachments?.length || 0) !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}