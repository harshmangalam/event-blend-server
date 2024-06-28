import { z } from "zod";

const networkParamSchema = z.object({
  networkId: z.string(),
});

export { networkParamSchema };
