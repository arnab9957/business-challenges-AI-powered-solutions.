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
  description: z.array(z.string()).describe('The detailed, actionable solution, broken down into a list of bullet points.'),
});

const GraphDataSchema = z.object({
    name: z.string().describe('The name of the solution. Should match one of the solution headings.'),
    revenueGrowth: z.number().min(0).max(100).describe('A score from 0-100 representing the potential impact on revenue growth.'),
    costReduction: z.number().min(0).max(100).describe('A score from 0-100 representing the potential impact on cost reduction.'),
    customerSatisfaction: z.number().min(0).max(100).describe('A score from 0-100 representing the potential impact on customer satisfaction.'),
});


export const GenerateSolutionsOutputSchema = z.object({
  solutions: z.array(SolutionSchema).describe('A list of actionable solutions to the business problems, each with a heading and description.'),
  kpis: z.array(z.string()).describe('A list of key performance indicators (KPIs) to track the success of the solutions.'),
  graphData: z.array(GraphDataSchema).describe('Data for visualizing the potential impact of each solution across key business areas.')
});
export type GenerateSolutionsOutput = z.infer<typeof GenerateSolutionsOutputSchema>;
