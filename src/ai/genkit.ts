'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      location: 'us-central1',
    }),
  ],
});

export const geminiModel = 'gemini-1.0-pro-001';
