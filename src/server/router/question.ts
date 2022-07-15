import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import PusherServer from "pusher";
import { env } from "../env";

const pusherServerClient = new PusherServer({
    appId: env.NEXT_PUBLIC_PUSHER_APP_ID,
    key: env.PUSHER_APP_KEY,
    secret: env.PUSHER_APP_SECRET,
    cluster: env.PUSHER_APP_CLUSTER,
});

export const questionRouter = createRouter()
    .query("get-my-questions", {
        async resolve({ ctx }) {
            if (!ctx.session || !ctx.session.user) {
                throw new TRPCError({
                    message: "You are not signed in",
                    code: "UNAUTHORIZED",
                });
            }

            const questions = await ctx.prisma.question.findMany({
                where: {
                    userId: ctx.session.user.id,
                },
            });

            return questions;
        },
    })
    .query("get-user-metadata", {
        input: z.object({ userId: z.string() }),
        async resolve({ ctx, input }) {
            return await ctx.prisma.user.findFirst({
                where: { id: input.userId },
            });
        },
    })
    .mutation("submit-question", {
        input: z.object({
            userId: z.string(),
            question: z.string().min(1).max(255),
        }),
        async resolve({ ctx, input }) {
            const question = await ctx.prisma.question.create({
                data: {
                    userId: input.userId,
                    body: input.question,
                },
            });

            return question;
        },
    })
    .mutation("pin-question", {
        input: z.object({
            questionId: z.string(),
        }),
        async resolve({ ctx, input }) {
            console.log(input.questionId);
            if (!ctx.session || !ctx.session.user) {
                throw new TRPCError({
                    message: "You are not signed in",
                    code: "UNAUTHORIZED",
                });
            }

            const question = await ctx.prisma.question.findFirst({
                where: { id: input.questionId },
            });

            if (!question || question.userId !== ctx.session.user.id) {
                throw new TRPCError({
                    message: "Not your question",
                    code: "UNAUTHORIZED",
                });
            }

            pusherServerClient.trigger(
                `user-${question.userId}`,
                "question-pinned",
                {
                    question: question.body,
                }
            );

            return question;
        },
    });
