import { z } from "zod";

export const categoryBodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});
export const categoryParamSchema = z.object({
  id: z.string().cuid(),
});

export const categorySlugParamSchema = z.object({
  slug: z.string(),
});
