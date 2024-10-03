import { Hono } from "hono";
import { getExpTimestamp } from "@/lib/utils";
import { prisma } from "../../lib/prisma";
import { zValidator } from "@hono/zod-validator";
import {
  loginSchema,
  signupSchema,
  resetPasswordRequestSchema,
} from "./schema";
import { HTTPException } from "hono/http-exception";
import { jwt, sign, verify } from "hono/jwt";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_EXP,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_EXP,
} from "@/config/constants";
import { setCookie, deleteCookie } from "hono/cookie";
import { isAuthenticated } from "@/middleware/auth";
import { env } from "@/config/env";
import { Variables } from "@/types";
import { transporter } from "@/lib/email";

const app = new Hono<{ Variables: Variables }>();

app.post("/login", zValidator("json", loginSchema), async (c) => {
  const body = c.req.valid("json");

  // match user email
  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!user) {
    throw new HTTPException(400, {
      message: "The email address or password you entered is incorrect",
    });
  }

  // match password
  const matchPassword = await Bun.password.verify(
    body.password,
    user.password,
    "bcrypt"
  );
  if (!matchPassword) {
    throw new HTTPException(400, {
      message: "The email address or password you entered is incorrect",
    });
  }

  // create access token
  const accessToken = await sign(
    {
      exp: getExpTimestamp(ACCESS_TOKEN_EXP),
      sub: user.id,
    },
    env.JWT_SECRET
  );

  // create refresh token
  const refreshToken = await sign(
    {
      exp: getExpTimestamp(REFRESH_TOKEN_EXP),
      sub: user.id,
    },
    env.JWT_SECRET
  );
  setCookie(c, ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    path: "/",
    maxAge: ACCESS_TOKEN_EXP,
  });
  setCookie(c, REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    path: "/",
    maxAge: REFRESH_TOKEN_EXP,
  });

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      status: "Online",
    },
  });
  return c.json({
    success: true,
    message: "Login successfully",
    data: {
      accessToken,
      refreshToken,
    },
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
      email: body.email,
      name: body.name,
      password,
      status: "Offline",
    },
  });

  return c.json({
    success: true,
    message: "Account created successfully",
    data: {
      user,
    },
  });
});

app.get(
  "/me",
  jwt({
    cookie: ACCESS_TOKEN_COOKIE_NAME,
    secret: env.JWT_SECRET,
  }),
  isAuthenticated,
  async (c) => {
    const currentUser = c.get("user");
    const user = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: true,
        profilePhoto: true,
      },
    });
    if (!user) {
      throw new HTTPException(404, {
        message: "User not found",
      });
    }
    return c.json({
      success: true,
      message: "Fetch current user",
      data: {
        user,
      },
    });
  }
);

app.get(
  "/refresh",
  jwt({ secret: env.JWT_SECRET, cookie: "refreshToken" }),
  async (c) => {
    const jwtPayload = c.get("jwtPayload");

    // create access token
    const accessToken = await sign(
      {
        exp: getExpTimestamp(ACCESS_TOKEN_EXP),
        sub: jwtPayload.sub,
      },
      env.JWT_SECRET
    );

    // create refresh token
    const refreshToken = await sign(
      {
        exp: getExpTimestamp(REFRESH_TOKEN_EXP),
        sub: jwtPayload.sub,
      },
      env.JWT_SECRET
    );
    setCookie(c, ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: ACCESS_TOKEN_EXP,
    });
    setCookie(c, REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: REFRESH_TOKEN_EXP,
    });
    return c.json({
      success: true,
      message: "Access & refresh token created",
      data: {
        accessToken,
        refreshToken,
      },
    });
  }
);

// Password reset request route
app.post(
  "/reset-password",
  zValidator("json", resetPasswordRequestSchema),
  async (c) => {
    const body = c.req.valid("json");

    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw new HTTPException(404, {
        message: "User with this email does not exist",
      });
    }

    const token = await sign(
      {
        exp: getExpTimestamp(ACCESS_TOKEN_EXP),
        sub: user.id,
      },
      env.JWT_SECRET
    );

    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      html: `
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link is valid for 1 hour.</p>
    `,
    };

    await transporter.sendMail(mailOptions);

    return c.json({
      success: true,
      message: "Password reset email sent successfully",
    });
  }
);

// Confirm password reset route
app.post("/reset-password/confirm", async (c) => {
  const { token, newPassword } = await c.req.json();

  try {
    const decoded = await verify(token, env.JWT_SECRET);
    const userId = decoded.sub as string;

    const hashedPassword = await Bun.password.hash(newPassword, {
      algorithm: "bcrypt",
      cost: 10,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return c.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    throw new HTTPException(400, {
      message: "Invalid or expired token",
    });
  }
});

app.post(
  "/logout",
  jwt({
    secret: env.JWT_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  async (c) => {
    deleteCookie(c, ACCESS_TOKEN_COOKIE_NAME);
    deleteCookie(c, REFRESH_TOKEN_COOKIE_NAME);

    const currentUser = c.get("user");

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        status: "Offline",
      },
    });

    return c.json({
      success: true,
      message: "Logout successfully",
    });
  }
);

export default app;
