# Vehicle Profile Management

This module provides comprehensive vehicle profile management functionality for the Car Journal application.

## Components

### VehicleProfile
The main component that handles both display and editing modes for vehicle profiles.

```tsx
import { VehicleProfile } from './vehicle-profile';

function MyPage() {
  return <VehicleProfile className="max-w-4xl mx-auto" />;
}
```

**Features:**
- Automatic loading of vehicle data from localStorage
- Seamless switching between display and edit modes
- Error handling with user-friendly messages
- Loading states with spinner
- Empty state handling for new users

### VehicleProfileForm
A comprehensive form component for editing vehicle information.

```tsx
import { VehicleProfileForm } from './vehicle-profile-form';

function EditVehicle({ vehicle, onSave, onCancel }) {
  return (
    <VehicleProfileForm
      vehicle={vehicle}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}
```

**Features:**
- All vehicle fields: make, model, plate, VIN, fuel type, purchase date, notes
- Photo upload with drag-and-drop support
- Real-time validation with Zod schemas
- File size and type validation (10MB limit, images only for photos)
- Thumbnail generation and preview
- Form state management with error handling

### VehicleProfileDisplay
A read-only display component for vehicle information.

```tsx
import { VehicleProfileDisplay } from './vehicle-profile-display';

function ViewVehicle({ vehicle, onEdit }) {
  return (
    <VehicleProfileDisplay
      vehicle={vehicle}
      onEdit={onEdit}
    />
  );
}
```

**Features:**
- Organized layout with sections for basic and technical information
- Photo gallery with modal view
- Formatted display of dates and technical data
- Empty state handling
- Edit button integration

## Utilities

### useVehicleProfile Hook
A custom hook for managing vehicle profile state and operations.

```tsx
import { useVehicleProfile } from '../lib/use-vehicle-profile';

function MyComponent() {
  const {
    vehicle,
    isLoading,
    error,
    saveVehicleProfile,
    refreshVehicle,
    clearError
  } = useVehicleProfile();

  // Use the vehicle data and operations
}
```

**Features:**
- Automatic data loading on mount
- Error state management
- Loading state tracking
- Save operations with error handling
- Refresh functionality

## Data Flow

1. **Loading**: Vehicle data is loaded from localStorage on component mount
2. **Display**: If vehicle exists, show in display mode; if not, start in edit mode
3. **Editing**: Form validation ensures data integrity before saving
4. **Saving**: Data is persisted to localStorage with error handling
5. **Photos**: Images are processed, validated, and stored as attachments

## Validation

All vehicle data is validated using Zod schemas:

- **VIN**: Optional 17-character string (auto-uppercase)
- **License Plate**: Optional string (auto-uppercase)
- **Fuel Type**: Predefined options (gasoline, diesel, hybrid, electric, other)
- **Purchase Date**: Valid date format
- **Photos**: Image files only, 10MB size limit per file

## Error Handling

The components provide comprehensive error handling:

- **Storage Errors**: localStorage unavailability or corruption
- **File Errors**: Size limits, invalid file types, processing failures
- **Validation Errors**: Form field validation with specific error messages
- **Network Errors**: Graceful degradation when storage is unavailable

## Accessibility

All components follow accessibility best practices:

- Proper ARIA labels and semantic markup
- Keyboard navigation support
- Screen reader compatibility
- Focus management in modals
- High contrast support for dark mode

## Testing

The module includes comprehensive tests:

- Unit tests for storage functions
- Validation testing for all data types
- Error handling scenarios
- Edge cases (empty data, corrupted storage)

Run tests with:
```bash
pnpm test src/lib/__tests__/use-vehicle-profile.test.ts
```

## Integration

To integrate vehicle profile management into your application:

1. Import the main `VehicleProfile` component
2. Ensure localStorage is available in your environment
3. Include Tailwind CSS classes for styling
4. Handle any storage errors appropriately for your use case

The component is fully self-contained and manages its own state, making integration straightforward.