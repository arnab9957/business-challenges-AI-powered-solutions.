import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v2',
    }),
  ],
  // logLevel: 'debug',
  // enableTracingAndMetrics: true,
});
