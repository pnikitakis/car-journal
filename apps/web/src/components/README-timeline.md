# Timeline and Event Display System

This module provides components for displaying and managing car events in a timeline format.

## Components

### EventTimeline

Main timeline component that displays events in reverse chronological order.

**Features:**
- Loads events from localStorage automatically
- Sorts events by date (newest first)
- Handles loading and error states
- Shows empty state when no events exist
- Refreshes data after event deletion

**Props:**
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
import { EventTimeline } from './event-timeline';

function App() {
  return <EventTimeline className="space-y-4" />;
}
```

### EventCard

Individual event card component showing key event information.

**Features:**
- Displays event thumbnail or type icon
- Shows event title, date, mileage, and summary
- Color-coded by event type
- Displays tags and attachment count
- Clickable to open detailed view

**Props:**
- `event: CarEvent` - The event data to display
- `onClick: () => void` - Handler for card click
- `className?: string` - Additional CSS classes

### EventDetailModal

Modal component showing full event details with attachment gallery.

**Features:**
- Complete event information display
- Event-specific details (fuel, service, tires, etc.)
- Attachment gallery with preview
- Delete functionality with confirmation
- Responsive design

**Props:**
- `event: CarEvent` - The event to display
- `onClose: () => void` - Handler for closing modal
- `onEventDeleted: () => void` - Handler called after successful deletion

### AttachmentGallery

Gallery component for displaying event attachments.

**Features:**
- Grid layout for multiple attachments
- Preview generation for images and text
- Full-size viewer modal
- File type icons and size display
- Download functionality for files

**Props:**
- `attachments: Attachment[]` - Array of attachments to display
- `className?: string` - Additional CSS classes

## Event Type Styling

Events are color-coded by type:
- **Fuel**: Green
- **Service**: Blue  
- **Tires**: Purple
- **Damage**: Red
- **OBD**: Yellow
- **Custom**: Gray

## Empty States

The timeline shows appropriate empty states:
- Loading spinner while fetching data
- Error message with retry option
- Welcome message when no events exist

## Error Handling

- Storage errors are caught and displayed to user
- Delete operations include confirmation dialog
- Failed operations show appropriate error messages

## Accessibility

- Proper semantic markup
- Keyboard navigation support
- Screen reader friendly labels
- High contrast color schemes
- Focus management in modals

## Dependencies

- React hooks (useState, useEffect)
- Tailwind CSS for styling
- Local storage utilities
- Format utilities for data display
- Type definitions from ../types

## File Structure

```
components/
├── event-timeline.tsx       # Main timeline component
├── event-card.tsx          # Individual event cards
├── event-detail-modal.tsx  # Detailed event view
├── attachment-gallery.tsx  # Attachment display
├── timeline-example.tsx    # Usage example
└── README-timeline.md      # This documentation
```

## Integration

The timeline integrates with:
- Storage system for data persistence
- Event creation wizard for adding events
- Settings system for event type filtering
- File handling system for attachments

## Performance Considerations

- Events are sorted once on load
- Thumbnails use object URLs for efficiency
- Modal content is only rendered when needed
- Large attachment lists are handled gracefully