import { z } from "zod";
import { locationSchema } from "../../schema";

const createGroupSchema = z.object({
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
  name: z.string(),
  description: z.string().optional(),
});

const groupNearByQuerySchema = z.object({
  lat: z.string(),
  lon: z.string(),
  slug: z.string(),
});

const updateGroupLocationSchema = z.object({
  location: locationSchema.optional(),
});
const updateGroupTopicsSchema = z.object({
  topics: z.array(z.string()),
});

export {
  createGroupSchema,
  groupParamSchema,
  groupSlugSchema,
  updateGroupSchema,
  groupNearByQuerySchema,
  updateGroupLocationSchema,
  updateGroupTopicsSchema,
};
