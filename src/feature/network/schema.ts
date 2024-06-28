import { z } from "zod";
const networkBodySchema = z.object({
  name: z.string().min(1),
  organization: z.string().optional(),
  organizationUrl: z.string().optional(),
});
const networkParamSchema = z.object({
  networkId: z.string(),
});

export { networkParamSchema, networkBodySchema };
