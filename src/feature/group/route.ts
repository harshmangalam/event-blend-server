import { Hono } from "hono";
import { Variables } from "@/types";
import { jwt } from "hono/jwt";
import { env } from "@/config/env";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/config/constants";
import { isAuthenticated } from "@/middleware/auth";
import { zValidator } from "@hono/zod-validator";
import {
  createGroupSchema,
  groupNearByParamSchema,
  groupParamSchema,
  groupSlugSchema,
  updateGroupSchema,
} from "./schema";
import { generateSlug, paginate, reverseGeocodingAPI } from "@/lib/utils";
import { prisma, Prisma } from "@/lib/prisma";
import { geoLocationSchema, paginationSchema } from "@/schema";

const app = new Hono<{ Variables: Variables }>();

app.post(
  "/",
  zValidator("json", createGroupSchema),
  jwt({
    secret: env.JWT_ACEESS_TOKEN_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  async (c) => {
    const body = c.req.valid("json");
    const locationResp = await reverseGeocodingAPI(
      body.location[0],
      body.location[1]
    );
    const { timezone, lat, lon, ...rest } =
      geoLocationSchema.parse(locationResp);

    let location = await prisma.location.findFirst({
      where: {
        lat: new Prisma.Decimal(lat),
        lon: new Prisma.Decimal(lon),
      },
    });

    if (!location) {
      location = await prisma.location.create({
        data: {
          ...rest,
          lat: new Prisma.Decimal(lat),
          lon: new Prisma.Decimal(lon),
          timezone: timezone.name,
        },
      });
    }

    const currentUser = c.get("user");
    const slug = generateSlug(body.name);

    let network = await prisma.network.findUnique({
      where: {
        userId: currentUser.id,
      },
    });

    if (!network) {
      network = await prisma.network.create({
        data: {
          name: `${currentUser.name}'s Network`,
          userId: currentUser.id,
        },
      });
    }
    const group = await prisma.group.create({
      data: {
        name: body.name,
        description: body.description,
        locationId: location.id,
        slug,
        topics: {
          connect: body.topics.map((topicId) => ({
            id: topicId,
          })),
        },
        adminId: currentUser.id,
        networkId: network?.id,
        categoryId: body.categoryId,
      },
    });

    return c.json(
      {
        success: true,
        message: "Group created successfully",
        data: {
          group,
        },
      },
      201
    );
  }
);
app.get(
  "/",
  zValidator("query", paginationSchema),
  jwt({
    secret: env.JWT_ACEESS_TOKEN_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  async (c) => {
    const query = c.req.valid("query");
    const totalCount = await prisma.group.count();
    const totalPages = Math.ceil(totalCount / query.pageSize);

    const [take, skip] = paginate(query.page, query.pageSize);
    const groups = await prisma.group.findMany({
      take,
      skip,
      include: {
        _count: {
          select: {
            members: true,
            events: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        topics: {
          select: {
            id: true,
            name: true,
          },
        },
        network: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            city: true,
            state: true,
            country: true,
          },
        },
      },
    });

    return c.json({
      success: true,
      message: "Fetch groups",
      data: { groups },
      meta: {
        totalCount,
        totalPages,
        page: query.page,
        pageSize: query.pageSize,
      },
    });
  }
);

app.get("/popular-groups", async (c) => {
  const groups = await prisma.group.findMany({
    take: 4,
    include: {
      _count: {
        select: {
          members: true,
        },
      },
      admin: {
        select: {
          id: true,
          name: true,
        },
      },
      topics: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      location: {
        select: {
          city: true,
          state: true,
          country: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      members: {
        _count: "desc",
      },
    },
  });

  return c.json({
    success: true,
    message: "Fetch popular groups",
    data: { groups },
  });
});

app.get("/discover-groups", async (c) => {
  const groups = await prisma.group.findMany({
    include: {
      _count: {
        select: {
          members: true,
        },
      },
      admin: {
        select: {
          id: true,
          name: true,
        },
      },
      topics: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      location: {
        select: {
          city: true,
          state: true,
          country: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      members: {
        _count: "desc",
      },
    },
  });

  return c.json({
    success: true,
    message: "Discover groups",
    data: { groups },
  });
});

app.get(
  "/near-by/:lat/:lon",
  zValidator("param", groupNearByParamSchema),
  async (c) => {
    const param = c.req.valid("param");
    const locationResp = await reverseGeocodingAPI(param.lat, param.lon);
    const { city, country } = geoLocationSchema.parse(locationResp);

    const groups = await prisma.group.findMany({
      where: {
        location: {
          city,
          country,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        poster: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        members: {
          _count: "desc",
        },
      },
    });

    return c.json({
      success: true,
      message: "Near by groups",
      data: { groups },
    });
  }
);

app.get("/:slug", zValidator("param", groupSlugSchema), async (c) => {
  const param = c.req.valid("param");
  const group = await prisma.group.findUnique({
    where: {
      slug: param.slug,
    },
    include: {
      _count: {
        select: {
          members: true,
          events: true,
        },
      },
      admin: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
        },
      },
      topics: {
        select: {
          slug: true,
          id: true,
          name: true,
        },
      },
      location: {
        select: {
          id: true,
          city: true,
          state: true,
          country: true,
        },
      },
    },
  });

  return c.json({
    success: true,
    message: "Fetch group by slug",
    data: { group },
  });
});

app.get("/:slug/details", zValidator("param", groupSlugSchema), async (c) => {
  const param = c.req.valid("param");
  const group = await prisma.group.findUnique({
    where: {
      slug: param.slug,
    },
    select: {
      description: true,
    },
  });

  return c.json({
    success: true,
    message: "Fetch group by slug",
    data: { group },
  });
});

app.patch(
  "/:groupId",
  zValidator("param", groupParamSchema),
  zValidator("json", updateGroupSchema),
  jwt({
    secret: env.JWT_ACEESS_TOKEN_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  async (c) => {
    const body = c.req.valid("json");
    const param = c.req.valid("param");

    await prisma.group.update({
      where: {
        id: param.groupId,
      },
      data: body,
    });
    return c.json({
      success: true,
      message: "Updated group!",
    });
  }
);

export default app;
