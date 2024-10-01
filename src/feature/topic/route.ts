import { Hono } from "hono";
import { Variables } from "@/types";
import { jwt } from "hono/jwt";
import { env } from "@/config/env";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/config/constants";
import { isAdmin, isAuthenticated } from "@/middleware/auth";
import { zValidator } from "@hono/zod-validator";
import {
  topicBodySchema,
  topicParamSchema,
  topicSearchSchema,
  topicSlugParamSchema,
} from "./schema";
import { prisma } from "@/lib/prisma";
import { paginationSchema, searchSchema } from "@/schema";
import { generateSlug, paginate } from "@/lib/utils";

const app = new Hono<{ Variables: Variables }>();

app.post(
  "/",
  zValidator("json", topicBodySchema),
  jwt({
    secret: env.JWT_ACEESS_TOKEN_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  isAdmin,
  async (c) => {
    const body = c.req.valid("json");
    const slug = generateSlug(body.name);
    const topic = await prisma.topic.create({
      data: {
        ...body,
        slug,
      },
    });
    return c.json(
      {
        success: true,
        message: "Topic created successfully",
        data: {
          topic,
        },
      },
      201
    );
  }
);

app.get("/", zValidator("query", paginationSchema), async (c) => {
  const query = c.req.valid("query");
  const [take, skip] = paginate(query.page, query.pageSize);
  const totalCount = await prisma.topic.count();
  const totalPages = Math.ceil(totalCount / query.pageSize);
  const topics = await prisma.topic.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          groups: true,
          events: true,
          followedByUsers: true,
        },
      },
      category: true,
    },
    take,
    skip,
  });

  return c.json({
    success: true,
    message: "Fetch topics",
    data: {
      topics,
      meta: {
        totalCount,
        totalPages,
        page: query.page,
        pageSize: query.pageSize,
      },
    },
  });
});

app.delete(
  "/:topicId",
  zValidator("param", topicParamSchema),
  jwt({
    secret: env.JWT_ACEESS_TOKEN_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  isAdmin,
  async (c) => {
    const param = c.req.valid("param");
    await prisma.topic.delete({
      where: {
        id: param.topicId,
      },
    });
    return c.json(
      {
        success: true,
        message: "Topic deleted successfully",
      },
      201
    );
  }
);

app.patch(
  "/:topicId",
  zValidator("param", topicParamSchema),
  zValidator("json", topicBodySchema),
  jwt({
    secret: env.JWT_ACEESS_TOKEN_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  isAdmin,
  async (c) => {
    const param = c.req.valid("param");
    const body = c.req.valid("json");

    await prisma.topic.update({
      where: {
        id: param.topicId,
      },
      data: body,
    });
    return c.json(
      {
        success: true,
        message: "Topic updated successfully",
      },
      201
    );
  }
);

app.get(
  "/topics-options",
  zValidator("query", searchSchema),
  zValidator("query", topicSearchSchema),
  async (c) => {
    const query = c.req.valid("query");

    const topics = await prisma.topic.findMany({
      where: {
        ...(query.q ? { name: { contains: query.q } } : {}),
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      },

      select: {
        id: true,
        name: true,
      },
    });

    return c.json({
      success: true,
      message: "Fetch topics for options",
      data: {
        topics,
      },
    });
  }
);

app.get("/:slug", zValidator("param", topicSlugParamSchema), async (c) => {
  const param = c.req.valid("param");
  const topic = await prisma.topic.findUnique({
    where: {
      slug: param.slug,
    },
    include: {
      _count: {
        select: {
          events: true,
          groups: true,
          followedByUsers: true,
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
  });
  return c.json({
    success: true,
    message: "Fetch topic details using slug",
    data: {
      topic,
    },
  });
});
app.get(
  "/:slug/related-topics",
  zValidator("param", topicSlugParamSchema),
  async (c) => {
    const param = c.req.valid("param");
    const relatedTopic = await prisma.topic.findUnique({
      where: {
        slug: param.slug,
      },
      select: {
        id: true,
        category: {
          select: {
            id: true,
          },
        },
      },
    });

    const topics = await prisma.topic.findMany({
      where: {
        categoryId: relatedTopic?.category.id,
        NOT: {
          id: relatedTopic?.id,
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    return c.json({
      success: true,
      message: "Fetch related topics",
      data: {
        topics,
      },
    });
  }
);

app.get(
  "/:slug/largest-groups",
  zValidator("param", topicSlugParamSchema),
  async (c) => {
    const param = c.req.valid("param");

    const groups = await prisma.group.findMany({
      where: {
        topics: {
          some: {
            slug: param.slug,
          },
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        _count: {
          select: {
            members: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        location: {
          select: {
            city: true,
            country: true,
          },
        },
      },
    });

    return c.json({
      success: true,
      message: "Fetch largest groups of this topics",
      data: {
        groups,
      },
    });
  }
);

app.get(
  "/:slug/near-by",
  zValidator("param", topicSlugParamSchema),
  async (c) => {
    const param = c.req.valid("param");
    // const locationResp = await reverseGeocodingAPI(query.lat, query.lon);
    const groups = await prisma.group.findMany({
      where: {
        topics: {
          some: {
            slug: param.slug,
          },
        },
        // location:
        //   locationResp?.city && locationResp?.country
        //     ? {
        //         city: locationResp?.city,
        //         country: locationResp?.country,
        //       }
        //     : undefined,
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
      take: 4,
    });

    return c.json({
      success: true,
      message: "Near by groups",
      data: { groups },
    });
  }
);
app.get(
  "/:slug/newest-groups",
  zValidator("param", topicSlugParamSchema),
  async (c) => {
    const param = c.req.valid("param");
    // const locationResp = await reverseGeocodingAPI(query.lat, query.lon);
    const groups = await prisma.group.findMany({
      where: {
        topics: {
          some: {
            slug: param.slug,
          },
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
        createdAt: "desc",
      },
      take: 6,
    });

    return c.json({
      success: true,
      message: "Near by groups",
      data: { groups },
    });
  }
);
export default app;
