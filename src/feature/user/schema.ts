import { z } from "zod";

export const editProfileBodySchema = z.object({
  name: z.string().max(32).optional(),
  bio: z.string().max(250).optional(),
});

export const profileIdParamSchema = z.object({
  id: z.string().cuid2(),
});
