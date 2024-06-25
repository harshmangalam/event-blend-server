import { z } from "zod";

const createTopicSchema = z.object({
  name: z.string().min(1),
});
export { createTopicSchema };
