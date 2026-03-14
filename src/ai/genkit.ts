import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    }),
  ],
});

export const geminiModel = 'gemini-1.5-flash-latest';
