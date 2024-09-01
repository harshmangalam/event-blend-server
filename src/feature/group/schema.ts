import { z } from "zod";
import { locationSchema } from "../../schema";

const createGroupSchema = z.object({
  location: locationSchema,
  topics: z.array(z.string()),
  name: z.string().min(1),
  description: z.string(),
  networkId: z.string().optional(),
  categoryId: z.string(),
});

const groupParamSchema = z.object({
  groupId: z.string(),
});

const groupSlugSchema = z.object({
  slug: z.string(),
});

const updateGroupSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  topics: z.array(z.string()),
  location: locationSchema.optional(),
});

const groupNearByQuerySchema = z.object({
  lat: z.string(),
  lon: z.string(),
  slug: z.string(),
});

export {
  createGroupSchema,
  groupParamSchema,
  groupSlugSchema,
  updateGroupSchema,
  groupNearByQuerySchema,
};
