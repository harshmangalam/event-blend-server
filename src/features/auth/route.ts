import { Hono } from "hono";
import { reverseGeocodingAPI } from "../../lib/utils";
import { prisma } from "../../lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono();

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
app.post("/login", (c) => {
  return c.json({
    message: "Login successfully",
  });
});

app.post("/signup", zValidator("json", signupSchema), async (c) => {
  const body = c.req.valid("json");
  // hash password
  const password = await Bun.password.hash(body.password, {
    algorithm: "bcrypt",
    cost: 10,
  });
  const user = await prisma.user.create({
    data: {
      ...body,
      password,
    },
  });

  // fetch user location from lat & lon
  let location: any;
  if (body.location && body.location.length === 2) {
    const [lat, lon] = body.location;
    location = await reverseGeocodingAPI(lat, lon);
  }

  if (location) {
    await prisma.location.create({
      data: {
        userId: user.id,
        ...location,
      },
    });
  }

  return c.json({
    message: "Account created successfully",
    data: {
      user,
    },
  });
});

app.post("/logout", (c) => {
  return c.json({
    message: "Logout successfully",
  });
});

app.get("/me", (c) => {
  return c.json({
    message: "Fetch current user",
  });
});

export default app;
