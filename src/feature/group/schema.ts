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

export { createGroupSchema, groupParamSchema };
