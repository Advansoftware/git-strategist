import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openAI } from '@genkit-ai/compat-oai/openai';
import { cookies } from 'next/headers';

const geminiKey = process.env.GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!geminiKey) {
  console.warn('Missing GEMINI_API_KEY. Gemini will not work.');
}

if (!openaiKey) {
  console.warn('Missing OPENAI_API_KEY. OpenAI will not work.');
}

export const geminiModelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
export const openaiModelName = process.env.OPENAI_MODEL || 'gpt-4o';

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: geminiKey }),
    openAI({ apiKey: openaiKey }),
  ],
});

export const geminiModel = googleAI.model(geminiModelName);
export const gptModel = openAI.model(openaiModelName);

export const geminiEmbedder = googleAI.embedder('gemini-embedding-001');
export const gptEmbedder = openAI.embedder('text-embedding-3-small');

/**
 * Dynamically gets the currently selected model based on user preference (stored in cookies).
 * Can be used in both Server Components and Server Actions.
 */
export async function getActiveModel() {
  try {
    const cookieStore = await cookies();
    const provider = cookieStore.get('PREFERRED_AI_PROVIDER')?.value || 'gemini';
    
    console.log(`[Genkit] getActiveModel: Provider current selection is "${provider}"`);
    
    if (provider === 'openai') {
      return gptModel;
    }
  } catch (error) {
    console.debug('[Genkit] Cookies not available, falling back to Gemini model.');
  }
  
  return geminiModel;
}

/**
 * Dynamically gets the currently selected embedder based on user preference.
 */
export async function getActiveEmbedder() {
  try {
    const cookieStore = await cookies();
    const provider = cookieStore.get('PREFERRED_AI_PROVIDER')?.value || 'gemini';
    
    if (provider === 'openai') {
      return gptEmbedder;
    }
  } catch (error) {
    console.debug('[Genkit] Cookies not available, falling back to Gemini embedder.');
  }
  
  return geminiEmbedder;
}
