import { z } from "zod";

const locationSchema = z.tuple([
  z.number().min(-90).max(90), // Latitude: between -90 and 90
  z.number().min(-180).max(180), // Longitude: between -180 and 180
]);

const signupSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  isAdult: z.boolean(),
  location: locationSchema,
});

export { signupSchema };
