import { z } from "zod";

const createTopicSchema = z.object({
  name: z.string().min(1),
});

const deleteTopicSchema = z.object({
  topicId: z.string(),
});
export { createTopicSchema, deleteTopicSchema };
