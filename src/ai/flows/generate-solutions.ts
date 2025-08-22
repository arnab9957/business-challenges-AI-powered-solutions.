'use server';
/**
 * @fileOverview A flow for generating business solutions based on user-provided problems.
 * 
 * - generateSolutions - A function that generates solutions and KPIs.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  GenerateSolutionsInputSchema,
  type GenerateSolutionsInput,
  GenerateSolutionsOutputSchema,
  type GenerateSolutionsOutput,
} from '@/ai/schemas/generate-solutions-schemas';
import { retrieveFeedbackForAnalysis } from './process-feedback';

export async function generateSolutions(input: GenerateSolutionsInput): Promise<GenerateSolutionsOutput> {
  return generateSolutionsFlow(input);
}

const solutionsPrompt = ai.definePrompt({
      name: 'generateSolutionsPrompt',
      input: {schema: z.object({
        businessContext: z.string(),
        commonProblems: z.array(z.string()),
        customProblem: z.string(),
        helpfulExamples: z.any(),
        notHelpfulExamples: z.any(),
      })},
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

Based on all the information provided, generate a list of 3 to 5 specific, actionable solutions to address the stated problems. For each solution, provide a short, catchy heading and a detailed description. For each solution, also provide a corresponding Key Performance Indicator (KPI) to measure its success.

Focus on providing practical, realistic, and impactful advice tailored for SMEs.

---
**LEARNING FROM PAST FEEDBACK:**
You should learn from past examples of good and bad solutions based on user feedback.

{{#if helpfulExamples.length}}
**Examples of HELPFUL solutions (DO MORE OF THIS):**
{{#each helpfulExamples}}
- **Problem:** {{this.input.customProblem}}
  - **Solution:** {{this.output}}
{{/each}}
{{/if}}

{{#if notHelpfulExamples.length}}
**Examples of NOT HELPFUL solutions (AVOID THIS):**
{{#each notHelpfulExamples}}
- **Problem:** {{this.input.customProblem}}
  - **Solution:** {{this.output}}
  - **Reasoning:** These were considered not helpful. Try to provide more specific, actionable, and creative advice. Avoid generic or obvious suggestions.
{{/each}}
{{/if}}
---

Example Output:
{
  "solutions": [
    {
      "heading": "Boost Repeat Business",
      "description": "Develop a customer loyalty program with points and rewards to encourage repeat purchases."
    },
    {
      "heading": "Targeted Social Media Ads",
      "description": "Launch a targeted social media advertising campaign focusing on the 25-35 age demographic."
    }
  ],
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
  async (input) => {
    const pastFeedback = await retrieveFeedbackForAnalysis();
    
    const helpfulExamples = pastFeedback.filter(f => f.feedback === 'helpful');
    const notHelpfulExamples = pastFeedback.filter(f => f.feedback === 'not_helpful');
    
    const {output} = await solutionsPrompt({ ...input, helpfulExamples, notHelpfulExamples });
    return output!;
  }
);
