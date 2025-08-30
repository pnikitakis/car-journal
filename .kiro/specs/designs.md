# Car Journal — Design

## Architecture
- **Next.js (App Router) + TypeScript + Tailwind** for UI
- **Local data only:** small store persisted to `localStorage` (key: `car-journal/v1`)
- Validation: **Zod** schemas mirroring TS types
- No network calls in MVP

## Data model (TS sketch)
```ts
export type EventKind = "fuel"|"service"|"tires"|"damage"|"obd"|"custom";
export type AttachmentKind = "image"|"pdf"|"file"|"text"|"audio";

export interface Attachment {
  id:string; kind:AttachmentKind; name:string; mime:string;
  sizeBytes?:number; url?:string; textBody?:string; createdAt:string;
}

export interface CarEvent {
  id:string; type:EventKind; title:string; occurredAt:string;
  mileageKm?:number; notes?:string; tags:string[];
  attachments:Attachment[]; thumbnailUrl?:string;
  fuel?:{ liters?:number; totalAmount?:number; station?:string };
  service?:{ workshop?:string; cost?:number; nextDueAt?:string; nextDueMileage?:number };
  tires?:{ brand?:string; model?:string; size?:string; position?:string; price?:number };
  obd?:{ source?:"car_scanner"|"torque"|"photo_only"; fileName?:string };
}

export interface Vehicle { id:string; make?:string; model?:string; plate?:string; vin?:string; fuelType?:string; purchasedOn?:string; photos:Attachment[]; }
export interface UserSettings { enabledEventTypes: EventKind[]; tags: string[]; }
