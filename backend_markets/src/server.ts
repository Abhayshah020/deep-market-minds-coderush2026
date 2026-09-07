import "dotenv/config";

import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";

import { connectDatabase } from "./config/database.js";

import { chatRoute } from "./routes/chat.route.js";
import { authRoute } from "./routes/auth.route.js";

import "./models/user.model.js";

const app = Fastify({
    logger: true,
});

async function start() {
    try {
        await connectDatabase();

        await app.register(cookie);

        await app.register(cors, {
            origin: [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3001",
            ],
            credentials: true,
        });

        await app.register(authRoute);
        await app.register(chatRoute);

        app.get("/health", async () => {
            return {
                status: "ok",
                service: "ai-service",
            };
        });

        const port =
            Number(process.env.PORT) || 3003;

        await app.listen({
            port,
            host: "127.0.0.1",
        });

        console.log(
            `AI service running at http://127.0.0.1:${port}`,
        );
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
}

start();