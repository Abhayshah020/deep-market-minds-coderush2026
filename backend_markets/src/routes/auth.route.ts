import type { FastifyInstance } from "fastify";
import { z } from "zod";

import {
    loginUser,
    registerUser,
} from "../services/auth.service.js";

const registerSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3)
        .max(50),

    email: z
        .string()
        .trim()
        .email()
        .max(255),

    password: z
        .string()
        .min(8)
        .max(128),
});

const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email()
        .max(255),

    password: z
        .string()
        .min(1)
        .max(128),
});

const COOKIE_NAME = "auth_token";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
};

export async function authRoute(
    app: FastifyInstance,
) {
    /*
     * REGISTER
     */
    app.post(
        "/api/auth/register",
        async (request, reply) => {
            const result =
                registerSchema.safeParse(
                    request.body,
                );

            if (!result.success) {
                return reply.status(400).send({
                    error: "Invalid request",
                    details: result.error.issues,
                });
            }

            try {
                const authResponse =
                    await registerUser(
                        result.data,
                    );

                /*
                 * Set JWT as HTTP-only cookie.
                 */
                reply.setCookie(
                    COOKIE_NAME,
                    authResponse.token,
                    COOKIE_OPTIONS,
                );

                return reply.status(201).send({
                    user: authResponse.user,
                });
            } catch (error) {
                request.log.error(error);

                if (
                    error instanceof Error &&
                    error.message.includes(
                        "already exists",
                    )
                ) {
                    return reply.status(409).send({
                        error: error.message,
                    });
                }

                return reply.status(500).send({
                    error: "Failed to create account",
                });
            }
        },
    );

    /*
     * LOGIN
     */
    app.post(
        "/api/auth/login",
        async (request, reply) => {
            const result =
                loginSchema.safeParse(
                    request.body,
                );

            if (!result.success) {
                return reply.status(400).send({
                    error: "Invalid request",
                    details: result.error.issues,
                });
            }

            try {
                const authResponse =
                    await loginUser(
                        result.data,
                    );

                /*
                 * Set JWT as HTTP-only cookie.
                 */
                reply.setCookie(
                    COOKIE_NAME,
                    authResponse.token,
                    COOKIE_OPTIONS,
                );

                return reply.status(200).send({
                    user: authResponse.user,
                });
            } catch (error) {
                request.log.error(error);

                if (
                    error instanceof Error &&
                    error.message ===
                        "Invalid email or password"
                ) {
                    return reply.status(401).send({
                        error:
                            "Invalid email or password",
                    });
                }

                return reply.status(500).send({
                    error: "Failed to login",
                });
            }
        },
    );

    /*
     * LOGOUT
     */
    app.post(
        "/api/auth/logout",
        async (_request, reply) => {
            reply.clearCookie(
                COOKIE_NAME,
                {
                    path: "/",
                },
            );

            return reply.status(200).send({
                message:
                    "Logged out successfully",
            });
        },
    );
}