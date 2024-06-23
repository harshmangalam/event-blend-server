import { z } from "zod";

const geoLocationSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
});
const locationSchema = z.tuple([
  z.number().min(-90).max(90), // Latitude: between -90 and 90
  z.number().min(-180).max(180), // Longitude: between -180 and 180
]);

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
