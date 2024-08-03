import { z } from "zod";
const locationSchema = z.tuple([
  z.string(), // Latitude: between -90 and 90
  z.string(), // Longitude: between -180 and 180
]);

const paginationSchema = z.object({
  pageSize: z.coerce.number().min(1).max(100).default(10),
  page: z.coerce.number().default(1),
});

const geoLocationSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  timezone: z.object({
    name: z.string(),
  }),
});

export { locationSchema, paginationSchema, geoLocationSchema };
