import { z } from "zod";
import { locationSchema } from "../../schema";

export const eventDateSchema = z.object({
  startDate: z.number(),
  endDate: z.number(),
});
export const createEventSchema = z.object({
  name: z.string().min(1),
  details: z.string().min(1),
  poster: z.string().url().optional(),
  groupId: z.string(),
  address: z.string(),
  location: locationSchema,
  dates: z.array(eventDateSchema),
  categoryId: z.string(),
  eventType: z.string(),
});
