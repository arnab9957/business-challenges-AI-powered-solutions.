import { config } from 'dotenv';
config();

import '@/ai/flows/generate-solutions.ts';
import '@/ai/schemas/generate-solutions-schemas.ts';
import '@/ai/flows/process-feedback.ts';
import '@/ai/schemas/process-feedback-schemas.ts';
import '@/ai/tools/context-tools.ts';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';


genkit({
  plugins: [googleAI({
    apiVersion: "v2"
  })],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
