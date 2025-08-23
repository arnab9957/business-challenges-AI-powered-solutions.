'use server';
/**
 * @fileOverview A flow for generating business solutions based on user-provided problems.
 * 
 * - generateSolutions - A function that generates solutions and KPIs.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
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
      input: {schema: GenerateSolutionsInputSchema.extend({
        helpfulExamples: z.any(),
        notHelpfulExamples: z.any(),
      })},
      output: {schema: GenerateSolutionsOutputSchema},
      prompt: `You are an expert business consultant for Small and Medium-sized Enterprises (SMEs). Your goal is to provide actionable solutions and measurable KPIs for the user's business problems.

Analyze the following business information:

**Business Context:**
{{{businessContext}}}

{{#if commonProblems.length}}
**Common Problems Identified:**
{{#each commonProblems}}
- {{this}}
{{/each}}
{{/if}}

**Main Problem Described by User:**
{{{customProblem}}}

Based on all the information provided, generate the following:

1.  **Solutions (3 to 5):** For each solution, provide:
    *   A short, catchy **heading**.
    *   A **description** broken down into a list of specific, actionable bullet points (3-5 points per solution).

2.  **Key Performance Indicators (KPIs):** A list of measurable KPIs to track the success of the proposed solutions.

3.  **Graph Data:** For each solution, provide an estimated impact score (0-100) on the following areas:
    *   **Revenue Growth:** The potential to increase revenue.
    *   **Cost Reduction:** The potential to lower operational costs.
    *   **Customer Satisfaction:** The potential to improve customer happiness and loyalty.
    The 'name' in the graph data object must exactly match the solution's 'heading'.


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
      "description": [
        "Create a tiered loyalty program with bronze, silver, and gold levels.",
        "Offer exclusive discounts and early access to new products for loyal members.",
        "Implement a points system where customers earn points for every purchase."
      ]
    },
    {
      "heading": "Targeted Social Media Ads",
      "description": [
        "Utilize Facebook's Lookalike Audiences to find new customers similar to your existing ones.",
        "Run A/B tests on ad copy and imagery to optimize for engagement.",
        "Create short-form video ads for platforms like Instagram Reels and TikTok."
      ]
    }
  ],
  "kpis": ["Increase customer retention rate by 15% within 6 months.", "Achieve a 3:1 return on ad spend (ROAS) for the new social media campaign."],
  "graphData": [
      { "name": "Boost Repeat Business", "revenueGrowth": 80, "costReduction": 20, "customerSatisfaction": 90 },
      { "name": "Targeted Social Media Ads", "revenueGrowth": 90, "costReduction": 10, "customerSatisfaction": 70 }
  ]
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
