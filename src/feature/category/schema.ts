import { z } from "zod";

export const categoryBodySchema = z.object({
  name: z.string().min(1),
});
export const categoryParamSchema = z.object({
  id: z.string().cuid(),
});
