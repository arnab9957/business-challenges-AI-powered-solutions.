'use server';
/**
 * @fileOverview A flow for generating business solutions based on user-provided problems.
 * 
 * - generateSolutions - A function that generates solutions and KPIs.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateSolutionsInputSchema,
  type GenerateSolutionsInput,
  GenerateSolutionsOutputSchema,
  type GenerateSolutionsOutput,
} from '@/ai/schemas/generate-solutions-schemas';

export async function generateSolutions(input: GenerateSolutionsInput): Promise<GenerateSolutionsOutput> {
  return generateSolutionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSolutionsPrompt',
  input: {schema: GenerateSolutionsInputSchema},
  output: {schema: GenerateSolutionsOutputSchema},
  prompt: `You are an expert business consultant for Small and Medium-sized Enterprises (SMEs). Your goal is to provide actionable solutions and measurable KPIs for the user's business problems.

Analyze the following business information:

**Business Context:**
{{{businessContext}}}

**Common Problems Identified:**
{{#if commonProblems.length}}
<ul>
  {{#each commonProblems}}
  <li>{{this}}</li>
  {{/each}}
</ul>
{{else}}
None specified.
{{/if}}

**Main Problem Described by User:**
{{{customProblem}}}

Based on all the information provided, generate a list of 3 to 5 specific, actionable solutions to address the stated problems. For each solution, also provide a corresponding Key Performance Indicator (KPI) to measure its success.

Focus on providing practical, realistic, and impactful advice tailored for SMEs.

Example Output:
{
  "solutions": ["Develop a customer loyalty program to increase repeat business.", "Launch a targeted social media advertising campaign focusing on the 25-35 age demographic."],
  "kpis": ["Increase customer retention rate by 15% within 6 months.", "Achieve a 3:1 return on ad spend (ROAS) for the new social media campaign."]
}
`,
});

const generateSolutionsFlow = ai.defineFlow(
  {
    name: 'generateSolutionsFlow',
    inputSchema: GenerateSolutionsInputSchema,
    outputSchema: GenerateSolutionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
