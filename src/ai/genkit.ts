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

export const isGeminiConfigured = () => !!process.env.GEMINI_API_KEY;
export const isOpenAIConfigured = () => !!process.env.OPENAI_API_KEY;

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: geminiKey }),
    openAI({ apiKey: openaiKey }),
  ],
});

export const geminiModel = googleAI.model(geminiModelName);
export const gptModel = openAI.model(openaiModelName);

export const geminiEmbedder = googleAI.embedder('gemini-embedding-001');
export const gptSmallEmbedder = openAI.embedder('text-embedding-3-small');
export const gptLargeEmbedder = openAI.embedder('text-embedding-3-large');
export const gptEmbedder = gptLargeEmbedder; // Agora padronizado para Large (3072)

/**
 * Returns the currently active provider name ('gemini' or 'openai').
 */
export async function getActiveProvider(): Promise<'gemini' | 'openai'> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get('PREFERRED_AI_PROVIDER')?.value;
    if (value === 'openai' || value === 'gemini') {
      return value;
    }
  } catch {
    // Cookie store may not be available in all contexts
  }
  return 'gemini';
}

/**
 * Dynamically gets the currently selected model based on user preference (stored in cookies).
 */
export async function getActiveModel() {
  const provider = await getActiveProvider();
  console.log(`[Genkit] getActiveModel: Provider current selection is "${provider}"`);
  
  if (provider === 'openai') {
    return gptModel;
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

/**
 * Returns the appropriate embedder based on a given vector dimension.
 * Gemini: 768, OpenAI (text-embedding-3-small): 1536, OpenAI (text-embedding-3-large): 3072
 */
export function getEmbedderByDimension(dim: number) {
  if (dim === 3072) {
    return gptLargeEmbedder;
  }
  if (dim === 1536) {
    return gptSmallEmbedder;
  }
  // Default to Gemini as it's our base
  return geminiEmbedder;
}
