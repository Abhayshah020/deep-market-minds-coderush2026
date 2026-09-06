export const ALLOWED_MODELS = [
  "qwen3:4b",
  "qwen3:8b",
] as const;

export type QwenModel = (typeof ALLOWED_MODELS)[number];

export interface ChatRequest {
  model: QwenModel;
  thinking: boolean;
  message: string;
}