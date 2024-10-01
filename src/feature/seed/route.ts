import { prisma } from "@/lib/prisma";
import { getGravatarUrl } from "@/lib/utils";
import { Variables } from "@/types";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { usersSeedSchema } from "./schema";
import { categories, events, groups, locations } from "@/data/seed";

const app = new Hono<{ Variables: Variables }>();

app.get("/users", zValidator("query", usersSeedSchema), async (c) => {
  const query = c.req.valid("query");
  const length = query.num ?? 100;
  const password = await Bun.password.hash("123456", {
    algorithm: "bcrypt",
    cost: 10,
  });

  const data = Array.from({ length }, (_, i) => {
    const email =
      query.role === "Admin"
        ? `admin${length + i + 1}@eventblend.com`
        : `user${length + i + 1}@eventblend.com`;

    return {
      name:
        query.role === "Admin"
          ? `Admin${length + i + 1}`
          : `User${length + i + 1}`,
      email: email,
      password,
      bio: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis, laudantium neque quidem enim eligendi placeat a accusamus corrupti voluptatum suscipit doloribus est, dicta, natus recusandae! Fugit dolorum animi laborum fuga. ${
        i + 1
      }`,
      profilePhoto: getGravatarUrl(email),
      role: query.role,
    };
  });

  await prisma.user.createMany({
    data,
  });

  return c.json({
    success: true,
    message: "Seeded users!",
  });
});

app.get("/categories", async (c) => {
  await prisma.topic.deleteMany();
  await prisma.category.deleteMany();
  for await (const c of categories) {
    console.log(`for ${c.name}`);
    await prisma.category.create({
      data: c,
    });
  }
  return c.json({
    success: true,
    message: "Seeded categories!",
  });
});
app.get("/groups", async (c) => {
  await prisma.group.deleteMany();
  await prisma.groupMember.deleteMany();
  for (const g of groups) {
    const { members = [], ...rest } = g;
    const group = await prisma.group.create({
      data: rest,
    });
    if (members.length) {
      for (const member of members) {
        await prisma.groupMember.create({
          data: {
            group: {
              connect: {
                id: group.id,
              },
            },
            role: member.role,
            user: {
              connect: {
                email: member.email,
              },
            },
          },
        });
      }
    }
  }
  return c.json({
    success: true,
    message: "Groups created",
  });
});

app.get("/locations", async (c) => {
  await prisma.location.deleteMany();
  await prisma.location.createMany({
    data: locations,
  });
  return c.json({
    success: true,
    message: "Location created",
  });
});

app.get("/events", async (c) => {
  await prisma.event.deleteMany();
  for await (const e of events) {
    await prisma.event.create({
      data: e,
    });
  }
  return c.json({
    success: true,
    message: "Events created",
  });
});

export default app;
