/**
 * Utility functions for formatting data for display
 */

/**
 * Formats a date string for display
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Show relative dates for recent events
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    }
    
    // For older dates, show the actual date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Formats mileage for display
 */
export function formatMileage(mileageKm: number): string {
  if (typeof mileageKm !== 'number' || isNaN(mileageKm)) {
    return 'Unknown mileage';
  }
  
  // Format with thousands separator
  return `${mileageKm.toLocaleString()} km`;
}

/**
 * Formats currency for display
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Unknown amount';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (typeof bytes !== 'number' || isNaN(bytes)) {
    return 'Unknown size';
  }
  
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Formats a duration in milliseconds to human readable format
 */
export function formatDuration(ms: number): string {
  if (typeof ms !== 'number' || isNaN(ms) || ms < 0) {
    return 'Unknown duration';
  }
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (typeof text !== 'string') {
    return '';
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalizes the first letter of each word
 */
export function titleCase(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formats event type for display
 */
export function formatEventType(type: string): string {
  const typeMap: Record<string, string> = {
    fuel: 'Fuel',
    service: 'Service',
    tires: 'Tires',
    damage: 'Damage',
    obd: 'OBD',
    custom: 'Custom',
  };
  
  return typeMap[type] || titleCase(type);
}