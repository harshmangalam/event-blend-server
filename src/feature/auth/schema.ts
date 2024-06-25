import { z } from "zod";
import { locationSchema } from "../../schema";

const geoLocationSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
});

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  isAdult: z.boolean(),
  location: locationSchema,
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export { signupSchema, geoLocationSchema, loginSchema };
