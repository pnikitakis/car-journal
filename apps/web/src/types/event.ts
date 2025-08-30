import { z } from 'zod';

// Event types
export const EventKindSchema = z.enum(['fuel', 'service', 'tires', 'damage', 'obd', 'custom']);
export type EventKind = z.infer<typeof EventKindSchema>;

// Attachment types
export const AttachmentKindSchema = z.enum(['image', 'pdf', 'file', 'text', 'audio']);
export type AttachmentKind = z.infer<typeof AttachmentKindSchema>;

export const AttachmentSchema = z.object({
  id: z.string(),
  kind: AttachmentKindSchema,
  name: z.string(),
  mime: z.string(),
  sizeBytes: z.number().optional(),
  url: z.string().optional(),
  textBody: z.string().optional(),
  createdAt: z.string(),
});
export type Attachment = z.infer<typeof AttachmentSchema>;

// Event-specific data schemas
export const FuelDataSchema = z.object({
  liters: z.number().optional(),
  totalAmount: z.number().optional(),
  station: z.string().optional(),
});
export type FuelData = z.infer<typeof FuelDataSchema>;

export const ServiceDataSchema = z.object({
  workshop: z.string().optional(),
  cost: z.number().optional(),
  nextDueAt: z.string().optional(),
  nextDueMileage: z.number().optional(),
});
export type ServiceData = z.infer<typeof ServiceDataSchema>;

export const TiresDataSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  size: z.string().optional(),
  position: z.string().optional(),
  price: z.number().optional(),
});
export type TiresData = z.infer<typeof TiresDataSchema>;

export const ObdDataSchema = z.object({
  source: z.enum(['car_scanner', 'torque', 'photo_only']).optional(),
  fileName: z.string().optional(),
});
export type ObdData = z.infer<typeof ObdDataSchema>;

// Main CarEvent schema
export const CarEventSchema = z.object({
  id: z.string(),
  type: EventKindSchema,
  title: z.string(),
  occurredAt: z.string(),
  createdAt: z.string(),
  mileageKm: z.number().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()),
  attachments: z.array(AttachmentSchema),
  thumbnailUrl: z.string().optional(),
  fuel: FuelDataSchema.optional(),
  service: ServiceDataSchema.optional(),
  tires: TiresDataSchema.optional(),
  obd: ObdDataSchema.optional(),
});
export type CarEvent = z.infer<typeof CarEventSchema>;