# Requirements Document

## Introduction

Car Journal is a media-first car logbook application that enables car owners to quickly record maintenance and incident events with rich attachments, then easily find and export this information. The MVP focuses on single-user, single-vehicle scenarios with local storage persistence, optimizing for speed and simplicity in event logging.

## Requirements

### Requirement 1: Event Creation and Management

**User Story:** As a car owner, I want to create different types of events (fuel, service, tires, damage, OBD, custom) with attachments, so that I can maintain a comprehensive record of my vehicle's history.

#### Acceptance Criteria

1. WHEN I access the add event flow THEN the system SHALL present a wizard with event type selection
2. WHEN I select an event type THEN the system SHALL display core fields (title, date, mileage, notes, tags)
3. WHEN I add attachments THEN the system SHALL accept images, PDFs, files, text notes up to 10MB each
4. WHEN I complete the wizard THEN the system SHALL save the event with all attachments to localStorage
5. IF I select a past date THEN the system SHALL allow backdating but not future dates
6. IF I enter mileage less than the previous event THEN the system SHALL display a warning but allow saving
7. WHEN I add type-specific fields THEN the system SHALL validate fuel (liters, cost, station), service (workshop, cost, due dates), tires (brand, size, position), and OBD data

### Requirement 2: Timeline and Event Discovery

**User Story:** As a car owner, I want to view, search, and filter my event timeline, so that I can quickly find specific events or patterns in my vehicle's history.

#### Acceptance Criteria

1. WHEN I view the timeline THEN the system SHALL display events in reverse chronological order
2. WHEN I use search THEN the system SHALL find events by title, notes, tags, or type-specific fields
3. WHEN I apply filters THEN the system SHALL filter by event type, date range, and tags
4. WHEN I click an event THEN the system SHALL show full details with attachment gallery
5. WHEN I view event details THEN the system SHALL provide delete functionality
6. WHEN search returns results THEN the system SHALL highlight matching terms
7. WHEN no events match filters THEN the system SHALL display appropriate empty state##
# Requirement 3: Vehicle Profile Management

**User Story:** As a car owner, I want to maintain my vehicle's profile information and photos, so that I have complete documentation for insurance or sale purposes.

#### Acceptance Criteria

1. WHEN I access vehicle profile THEN the system SHALL display editable fields for VIN, make, model, plate, fuel type, purchase date, and notes
2. WHEN I add vehicle photos THEN the system SHALL store them as attachments with the vehicle profile
3. WHEN I save profile changes THEN the system SHALL validate and persist data to localStorage
4. WHEN I view the profile THEN the system SHALL display all information in an organized layout

### Requirement 4: Settings and Customization

**User Story:** As a car owner, I want to customize which event types are enabled and manage my saved tags, so that the interface matches my specific needs.

#### Acceptance Criteria

1. WHEN I access settings THEN the system SHALL display toggles for each event type (fuel, service, tires, damage, OBD, custom)
2. WHEN I disable an event type THEN the system SHALL hide it from the add event wizard
3. WHEN I manage tags THEN the system SHALL allow adding, editing, and deleting saved tags
4. WHEN I save settings THEN the system SHALL persist preferences to localStorage
5. WHEN I use disabled event types THEN the system SHALL not display them in filters or search

### Requirement 5: Data Export and Persistence

**User Story:** As a car owner, I want to export my vehicle and event data as a printable report, so that I can provide documentation for sales or insurance purposes.

#### Acceptance Criteria

1. WHEN I request an export THEN the system SHALL generate an HTML "Sale Pack" with vehicle profile and recent events
2. WHEN the export is generated THEN the system SHALL include event summaries, key details, and attachment thumbnails
3. WHEN I print the export THEN the system SHALL format content appropriately for printing
4. WHEN I use the application THEN the system SHALL automatically save all data to localStorage with key "car-journal/v1"
5. WHEN I return to the application THEN the system SHALL restore all data from localStorage
6. IF localStorage is unavailable THEN the system SHALL display appropriate error messaging

### Requirement 6: File Handling and Validation

**User Story:** As a car owner, I want to attach various file types to my events with appropriate validation, so that I can include relevant documentation without system errors.

#### Acceptance Criteria

1. WHEN I upload files THEN the system SHALL accept images, PDFs, and generic files up to 10MB each
2. WHEN I exceed file size limits THEN the system SHALL display a helpful error message and prevent upload
3. WHEN I add images THEN the system SHALL generate thumbnails for timeline display
4. WHEN I add files THEN the system SHALL store them using URL.createObjectURL for previews
5. WHEN I view attachments THEN the system SHALL display appropriate previews based on file type
6. WHEN I add text notes THEN the system SHALL store them as text attachments without file size limits

### Requirement 7: Accessibility and User Experience

**User Story:** As a car owner, I want the application to be accessible and fast to use, so that I can quickly log events without barriers.

#### Acceptance Criteria

1. WHEN I navigate the interface THEN the system SHALL support full keyboard navigation
2. WHEN I interact with form elements THEN the system SHALL provide proper labels and ARIA attributes
3. WHEN I use the add event flow THEN the system SHALL complete in under 30 seconds for typical events
4. WHEN I view the interface THEN the system SHALL support both light and dark modes
5. WHEN I encounter errors THEN the system SHALL display clear, actionable error messages
6. WHEN I use screen readers THEN the system SHALL provide appropriate semantic markup and descriptions