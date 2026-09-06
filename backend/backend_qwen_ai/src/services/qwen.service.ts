import type { QwenModel } from "../types/chat.types.js";

const OLLAMA_URL = "http://127.0.0.1:11434";

interface OllamaStreamChunk {
  message?: {
    role?: string;
    content?: string;
  };
  done?: boolean;
}

export async function streamChatWithQwen(
  model: QwenModel,
  thinking: boolean,
  message: string,
  onToken: (token: string) => void,
): Promise<void> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      think: thinking,
      stream: true,

      // Keep the model loaded for a while so repeated
      // requests don't constantly reload it.
      keep_alive: "10m",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Ollama request failed (${response.status}): ${errorText}`,
    );
  }

  if (!response.body) {
    throw new Error("Ollama returned an empty response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, {
      stream: true,
    });

    const lines = buffer.split("\n");

    // Keep incomplete line for the next chunk.
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const chunk = JSON.parse(line) as OllamaStreamChunk;

      const token = chunk.message?.content;

      if (token) {
        onToken(token);
      }
    }
  }

  // Process anything remaining in the buffer.
  if (buffer.trim()) {
    const chunk = JSON.parse(buffer) as OllamaStreamChunk;

    const token = chunk.message?.content;

    if (token) {
      onToken(token);
    }
  }
}