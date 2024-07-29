import { z } from "zod";
import { locationSchema, geoLocationSchema } from "../../schema";

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export { signupSchema, geoLocationSchema, loginSchema };
