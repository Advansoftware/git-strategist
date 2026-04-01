import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openAI } from '@genkit-ai/compat-oai/openai';
import { openAICompatible } from '@genkit-ai/compat-oai';
import { cookies } from 'next/headers';

const geminiKey = process.env.GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const openrouterKey = process.env.OPENROUTER_API_KEY;

if (!geminiKey) console.warn('Missing GEMINI_API_KEY. Gemini will not work.');
if (!openaiKey) console.warn('Missing OPENAI_API_KEY. OpenAI will not work.');
if (!openrouterKey) console.warn('Missing OPENROUTER_API_KEY. OpenRouter will not work unless using free tier without auth.');

export const geminiModelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
export const openaiModelName = process.env.OPENAI_MODEL || 'gpt-4o';
export const openrouterModelName = process.env.OPENROUTER_MODEL || 'qwen/qwen-turbo';
export const ollamaModelName = process.env.OLLAMA_MODEL || 'llama3.2';

export const isGeminiConfigured = () => !!process.env.GEMINI_API_KEY;
export const isOpenAIConfigured = () => !!process.env.OPENAI_API_KEY;
export const isOpenRouterConfigured = () => !!process.env.OPENROUTER_API_KEY;

const globalForGenkit = globalThis as unknown as {
  _ai: typeof genkit;
};

export const ai = globalForGenkit._ai || genkit({
  plugins: [
    googleAI({ apiKey: geminiKey }),
    openAI({ apiKey: openaiKey }),
    openAICompatible({
      name: 'openrouter',
      apiKey: openrouterKey || 'none',
      baseURL: 'https://openrouter.ai/api/v1',
    }),
    openAICompatible({
      name: 'ollama',
      apiKey: 'ollama',
      baseURL: 'http://localhost:11434/v1',
    }),
  ],
});
if (process.env.NODE_ENV !== 'production') globalForGenkit._ai = ai;

export const geminiModel = googleAI.model(geminiModelName);
export const gptModel = openAI.model(openaiModelName);

export const openrouterModel = 'openrouter/' + openrouterModelName;
export const ollamaModel = 'ollama/' + ollamaModelName;

export const geminiEmbedder = googleAI.embedder('gemini-embedding-001');
export const gptSmallEmbedder = openAI.embedder('text-embedding-3-small');
export const gptLargeEmbedder = openAI.embedder('text-embedding-3-large');
export const gptEmbedder = gptLargeEmbedder; // Agora padronizado para Large (3072)

/**
 * Returns the currently active provider name.
 */
export async function getActiveProvider(): Promise<'gemini' | 'openai' | 'openrouter' | 'ollama'> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get('PREFERRED_AI_PROVIDER')?.value;
    if (value === 'openai' || value === 'gemini' || value === 'openrouter' || value === 'ollama') {
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

  if (provider === 'openai') return gptModel;
  if (provider === 'openrouter') return openrouterModel;
  if (provider === 'ollama') return ollamaModel;

  return geminiModel;
}

/**
 * Dynamically gets the currently selected embedder based on user preference.
 * We fallback to geminiEmbedder for openrouter and ollama to reuse existing vector functionality.
 */
export async function getActiveEmbedder() {
  try {
    const cookieStore = await cookies();
    const provider = cookieStore.get('PREFERRED_AI_PROVIDER')?.value || 'gemini';

    if (provider === 'openai') {
      return gptEmbedder;
    }
    // openrouter and ollama use gemini embedder as fallback
  } catch (error) {
    console.debug('[Genkit] Cookies not available, falling back to Gemini embedder.');
  }

  return geminiEmbedder; // default for gemini, openrouter, and ollama
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
