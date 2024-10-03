import { createTransport } from "nodemailer";
import { env } from "./env";

// Create transporter for sending emails
export const transporter = createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER, // Your email
    pass: env.EMAIL_PASSWORD, // Your email password
  },
});
