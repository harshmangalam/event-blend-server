import { locationSchema } from "@/schema";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  categoryId: z.string(),
  location: locationSchema,
  poster: z.string().url(),
  topics: z.array(z.string()),
});

const groupParamSchema = z.object({
  groupId: z.string().cuid2(),
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

export {
  createGroupSchema,
  groupParamSchema,
  groupSlugSchema,
  updateGroupSchema,
  groupNearByQuerySchema,
};
