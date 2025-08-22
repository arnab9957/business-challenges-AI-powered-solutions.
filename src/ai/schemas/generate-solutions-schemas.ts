/**
 * @fileOverview Schemas and types for the generate-solutions flow.
 * 
 * - GenerateSolutionsInputSchema - Zod schema for the input of the generateSolutions flow.
 * - GenerateSolutionsInput - The TypeScript type for the input.
 * - GenerateSolutionsOutputSchema - Zod schema for the output of the generateSolutions flow.
 * - GenerateSolutionsOutput - The TypeScript type for the output.
 */

import {z} from 'genkit';

export const GenerateSolutionsInputSchema = z.object({
  businessContext: z.string().describe('General context about the business.'),
  commonProblems: z.array(z.string()).describe('A list of common problems selected by the user.'),
  customProblem: z.string().describe('A custom problem description provided by the user.'),
});
export type GenerateSolutionsInput = z.infer<typeof GenerateSolutionsInputSchema>;

const SolutionSchema = z.object({
  heading: z.string().describe('A short, catchy heading for the solution.'),
  description: z.string().describe('The detailed, actionable solution.'),
});

export const GenerateSolutionsOutputSchema = z.object({
  solutions: z.array(SolutionSchema).describe('A list of actionable solutions to the business problems, each with a heading and description.'),
  kpis: z.array(z.string()).describe('A list of key performance indicators (KPIs) to track the success of the solutions.'),
});
export type GenerateSolutionsOutput = z.infer<typeof GenerateSolutionsOutputSchema>;
