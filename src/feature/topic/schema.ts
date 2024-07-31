import { z } from "zod";

const topicBodySchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().cuid(),
});

const topicParamSchema = z.object({
  topicId: z.string(),
});
const topicSlugParamSchema = z.object({
  slug: z.string(),
});

export { topicBodySchema, topicParamSchema, topicSlugParamSchema };
