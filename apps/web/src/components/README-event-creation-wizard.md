# Event Creation Wizard

A multi-step wizard component for creating car events with comprehensive validation and type-specific fields.

## Features

- **Multi-step workflow**: Type selection → Core fields → Attachments → Type-specific details → Review
- **Event type support**: Fuel, Service, Tires, Damage, OBD, and Custom events
- **File attachments**: Images, PDFs, audio files, and documents up to 10MB each
- **Text notes**: Unlimited text attachments
- **Validation**: Date validation (no future dates), mileage warnings, required field validation
- **Type-specific fields**: Customized forms for each event type
- **Tag management**: Add tags from saved list or create new ones
- **Review step**: Complete overview before creating the event

## Usage

```tsx
import { EventCreationWizard } from './event-creation-wizard';
import { type CarEvent } from '../types/event';

function MyComponent() {
  const [showWizard, setShowWizard] = useState(false);

  const handleEventCreated = (event: CarEvent) => {
    console.log('New event created:', event);
    // Save to storage, update UI, etc.
    setShowWizard(false);
  };

  const handleCancel = () => {
    setShowWizard(false);
  };

  return (
    <div>
      {showWizard ? (
        <EventCreationWizard
          onEventCreated={handleEventCreated}
          onCancel={handleCancel}
        />
      ) : (
        <button onClick={() => setShowWizard(true)}>
          Create New Event
        </button>
      )}
    </div>
  );
}
```

## Props

- `onEventCreated?: (event: CarEvent) => void` - Called when event is successfully created
- `onCancel?: () => void` - Called when user cancels the wizard
- `className?: string` - Additional CSS classes for the wrapper

## Validation Rules

### Core Fields
- **Title**: Required, cannot be empty
- **Date**: Required, cannot be in the future (backdating allowed)
- **Mileage**: Optional, must be non-negative, shows warning for low values
- **Notes**: Optional text field
- **Tags**: Optional, can select from saved tags or create new ones

### Type-Specific Fields

#### Fuel Events
- Liters: Must be positive if provided
- Total Amount: Must be positive if provided
- Station: Optional text field

#### Service Events
- Workshop: Optional text field
- Cost: Must be non-negative if provided
- Next Service Date: Optional future date
- Next Service Mileage: Must be non-negative if provided

#### Tire Events
- Brand, Model, Size: Optional text fields
- Position: Dropdown selection (front-left, front-right, etc.)
- Price: Must be non-negative if provided

#### OBD Events
- Source: Dropdown (Car Scanner, Torque Pro, Photo Only)
- File Name: Optional text field

#### Damage Events
- Uses notes and attachments for documentation

#### Custom Events
- Uses title, notes, and attachments only

## File Handling

- **Supported formats**: Images (JPEG, PNG, GIF, WebP, BMP, SVG), PDFs, Audio (MP3, WAV, OGG, M4A), Documents (TXT, CSV, JSON, XML, DOC, DOCX, XLS, XLSX, ZIP)
- **Size limit**: 10MB per file
- **Preview**: Automatic thumbnails for images, appropriate icons for other file types
- **Text notes**: No size limit, stored as text attachments

## Dependencies

- React hooks (useState, useCallback, useEffect)
- Zod for validation
- Existing components: EventTypeSelector, FileUpload
- Existing hooks: useSettings
- Existing utilities: validateData from validation.ts

## Accessibility

- Full keyboard navigation support
- Proper ARIA labels and semantic markup
- Screen reader compatible
- Clear error and warning messages
- Progress indicator for multi-step flow

## Integration

The wizard integrates with:
- **Settings system**: Respects enabled/disabled event types
- **Tag management**: Uses saved tags from settings
- **File handling**: Uses existing file upload utilities
- **Validation**: Uses Zod schemas for data validation
- **Storage**: Creates events compatible with the storage system

## Example Event Output

```typescript
{
  id: "event_1703123456789_abc123def",
  type: "fuel",
  title: "Gas station fill-up",
  occurredAt: "2024-01-15",
  mileageKm: 45000,
  notes: "Regular unleaded, highway driving",
  tags: ["routine", "highway"],
  attachments: [
    {
      id: "att_1703123456790_xyz789",
      kind: "image",
      name: "receipt.jpg",
      mime: "image/jpeg",
      sizeBytes: 245760,
      url: "blob:...",
      createdAt: "2024-01-15T10:30:00.000Z"
    }
  ],
  thumbnailUrl: "blob:...",
  fuel: {
    liters: 45.2,
    totalAmount: 67.50,
    station: "Shell"
  }
}
```