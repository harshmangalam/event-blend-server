import { Hono } from "hono";
import { Variables } from "@/types";
import { zValidator } from "@hono/zod-validator";
import { paginationSchema, searchSchema } from "@/schema";
import { isAdmin, isAuthenticated } from "@/middleware/auth";
import { jwt } from "hono/jwt";
import { env } from "@/config/env";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/config/constants";
import { prisma } from "@/lib/prisma";
import { generateSlug, paginate } from "@/lib/utils";
import {
  categoryBodySchema,
  categoryParamSchema,
  categorySlugParamSchema,
} from "./schema";

const app = new Hono<{ Variables: Variables }>();

app.get(
  "/",
  zValidator("query", paginationSchema),
  jwt({
    secret: env.JWT_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  isAdmin,
  async (c) => {
    const query = c.req.valid("query");
    const totalCount = await prisma.category.count();
    const totalPages = Math.ceil(totalCount / query.pageSize);

    const [take, skip] = paginate(query.page, query.pageSize);
    const categories = await prisma.category.findMany({
      take,
      skip,
      include: {
        _count: {
          select: {
            events: true,
            groups: true,
            topics: true,
          },
        },
      },
    });

    return c.json({
      success: true,
      message: "Fetch categories",
      data: {
        categories,
        meta: {
          totalCount,
          totalPages,
          page: query.page,
          pageSize: query.pageSize,
        },
      },
    });
  }
);
app.get("/categories-options", zValidator("query", searchSchema), async (c) => {
  const query = c.req.valid("query");
  const categories = await prisma.category.findMany({
    where: query.q
      ? {
          name: {
            contains: query.q,
          },
        }
      : undefined,
    select: {
      id: true,
      name: true,
    },
  });
  return c.json({
    success: true,
    message: "fetch categories options",
    data: { categories },
  });
});

app.get("/discover-categories", async (c) => {
  const categories = await prisma.category.findMany({
    orderBy: {
      events: {
        _count: "desc",
      },
    },
    select: {
      name: true,
      topics: {
        orderBy: {
          events: {
            _count: "desc",
          },
        },
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
  });
  return c.json({
    success: true,
    message: "Discover categories",
    data: {
      categories,
    },
  });
});
app.get("/popular-categories", async (c) => {
  const categories = await prisma.category.findMany({
    take: 6,
    orderBy: {
      groups: {
        _count: "desc",
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          groups: true,
        },
      },
    },
  });
  return c.json({
    success: true,
    message: "Top categories",
    data: {
      categories,
    },
  });
});

app.get("/:slug", zValidator("param", categorySlugParamSchema), async (c) => {
  const param = c.req.valid("param");

  const category = await prisma.category.findUnique({
    where: {
      slug: param.slug,
    },
    include: {
      _count: {
        select: {
          events: true,
          groups: true,
        },
      },
      topics: true,
    },
  });
  return c.json({
    message: "Fetch category details from slug",
    success: true,
    data: {
      category,
    },
  });
});

app.get(
  "/:slug/trending-topics",
  zValidator("param", categorySlugParamSchema),
  async (c) => {
    const param = c.req.valid("param");
    const topics = await prisma.topic.findMany({
      take: 3,
      where: {
        category: {
          slug: param.slug,
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        groups: {
          take: 1,
          select: {
            poster: true,
          },
          orderBy: {
            members: {
              _count: "desc",
            },
          },
        },
      },
    });
    return c.json({
      message: "Fetch top 3 trending topics for this category",
      success: true,
      data: {
        topics,
      },
    });
  }
);

app.get(
  "/:slug/topics",
  zValidator("param", categorySlugParamSchema),
  async (c) => {
    const param = c.req.valid("param");
    const topics = await prisma.topic.findMany({
      where: {
        category: {
          slug: param.slug,
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        groups: {
          take: 1,
          select: {
            poster: true,
          },
          orderBy: {
            members: {
              _count: "desc",
            },
          },
        },
      },
    });
    return c.json({
      message: "Fetch all topics for this category",
      success: true,
      data: {
        topics,
      },
    });
  }
);

app.get(
  "/:slug/events",
  zValidator("param", categorySlugParamSchema),
  async (c) => {
    const param = c.req.valid("param");
    const events = await prisma.event.findMany({
      where: {
        category: {
          slug: param.slug,
        },
      },
      select: {
        id: true,
        name: true,
        poster: true,
        details: true,
        group: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });
    return c.json({
      message: "Fetch popular events for this category",
      success: true,
      data: {
        events,
      },
    });
  }
);

app.delete(
  "/:id",
  zValidator("param", categoryParamSchema),
  jwt({
    secret: env.JWT_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  isAdmin,
  async (c) => {
    const param = c.req.valid("param");

    await prisma.category.delete({
      where: {
        id: param.id,
      },
    });
    return c.json({
      success: true,
      message: "Category deleted successfully",
    });
  }
);
app.patch(
  "/:id",
  zValidator("json", categoryBodySchema),
  zValidator("param", categoryParamSchema),
  jwt({
    secret: env.JWT_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  isAdmin,
  async (c) => {
    const param = c.req.valid("param");
    const body = c.req.valid("json");
    const slug = body.name ? generateSlug(body.name) : undefined;
    const category = await prisma.category.update({
      where: {
        id: param.id,
      },
      data: {
        ...body,
        slug,
      },
    });
    return c.json({
      success: true,
      message: "Category updated successfully",
      data: { category },
    });
  }
);

app.post(
  "/",
  zValidator("json", categoryBodySchema),
  jwt({
    secret: env.JWT_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
  }),
  isAuthenticated,
  isAdmin,
  async (c) => {
    const body = c.req.valid("json");
    const slug = generateSlug(body.name);
    const category = await prisma.category.create({
      data: {
        ...body,
        slug,
      },
    });
    return c.json({
      success: true,
      message: "Category created successfully",
      data: { category },
    });
  }
);

export default app;
