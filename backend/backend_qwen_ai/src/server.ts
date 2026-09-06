import Fastify from "fastify";
import cors from "@fastify/cors";
import { chatRoute } from "./routes/chat.route.js";

const app = Fastify({
    logger: true,
});

async function start() {
    try {
        await app.register(cors, {
            origin: [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
            ],
        });

        await app.register(chatRoute);

        app.get("/health", async () => {
            return {
                status: "ok",
                service: "ai-service",
            };
        });

        await app.listen({
            port: 3001,
            host: "127.0.0.1",
        });

        console.log("AI service running at http://127.0.0.1:3001");
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
}

start();