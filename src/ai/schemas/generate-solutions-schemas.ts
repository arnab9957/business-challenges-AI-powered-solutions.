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
  industry: z.string().describe("The industry the business operates in."),
  businessContext: z.string().describe('General context about the business.'),
  commonProblems: z.array(z.string()).describe('A list of common problems selected by the user.'),
  customProblem: z.string().describe('A custom problem description provided by the user.'),
});
export type GenerateSolutionsInput = z.infer<typeof GenerateSolutionsInputSchema>;

const SolutionSchema = z.object({
  heading: z.string().describe('A short, catchy heading for the solution.'),
  description: z.array(z.string()).describe('The detailed, actionable solution, broken down into a list of bullet points.'),
  implementationCost: z.enum(["Low", "Medium", "High"]).describe("The estimated financial cost to implement the solution."),
  timeToValue: z.enum(["Quick (0-3 Months)", "Medium (3-9 Months)", "Long (9+ Months)"]).describe("The estimated time to see a significant return on investment or value from the solution."),
  requiredResources: z.array(z.string()).describe("A list of key resources required to implement the solution (e.g., '1-2 Marketing Staff', 'Data Analytics Software', 'External Consultant').")
});

const ImpactAnalysisSchema = z.object({
    name: z.string().describe("The name of the solution. Should match one of the solution headings."),
    projectedImpact: z.number().min(0).max(100).describe("The AI's best estimate of the overall potential impact of the solution (0-100)."),
    confidenceInterval: z.array(z.number()).length(2).describe("An array representing the confidence interval [worstCase, bestCase] for the projected impact."),
    stakeholderValueDistribution: z.object({
        Customers: z.number().describe("Value score for Customers."),
        Business: z.number().describe("Value score for the Business."),
        Employees: z.number().describe("Value score for Employees."),
        Community: z.number().describe("Value score for the Community."),
    }).describe("A breakdown of how the generated value is distributed among key stakeholders.")
});


export const GenerateSolutionsOutputSchema = z.object({
  solutions: z.array(SolutionSchema).describe('A list of actionable solutions to the business problems, each with a heading and description.'),
  kpis: z.array(z.string()).describe('A list of key performance indicators (KPIs) to track the success of the solutions.'),
  impactAnalysis: z.array(ImpactAnalysisSchema).describe('Data for visualizing the potential impact of each solution across key business areas.'),
  dataNarrative: z.string().describe("A short, compelling story that explains the 'why' behind the data for the primary solution, guiding the user through their potential transformation journey.")
});
export type GenerateSolutionsOutput = z.infer<typeof GenerateSolutionsOutputSchema>;
