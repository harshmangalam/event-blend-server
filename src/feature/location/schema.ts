import { locationSchema } from "@/schema";
import { z } from "zod";

export const locationBodySchema = z.object({
  coords: locationSchema,
});
