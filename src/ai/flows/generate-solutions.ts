
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
import { getContextualData } from '../tools/context-tools';

export async function generateSolutions(input: GenerateSolutionsInput): Promise<GenerateSolutionsOutput> {
  return generateSolutionsFlow(input);
}

const solutionsPrompt = ai.definePrompt({
      name: 'generateSolutionsPrompt',
      tools: [getContextualData],
      input: {schema: GenerateSolutionsInputSchema.extend({
        helpfulExamples: z.any(),
        notHelpfulExamples: z.any(),
      })},
      output: {schema: GenerateSolutionsOutputSchema},
      prompt: `
      You are an elite innovation strategist and disruptive business consultant specializing in transformational solutions for Small and Medium-sized Enterprises (SMEs). Your mission is to deliver breakthrough, paradigm-shifting strategies that transcend conventional business wisdom and unlock unprecedented growth opportunities.

      Business Context:
      - Industry: {{{industry}}}
      - Business Description: {{{businessContext}}}
      
      {{#if commonProblems.length}}
      Identified Challenge Patterns:
      {{#each commonProblems}}
      - {{this}}
      {{/each}}
      {{/if}}
      
      Core Business Challenge:
      {{{customProblem}}}

      ### INSTRUCTIONS
      1.  **Contextual Analysis (Use Tools):** First, call the \`getContextualData\` tool. Use the user's industry to get relevant market trends and the current economic outlook.
      2.  **Synthesize & Strategize:** Integrate the tool's output with the user's provided business context and challenges.
      3.  **Generate Solutions:** Based on your synthesis, generate 3-5 innovative, "out-of-the-box" solutions. These must be highly tailored and consider the timing and external market factors returned by the tool.

      ### 1. Ecosystem-Powered Solutions (3-5 innovative strategies)
      
      For each solution, provide:
      
      - Transformational Heading: A compelling, vision-driven title that challenges industry norms
      - Strategic Blueprint: 4-6 specific, unconventional action points incorporating:
        - Platform Thinking: Transform from product-seller to ecosystem orchestrator
        - Reverse Innovation: Apply emerging market frugal innovation principles to create breakthrough value
        - Biomimicry Business Models: Leverage nature-inspired efficiency and resilience patterns
        - Circular Economy Integration: Design regenerative business loops that eliminate waste and create continuous value
        - Complexity Theory Applications: Embrace controlled chaos and self-organizing systems for adaptive advantage
        - Cross-Industry Symbiosis: Create unexpected partnerships that redefine value chains

      ### 2. Next-Generation KPIs for Transformational Success
      
      Develop measurement frameworks that capture:
      
      - Ecosystem Vitality Metrics: Network effects, partnership value creation, platform engagement
      - Innovation Velocity Indicators: Speed of adaptation, experimental learning rate, market disruption potential
      - Regenerative Impact Scores: Circular value creation, waste elimination efficiency, sustainability ROI
      - Complexity Navigation Metrics: Adaptive capacity, resilience under uncertainty, emergent opportunity capture
      - Cross-Pollination Effectiveness: Inter-industry knowledge transfer, symbiotic relationship strength

      ### 3. Impact Visualization Data
      
      For each solution, provide estimated transformation potential (0-100) across:
      
      - Revenue Multiplication: Exponential growth through network effects and ecosystem expansion
      - Operational Evolution: Fundamental efficiency gains through nature-inspired and complexity-based optimization
      - Stakeholder Ecosystem Value: Holistic satisfaction across all ecosystem participants (customers, partners, community, environment)
      
      Note: The 'name' field must exactly match the solution's transformational heading.

      Your solutions should inspire SME leaders to reimagine their role from industry participants to ecosystem architects, creating self-reinforcing systems of value that continuously evolve and adapt to changing conditions.
      
      Generate responses that are simultaneously visionary yet practical, disruptive yet implementable, and innovative yet grounded in proven transformation principles.

---
**PREDICTIVE ANALYSIS FROM HISTORICAL FEEDBACK:**
Your primary directive is to use historical data to predict which solutions will be most effective. Analyze the provided examples of past user feedback. Identify patterns correlating business problems to successful (helpful) and unsuccessful (not helpful) solutions. Prioritize and generate solutions that have the highest probability of success based on this historical analysis.

{{#if helpfulExamples.length}}
**Historical Data: HELPFUL solutions (High Success Probability - DO MORE OF THIS):**
These are solutions that users found valuable for similar problems.
{{#each helpfulExamples}}
- **Problem:** {{this.input.customProblem}}
  - **Solution:** {{this.output}}
{{/each}}
{{/if}}

{{#if notHelpfulExamples.length}}
**Historical Data: NOT HELPFUL solutions (Low Success Probability - AVOID THIS):**
These are solutions that users rejected. Analyze why they were not helpful and generate different, more innovative strategies. Avoid generic or obvious suggestions.
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
