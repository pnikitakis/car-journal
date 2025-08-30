import { CarEvent, EventKind } from '../types';

/**
 * Search and filter utilities for events
 */

export interface SearchFilters {
  searchQuery?: string;
  eventTypes?: EventKind[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
}

/**
 * Searches events by title, notes, tags, and type-specific fields
 */
export function searchEvents(events: CarEvent[], query: string): CarEvent[] {
  if (!query.trim()) {
    return events;
  }

  const searchTerm = query.toLowerCase().trim();
  
  return events.filter(event => {
    // Search in title
    if (event.title.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Search in notes
    if (event.notes?.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Search in tags
    if (event.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
      return true;
    }
    
    // Search in type-specific fields
    switch (event.type) {
      case 'fuel':
        if (event.fuel?.station?.toLowerCase().includes(searchTerm)) {
          return true;
        }
        break;
      
      case 'service':
        if (event.service?.workshop?.toLowerCase().includes(searchTerm)) {
          return true;
        }
        break;
      
      case 'tires':
        if (
          event.tires?.brand?.toLowerCase().includes(searchTerm) ||
          event.tires?.model?.toLowerCase().includes(searchTerm) ||
          event.tires?.size?.toLowerCase().includes(searchTerm) ||
          event.tires?.position?.toLowerCase().includes(searchTerm)
        ) {
          return true;
        }
        break;
      
      case 'obd':
        if (
          event.obd?.source?.toLowerCase().includes(searchTerm) ||
          event.obd?.fileName?.toLowerCase().includes(searchTerm)
        ) {
          return true;
        }
        break;
    }
    
    return false;
  });
}

/**
 * Filters events by type
 */
export function filterEventsByType(events: CarEvent[], eventTypes: EventKind[]): CarEvent[] {
  if (!eventTypes.length) {
    return events;
  }
  
  return events.filter(event => eventTypes.includes(event.type));
}

/**
 * Filters events by date range
 */
export function filterEventsByDateRange(
  events: CarEvent[], 
  dateRange: { start: string; end: string }
): CarEvent[] {
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  return events.filter(event => {
    const eventDate = new Date(event.occurredAt);
    return eventDate >= startDate && eventDate <= endDate;
  });
}

/**
 * Filters events by tags
 */
export function filterEventsByTags(events: CarEvent[], tags: string[]): CarEvent[] {
  if (!tags.length) {
    return events;
  }
  
  return events.filter(event => 
    tags.some(tag => event.tags.includes(tag))
  );
}

/**
 * Applies all filters and search to events
 */
export function filterAndSearchEvents(events: CarEvent[], filters: SearchFilters): CarEvent[] {
  let filteredEvents = [...events];
  
  // Apply search query
  if (filters.searchQuery) {
    filteredEvents = searchEvents(filteredEvents, filters.searchQuery);
  }
  
  // Apply event type filter
  if (filters.eventTypes && filters.eventTypes.length > 0) {
    filteredEvents = filterEventsByType(filteredEvents, filters.eventTypes);
  }
  
  // Apply date range filter
  if (filters.dateRange) {
    filteredEvents = filterEventsByDateRange(filteredEvents, filters.dateRange);
  }
  
  // Apply tags filter
  if (filters.tags && filters.tags.length > 0) {
    filteredEvents = filterEventsByTags(filteredEvents, filters.tags);
  }
  
  return filteredEvents;
}

/**
 * Highlights matching terms in text
 */
export function highlightSearchTerms(text: string, searchQuery: string): string {
  if (!searchQuery.trim()) {
    return text;
  }
  
  const searchTerm = searchQuery.toLowerCase().trim();
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
}

/**
 * Escapes special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Gets unique tags from all events
 */
export function getUniqueTagsFromEvents(events: CarEvent[]): string[] {
  const allTags = events.flatMap(event => event.tags);
  return [...new Set(allTags)].sort();
}

/**
 * Gets date range from events (earliest to latest)
 */
export function getDateRangeFromEvents(events: CarEvent[]): { start: string; end: string } | null {
  if (events.length === 0) {
    return null;
  }
  
  const dates = events.map(event => new Date(event.occurredAt));
  const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
  const latest = new Date(Math.max(...dates.map(d => d.getTime())));
  
  return {
    start: earliest.toISOString().split('T')[0],
    end: latest.toISOString().split('T')[0]
  };
}