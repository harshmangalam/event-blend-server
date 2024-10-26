import { z } from "zod";
import { locationSchema, geoLocationSchema } from "../../schema";

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  gender: z.enum(["Male", "Female", "Other"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
const resetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
});

export {
  signupSchema,
  geoLocationSchema,
  loginSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
};
