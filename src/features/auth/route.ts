import { Hono } from "hono";
import { reverseGeocodingAPI } from "../../lib/utils";
import { prisma } from "../../lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { geoLocationSchema, signupSchema } from "./schema";

const app = new Hono();

app.post("/login", (c) => {
  return c.json({
    success: true,
    message: "Login successfully",
  });
});

app
  .post("/signup", zValidator("json", signupSchema), async (c) => {
    const body = c.req.valid("json");
    // hash password
    const password = await Bun.password.hash(body.password, {
      algorithm: "bcrypt",
      cost: 10,
    });
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        isAdult: body.isAdult,
        password,
      },
    });

    // fetch user location from lat & lon
    if (body.location && body.location.length === 2) {
      const [lat, lon] = body.location;
      const locationResp = await reverseGeocodingAPI(lat, lon);
      const location = geoLocationSchema.parse(locationResp);
      await prisma.location.create({
        data: {
          userId: user.id,
          ...location,
        },
      });
    }

    return c.json({
      success: true,
      message: "Account created successfully",
      data: {
        user,
      },
    });
  })
  .onError((err: any, c) => {
    if (err.code === "P2002") {
      return c.json(
        {
          success: false,
          message: "Email address already in use",
        },
        400
      );
    }
    return c.json(
      {
        success: false,
        message: "Internal server error",
      },
      500
    );
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
