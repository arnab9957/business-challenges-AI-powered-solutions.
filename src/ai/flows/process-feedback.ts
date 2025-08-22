'use server';
/**
 * @fileOverview A flow for processing user feedback on generated solutions.
 * 
 * - processFeedback - A function that logs user feedback for future analysis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  ProcessFeedbackInputSchema,
  type ProcessFeedbackInput,
} from '@/ai/schemas/process-feedback-schemas';

// In a real application, you would store this feedback in a database (e.g., Firestore)
// to build a dataset for fine-tuning your model or for analysis.
// For this example, we will just log it to the console.
const feedbackStore: ProcessFeedbackInput[] = [];

export async function processFeedback(input: ProcessFeedbackInput): Promise<void> {
  return processFeedbackFlow(input);
}

const processFeedbackFlow = ai.defineFlow(
  {
    name: 'processFeedbackFlow',
    inputSchema: ProcessFeedbackInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    console.log('Received feedback:', JSON.stringify(input, null, 2));
    
    // Store the feedback in our "database"
    feedbackStore.push(input);
  }
);


// This is a helper function that could be used by other flows to retrieve feedback.
// It's not directly called by the UI in this implementation.
export const retrieveFeedbackForAnalysis = ai.defineFlow(
  {
    name: 'retrieveFeedbackForAnalysis',
    inputSchema: z.void(),
    outputSchema: z.array(ProcessFeedbackInputSchema),
  },
  async () => {
    return feedbackStore;
  }
);
