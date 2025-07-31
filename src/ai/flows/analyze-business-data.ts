// The analyzeBusinessData AI agent.
//
// - analyzeBusinessData - A function that handles the business data analysis process.
// - AnalyzeBusinessDataInput - The input type for the analyzeBusinessData function.
// - AnalyzeBusinessDataOutput - The return type for the analyzeBusinessData function.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeBusinessDataInputSchema = z.object({
  businessData: z.string().describe('The business data to analyze.'),
  analysisType: z.enum(['SWOT', 'PESTLE', 'Porter\u0027s Five Forces']).describe('The type of analysis to perform.'),
});
export type AnalyzeBusinessDataInput = z.infer<typeof AnalyzeBusinessDataInputSchema>;

const AnalyzeBusinessDataOutputSchema = z.object({
  analysisResult: z.string().describe('The analysis result.'),
});
export type AnalyzeBusinessDataOutput = z.infer<typeof AnalyzeBusinessDataOutputSchema>;

export async function analyzeBusinessData(input: AnalyzeBusinessDataInput): Promise<AnalyzeBusinessDataOutput> {
  return analyzeBusinessDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeBusinessDataPrompt',
  input: {schema: AnalyzeBusinessDataInputSchema},
  output: {schema: AnalyzeBusinessDataOutputSchema},
  prompt: `You are an expert business analyst. You will analyze the provided business data using the specified framework.

Framework: {{{analysisType}}}

Business Data: {{{businessData}}}

Analyze the business data using the {{analysisType}} framework and provide a detailed analysis.`,
});

const analyzeBusinessDataFlow = ai.defineFlow(
  {
    name: 'analyzeBusinessDataFlow',
    inputSchema: AnalyzeBusinessDataInputSchema,
    outputSchema: AnalyzeBusinessDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
