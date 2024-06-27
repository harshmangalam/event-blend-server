import { z } from "zod";

const topicBodySchema = z.object({
  name: z.string().min(1),
});

const topicParamSchema = z.object({
  topicId: z.string(),
});

export { topicBodySchema, topicParamSchema };
