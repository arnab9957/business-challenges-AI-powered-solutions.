import {genkit, configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

configureGenkit({
  plugins: [googleAI({
    apiVersion: "v2"
  })],
  // logLevel: 'debug',
  // enableTracingAndMetrics: true,
});

export const ai = genkit({
  plugins: [googleAI()],
});
