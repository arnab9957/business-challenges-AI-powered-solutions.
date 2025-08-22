/**
 * @fileOverview Schemas and types for the process-feedback flow.
 * 
 * - ProcessFeedbackInputSchema - Zod schema for the input of the processFeedback flow.
 * - ProcessFeedbackInput - The TypeScript type for the input.
 */

import {z} from 'genkit';
import { GenerateSolutionsInputSchema, GenerateSolutionsOutputSchema } from './generate-solutions-schemas';

export const ProcessFeedbackInputSchema = z.object({
  input: GenerateSolutionsInputSchema.describe("The original input that generated the solution."),
  output: GenerateSolutionsOutputSchema.describe("The solution that was generated."),
  feedback: z.enum(['helpful', 'not_helpful']).describe("The user's rating of the solution."),
});
export type ProcessFeedbackInput = z.infer<typeof ProcessFeedbackInputSchema>;
