import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const key = process.env.GEMINI_API_KEY;
if (!key) {
  throw new Error(
    'Missing GEMINI_API_KEY. Add it to your environment or .env file (from Google AI Studio).'
  );
}

export const geminiModelName =
  process.env.GEMINI_MODEL ||
  'gemini-2.5-flash'; // Use a lower-tier default to avoid free-tier quota limits

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: key,
    }),
  ],
  model: googleAI.model(geminiModelName, { temperature: 0.2 }),
});

export const geminiModel = googleAI.model(geminiModelName);
