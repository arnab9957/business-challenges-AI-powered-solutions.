import { config } from 'dotenv';
config();

import '@/ai/flows/generate-solutions.ts';
import '@/ai/schemas/generate-solutions-schemas.ts';
import '@/ai/flows/process-feedback.ts';
import '@/ai/schemas/process-feedback-schemas.ts';
