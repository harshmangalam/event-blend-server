import { z } from "zod";
export const usersSeedSchema = z.object({
  role: z.enum(["User", "Admin"]),
  num: z.coerce.number().optional(),
});

export const seedSchema = z.object({
  num: z.coerce.number().optional(),
});
