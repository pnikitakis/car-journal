import { z } from 'zod';
import { AttachmentSchema, type Attachment } from './event';

export const VehicleSchema = z.object({
  id: z.string(),
  make: z.string().optional(),
  model: z.string().optional(),
  plate: z.string().optional(),
  vin: z.string().optional(),
  fuelType: z.string().optional(),
  purchasedOn: z.string().optional(),
  notes: z.string().optional(),
  photos: z.array(AttachmentSchema),
});

export type Vehicle = z.infer<typeof VehicleSchema>;