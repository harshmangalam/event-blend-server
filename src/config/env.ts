import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().min(1000).max(65535).optional().default(3000),
  ENV: z
    .union([
      z.literal("development"),
      z.literal("testing"),
      z.literal("production"),
    ])
    .optional()
    .default("development"),
  DATABASE_URL: z.string().url(),
  GEOAPIFY_API_KEY: z.string().optional(),
  JWT_SECRET: z.string().trim().min(1),
  EMAIL_USER: z.string().email().optional(), // Added email validation
  EMAIL_PASSWORD: z.string().optional(), // Email password validation with a minimum length
  FRONTEND_URL: z.string().url().optional(), // Validation for the frontend URL
});

declare module "bun" {
  interface Env extends z.infer<typeof envSchema> {}
}

const parsedEnv = envSchema.safeParse(Bun.env);

if (!parsedEnv.success) {
  console.error(parsedEnv.error.issues);
  process.exit(1);
}

export const env = parsedEnv.data;
export type Environment = {
  Bindings: z.infer<typeof envSchema>;
};
