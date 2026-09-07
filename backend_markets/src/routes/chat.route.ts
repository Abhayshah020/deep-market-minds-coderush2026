import type { FastifyInstance } from "fastify";
import { streamChatWithQwen } from "../services/qwen.service.js";
import {
  ALLOWED_MODELS,
  type ChatRequest,
} from "../types/chat.types.js";

export async function chatRoute(app: FastifyInstance) {
  app.post<{ Body: ChatRequest }>(
    "/api/chat",
    {
      schema: {
        body: {
          type: "object",
          required: ["model", "thinking", "message"],
          additionalProperties: false,
          properties: {
            model: {
              type: "string",
              enum: [...ALLOWED_MODELS],
            },
            thinking: {
              type: "boolean",
            },
            message: {
              type: "string",
              minLength: 1,
              maxLength: 100000,
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { model, thinking, message } = request.body;

      reply.hijack();

      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "Access-Control-Allow-Origin": "http://localhost:3000",
      });

      const sendEvent = (data: unknown) => {
        reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      sendEvent({
        type: "start",
        model,
        thinking,
      });

      try {
        await streamChatWithQwen(
          model,
          thinking,
          message,
          (token) => {
            sendEvent({
              type: "token",
              content: token,
            });
          },
        );

        sendEvent({
          type: "done",
        });

        reply.raw.end();
      } catch (error) {
        request.log.error(error);

        sendEvent({
          type: "error",
          message: "Failed to generate AI response",
        });

        reply.raw.end();
      }
    },
  );
}