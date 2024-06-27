import { z } from "zod";
const locationSchema = z.tuple([
  z.number().min(-90).max(90), // Latitude: between -90 and 90
  z.number().min(-180).max(180), // Longitude: between -180 and 180
]);

const paginationSchema = z.object({
  pageSize: z.coerce.number().min(1).max(100).default(10),
  page: z.coerce.number().default(1),
});

export { locationSchema, paginationSchema };
