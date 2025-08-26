
'use server';
/**
 * @fileOverview A flow for having a conversation about a generated solution.
 * 
 * - chatWithSolution - A function that continues the conversation.
 * - ChatMessage - The type for a single chat message.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  ChatInputSchema,
  type ChatInput,
  ChatMessageSchema,
  type ChatMessage,
} from '@/ai/schemas/chat-schemas';
import { googleAI } from '@genkit-ai/googleai';

export { type ChatMessage };

export async function chatWithSolution(input: ChatInput): Promise<string> {
  return chatWithSolutionFlow(input);
}

const chatPrompt = ai.definePrompt({
      name: 'chatPrompt',
      model: googleAI.model('gemini-1.5-flash'),
      input: {schema: ChatInputSchema},
      output: {schema: z.string().optional()},
      prompt: `
You are an expert business consultant AI. Your role is to answer follow-up questions about the business solutions you have already provided.
You MUST NOT invent new solutions or provide information outside of the provided context.
Your answers should be concise, helpful, and directly related to the user's query and the provided solution data.

## Provided Solution Context ##
This is the action plan you have already generated. Base your answers ONLY on this information.
\`\`\`json
{{{json solutionContext}}}
\`\`\`

## Conversation History ##
{{#each history}}
- {{role}}: {{content}}
{{/each}}

## User's New Question ##
- user: {{{query}}}

## Your Task & Output Format ##
Based on the provided solution context and the conversation history, answer the user's new question.
Your response MUST be a single, raw string containing ONLY the answer.
DO NOT wrap it in JSON.
DO NOT add any other formatting.
DO NOT use markdown.
Your entire output must be only the text of your answer.
`,
    });


const chatWithSolutionFlow = ai.defineFlow(
  {
    name: 'chatWithSolutionFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const {output} = await chatPrompt(input);
    return output || "I'm sorry, I couldn't generate a response. Please try asking in a different way.";
  }
);
