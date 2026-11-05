import { z } from "zod";

const copy = z.object({
  headline: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(8_000),
  bullets: z.array(z.string().trim().min(1).max(350)).max(15),
  cta: z.string().trim().min(1).max(350),
}).strict();

const outputs = {
  listing: z.object({ emotional: copy, investor: copy, formal: copy }).strict(),
  followup: z.object({
    whatsapp: z.string().trim().min(1).max(8_000),
    email: z.string().trim().min(1).max(8_000),
  }).strict(),
  assistant: z.object({ response: z.string().trim().min(1).max(12_000) }).strict(),
  content: z.object({ text: z.string().trim().min(1).max(12_000) }).strict(),
  "flyer-copy": z.object({ text: z.string().trim().min(1).max(12_000) }).strict(),
} as const;

export function validateAiOutput(task: keyof typeof outputs, data: unknown): unknown | null {
  const schema = outputs[task];
  const parsed = schema.safeParse(data);
  return parsed.success ? parsed.data : null;
}
