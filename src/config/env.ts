import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().min(1000).max(65535),
  ENV: z
    .union([
      z.literal("development"),
      z.literal("testing"),
      z.literal("production"),
    ])
    .default("development"),
  DATABASE_URL: z.string(),
  GEOAPIFY_API_KEY: z.string(),
  JWT_ACEESS_TOKEN_SECRET: z.string(),
  JWT_REFRESH_TOKEN_SECRET: z.string(),
});

declare module "bun" {
  interface Env extends z.infer<typeof envSchema> {}
}

const env = envSchema.parse(Bun.env);
export type Environment = {
  Bindings: z.infer<typeof envSchema>;
};
export default env;
