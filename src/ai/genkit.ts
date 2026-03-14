import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Route requests through a specific Vertex AI endpoint to avoid regional restrictions
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    }),
  ],
  // Use the model name compatible with the Vertex AI endpoint
  model: 'gemini-1.5-pro-preview-0409',
});
