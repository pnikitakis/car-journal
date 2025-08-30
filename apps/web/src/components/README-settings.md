# Settings System

The settings system allows users to customize their Car Journal experience by enabling/disabling event types and managing saved tags.

## Components

### SettingsPage
The main settings interface that allows users to:
- Toggle event types on/off
- Add, edit, and remove saved tags
- View current settings state

### EventTypeSelector
Example component showing how to respect settings by only displaying enabled event types.

### SettingsExample
Demo component that shows the complete settings system in action.

## Hooks

### useSettings()
React hook for managing settings state with localStorage persistence.

**Returns:**
- `settings`: Current settings object or null if loading
- `isLoading`: Boolean indicating if settings are being loaded
- `error`: Error message if loading/saving fails
- `updateSettings(newSettings)`: Update entire settings object
- `toggleEventType(eventType)`: Toggle an event type on/off
- `addTag(tag)`: Add a new tag
- `removeTag(tag)`: Remove a tag
- `editTag(oldTag, newTag)`: Edit an existing tag
- `isEventTypeEnabled(eventType)`: Check if event type is enabled
- `getEnabledEventTypes()`: Get array of enabled event types

## Utilities

### settings-utils.ts
Pure utility functions for accessing settings without React:

- `getEnabledEventTypes()`: Get enabled event types (with fallback)
- `isEventTypeEnabled(eventType)`: Check if specific type is enabled
- `filterEnabledEventTypes(types)`: Filter array to only enabled types
- `getAllEventTypes()`: Get all available event types
- `getSavedTags()`: Get saved tags from settings

## Data Structure

```typescript
interface UserSettings {
  enabledEventTypes: EventKind[];
  tags: string[];
}

type EventKind = 'fuel' | 'service' | 'tires' | 'damage' | 'obd' | 'custom';
```

## Usage Examples

### Basic Settings Hook Usage
```tsx
function MyComponent() {
  const { settings, toggleEventType, addTag } = useSettings();
  
  return (
    <div>
      <button onClick={() => toggleEventType('fuel')}>
        Toggle Fuel Events
      </button>
      <button onClick={() => addTag('maintenance')}>
        Add Maintenance Tag
      </button>
    </div>
  );
}
```

### Filtering Components by Settings
```tsx
function EventCreator() {
  const { getEnabledEventTypes } = useSettings();
  const enabledTypes = getEnabledEventTypes();
  
  return (
    <select>
      {enabledTypes.map(type => (
        <option key={type} value={type}>{type}</option>
      ))}
    </select>
  );
}
```

### Using Utility Functions
```tsx
import { isEventTypeEnabled, getSavedTags } from '../lib/settings-utils';

function SomeComponent() {
  // These work without React context
  const canShowFuel = isEventTypeEnabled('fuel');
  const availableTags = getSavedTags();
  
  return (
    <div>
      {canShowFuel && <FuelEventForm />}
      <TagSelector tags={availableTags} />
    </div>
  );
}
```

## Error Handling

The settings system gracefully handles localStorage errors:
- Falls back to default settings if localStorage is unavailable
- Shows user-friendly error messages in the UI
- Continues to function even when persistence fails

## Testing

Tests are provided for:
- Settings hook functionality
- Utility functions
- Error scenarios
- Edge cases (duplicate tags, empty inputs, etc.)

Run tests with:
```bash
npm test src/lib/__tests__/settings-utils.test.ts
```

## Integration with Other Components

Other components should use the settings system to:
1. Hide disabled event types from wizards and forms
2. Filter search results to only show enabled types
3. Provide saved tags as quick-select options
4. Respect user preferences throughout the app

The system is designed to be lightweight and non-intrusive, with sensible defaults that work even when settings can't be loaded.