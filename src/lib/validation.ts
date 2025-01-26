import { z } from 'zod' // You'll need to install zod: npm install zod
import { validateWithGemini } from './geminiValidation'

// User input validation schema
export const userInputSchema = z.object({
  jobDescription: z.string().min(1, "Job description cannot be empty"),
  interviewType: z.enum([
    "software_engineering",
    "data_science",
    "product_management",
    "finance",
    "hr",
    "marketing",
    "operations",
    "sales"
  ]),
  temperature: z.number().min(0).max(1),
  maxOutputTokens: z.number().min(100).max(2000),
  topP: z.number().min(0).max(1),
  topK: z.number().min(1).max(100),
  systemPrompt: z.string().optional()
}).superRefine(async (data, ctx) => {
  if (!data.jobDescription.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Job description cannot be empty",
      path: ['jobDescription']
    });
    return;
  }

  try {
    const validation = await validateWithGemini(data.jobDescription, data.interviewType);
    if (!validation.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.reason,
        path: ['jobDescription']
      });
    }
  } catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: error instanceof Error ? error.message : 'Validation failed',
      path: ['jobDescription']
    });
  }
});

// System prompt validation schema
export const systemPromptSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z
    .string()
    .min(1)
    .max(4000)
    .regex(/^[a-zA-Z0-9\s.,!?()&+\-'":;\/\[\]{}#@$%^*_=|~`<>]+$/i, "Invalid characters in prompt"),
});

// Validation function
export async function validateUserInput(input: unknown) {
  try {
    return await userInputSchema.safeParseAsync(input);
  } catch (error) {
    console.error('Validation error:', error);
    throw error;
  }
}

export function validateSystemPrompt(prompt: unknown) {
  return systemPromptSchema.safeParse(prompt);
} 