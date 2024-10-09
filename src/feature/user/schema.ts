import { z } from "zod";

export const editProfileBodySchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
});

export const profileIdParamSchema = z.object({
  id: z.string().cuid2(),
});
