import "server-only";
import { z } from "zod";
const aiEnvSchema = z.object({
  OPENAI_API_KEY: z.string().trim().min(1),
  OPENAI_MODEL: z.string().trim().min(1),
});
/** Parse only when an AI service is invoked; Phase 0 builds without credentials. */
export function readAiEnvironment() {
  const result = aiEnvSchema.safeParse({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
  });
  if (!result.success) throw new Error("AI_NOT_CONFIGURED");
  return result.data;
}
