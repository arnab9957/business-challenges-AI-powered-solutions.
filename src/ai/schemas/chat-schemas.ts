/**
 * @fileOverview Schemas and types for the chat-with-solution flow.
 * 
 * - ChatInputSchema - Zod schema for the input of the chatWithSolution flow.
 * - ChatInput - The TypeScript type for the input.
 * - ChatMessageSchema - Zod schema for a single chat message.
 * - ChatMessage - The TypeScript type for a single chat message.
 */

import {z} from 'zod';
import { GenerateSolutionsOutputSchema } from './generate-solutions-schemas';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatInputSchema = z.object({
  solutionContext: GenerateSolutionsOutputSchema.describe("The full solution output that was originally generated."),
  history: z.array(ChatMessageSchema).describe("The history of the conversation so far."),
  query: z.string().describe("The user's latest question."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;
