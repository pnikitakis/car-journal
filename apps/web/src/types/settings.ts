import { z } from 'zod';
import { EventKindSchema, type EventKind } from './event';

export const UserSettingsSchema = z.object({
  enabledEventTypes: z.array(EventKindSchema),
  tags: z.array(z.string()),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

// Re-export EventKind for convenience
export { EventKind, EventKindSchema };