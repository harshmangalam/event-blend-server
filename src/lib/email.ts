import { createTransport } from "nodemailer";
import { env } from "@/config/env";

// Create transporter for sending emails
export const transporter = createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER, // Your email
    pass: env.EMAIL_PASSWORD, // Your email password
  },
});
