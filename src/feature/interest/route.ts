import { Hono } from "hono";
import { Variables } from "@/types";
import { jwt } from "hono/jwt";
import { env } from "../../config/env";
import { ACCESS_TOKEN_COOKIE_NAME } from "../../config/constants";
import { isAuthenticated } from "../../middleware/auth";
import { prisma, Prisma } from "../../lib/prisma";
import { HTTPException } from "hono/http-exception";
import { interestSchema } from "./schema";
import { zValidator } from "@hono/zod-validator";

const app = new Hono<{ Variables: Variables }>();


app.post('/follow', jwt({
    secret: env.JWT_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
}),
    zValidator("json", interestSchema),
    isAuthenticated,
    async (c) => {

        const body = c.req.valid("json");
        const currentUser = c.get("user");


        try {
            const topic = await prisma.topic.findUnique({
                where: {
                    id: body.topicId
                }
            })

            if (!topic) {
                throw new HTTPException(400, { message: "Topic not Found" });
            }

            const updatedUser = await prisma.user.update({
                where: {
                    id: currentUser.id
                },
                data: {
                    followingTopics: {
                        connect: { id: body.topicId }
                    }
                }
            })

            await prisma.topic.update({
                where: {
                    id: body.topicId,
                },
                data: {
                    followedByUsers: {
                        connect: { id: currentUser.id }
                    }
                }
            })

            return c.json({
                success: true,
                message: "User is following this topic",
                data: {
                    updatedUser
                }
            })


        }
        catch (err) {
            console.log(err);
            throw new HTTPException(400, { message: "Failed to follow topic" })
        }
    }
)

app.post('/unfollow', jwt({
    secret: env.JWT_SECRET,
    cookie: ACCESS_TOKEN_COOKIE_NAME,
}),
    zValidator("json", interestSchema),
    isAuthenticated,
    async (c) => {
        const body = c.req.valid("json");
        const currentUser = c.get("user");

        try {
            const topic = await prisma.topic.findUnique({
                where: {
                    id: body.topicId
                }
            })

            if (!topic) {
                throw new HTTPException(400, { message: "Topic not Found" });
            }

            const updatedUser = await prisma.user.update({
                where: {
                    id: currentUser.id
                },
                data: {
                    followingTopics: {
                        disconnect: { id: body.topicId }
                    }
                }
            })

            await prisma.topic.update({
                where: {
                    id: body.topicId,
                },
                data: {
                    followedByUsers: {
                        disconnect: { id: currentUser.id }
                    }
                }
            })

            return c.json({
                success: true,
                message: "User has unfollowed this topic",
                data: {
                    updatedUser
                }
            })

        }
        catch (err) {
            console.log(err);
            throw new HTTPException(400, { message: "Failed to unfollow topic" })
        }
    }

)
export default app;