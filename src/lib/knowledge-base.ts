'use server';

import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs';
import { join } from 'path';
import { 
  ai, 
  getActiveModel, 
  getActiveEmbedder, 
  getEmbedderByDimension, 
  getActiveProvider,
  geminiEmbedder,
  gptLargeEmbedder,
  isGeminiConfigured,
  isOpenAIConfigured
} from '@/ai/genkit';
import { analyzeProposalStrengths, type ProposalAnalysis } from '@/ai/flows/analyze-proposal-strengths';

// --- Paths ---
const DATA_DIR = join(process.cwd(), 'src', 'data');
const VECTORS_PATH = join(DATA_DIR, 'vectors.json');
const PROPOSALS_DIR = join(DATA_DIR, 'proposals');

// --- Types ---
export type VectorRecord = {
  id: string;
  fileName: string;
  createdAt: string;
  projectValue?: string;
  tags: string[];
  analysis: ProposalAnalysis;
  embeddings: {
    gemini?: number[];
    openai?: number[];
  };
  embedding?: number[]; // Legado
};

// --- Helpers ---
function readVectors(): VectorRecord[] {
  try {
    const raw = readFileSync(VECTORS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeVectors(records: VectorRecord[]): void {
  writeFileSync(VECTORS_PATH, JSON.stringify(records, null, 2), 'utf-8');
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    console.warn(`[KB] Dimension mismatch detectado! Query: ${vecA.length}, Record: ${vecB.length}. Similaridade zerada para evitar erro.`);
    return 0;
  }
  if (vecA.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// --- Embedding ---
async function generateEmbedding(text: string, forceEmbedder?: unknown): Promise<number[]> {
  const activeEmbedder = await getActiveEmbedder();
  const embedder = forceEmbedder || activeEmbedder;
  
  const result = await ai.embed({ 
    embedder: embedder as Parameters<typeof ai.embed>[0]['embedder'], 
    content: text 
  });

  if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'object' && 'embedding' in (result[0] as object)) {
    return (result as Array<{ embedding: number[] }>)[0].embedding;
  }
  return result as unknown as number[];
}

// --- PDF Extraction ---
export async function extractTextFromPdf(base64Data: string): Promise<string> {
  const model = await getActiveModel();
  const response = await ai.generate({
    model,
    prompt: [
      {
        text: 'Extraia TODO o texto deste documento PDF. Retorne apenas o texto puro, sem formatação adicional, resumos ou comentários. Mantenha a estrutura original do texto.',
      },
      {
        media: {
          contentType: 'application/pdf',
          url: `data:application/pdf;base64,${base64Data}`,
        },
      },
    ],
  });
  return response.text;
}

// --- Core Functions ---

/**
 * Adds a new proposal to the knowledge base.
 * Generates BOTH Gemini and OpenAI embeddings for maximum compatibility.
 */
export async function ingestProposal(
  text: string,
  projectValue?: string,
  pdfBase64?: string
): Promise<{ id: string; analysis: ProposalAnalysis }> {
  let fullText = text;
  let pdfExtractedText = '';

  // Extract PDF text if provided
  if (pdfBase64) {
    pdfExtractedText = await extractTextFromPdf(pdfBase64);
    fullText = `${text}\n\n--- ANEXO (extraído de PDF) ---\n${pdfExtractedText}`;
  }

  // Generate analysis and hybrid embeddings
  const analysis = await analyzeProposalStrengths(fullText, projectValue);
  
  const embeddings: { gemini?: number[]; openai?: number[] } = {};
  
  console.log('[KB] Generating hybrid embeddings...');
  const embedPromises = [];

  // Try Gemini
  embedPromises.push(
    generateEmbedding(fullText, geminiEmbedder)
      .then(v => { embeddings.gemini = v; })
      .catch(e => console.warn('[KB] Gemini embedding failed:', e.message))
  );

  // Try OpenAI (Large by default for new ingestions)
  embedPromises.push(
    generateEmbedding(fullText, gptLargeEmbedder)
      .then(v => { embeddings.openai = v; })
      .catch(e => console.warn('[KB] OpenAI embedding failed:', e.message))
  );

  await Promise.all(embedPromises);

  // Generate record
  const id = generateId();
  const fileName = `${id}.md`;

  // Build .md content
  const mdContent = [
    `# Proposta — ${analysis.tags.slice(0, 3).join(', ')}`,
    projectValue ? `**Valor:** ${projectValue}` : `**Valor:** Não informado`,
    `**Score:** ${analysis.overallScore}/10`,
    `**Tags:** ${analysis.tags.join(', ')}`,
    `**Qualificação:** ${analysis.qualificationSummary}`,
    '',
    '## Texto da Proposta',
    text,
    ...(pdfExtractedText
      ? ['', '## Anexo (extraído de PDF)', pdfExtractedText]
      : []),
  ].join('\n');

  // Save .md file
  writeFileSync(join(PROPOSALS_DIR, fileName), mdContent, 'utf-8');

  // Update vectors.json
  const records = readVectors();
  records.push({
    id,
    fileName,
    createdAt: new Date().toISOString(),
    projectValue,
    tags: analysis.tags,
    analysis,
    embeddings,
  });
  writeVectors(records);

  return { id, analysis };
}

/**
 * Finds the most similar proposals to a given query text.
 * Uses provider-specific embeddings for the search.
 */
export async function findSimilarProposals(
  query: string,
  limit: number = 3
): Promise<
  Array<{
    id: string;
    content: string;
    projectValue?: string;
    analysis: ProposalAnalysis;
    similarity: number;
  }>
> {
  const records = readVectors();
  if (records.length === 0) {
    console.log('[KB] Zero records in KB.');
    return [];
  }

  const provider = await getActiveProvider();
  console.log(`[KB] Searching using "${provider}" vector memory...`);

  const queryEmbedding = await generateEmbedding(query);

  // Calculate similarity for all records
  const scored = records.map((record) => {
    // 1. Try match the current provider
    let targetVector = record.embeddings?.[provider as keyof typeof record.embeddings];
    
    // 2. Fallback to legacy single vector if dimensions match
    if (!targetVector && record.embedding) {
      if (record.embedding.length === queryEmbedding.length) {
        targetVector = record.embedding;
      }
    }

    return {
      ...record,
      similarity: targetVector ? cosineSimilarity(queryEmbedding, targetVector) : 0,
    };
  });

  // Sort by similarity (highest first), take top N
  scored.sort((a, b) => b.similarity - a.similarity);
  
  // Log top similarity score for debugging
  if (scored.length > 0) {
    console.log(`[KB] Best similarity score (${provider}): ${(scored[0].similarity * 100).toFixed(1)}%`);
  }

  const topN = scored.slice(0, limit);

  // Load the .md content for each result
  return topN.map((record) => {
    let content = '';
    try {
      content = readFileSync(join(PROPOSALS_DIR, record.fileName), 'utf-8');
    } catch {
      content = '(Arquivo não encontrado)';
    }
    return {
      id: record.id,
      content,
      projectValue: record.projectValue,
      analysis: record.analysis,
      similarity: record.similarity,
    };
  });
}

/**
 * Lists all proposals in the KB (metadata only, no full text).
 */
export async function listAllProposals(): Promise<
  Array<{
    id: string;
    createdAt: string;
    projectValue?: string;
    tags: string[];
    overallScore: number;
    qualificationSummary: string;
  }>
> {
  const records = readVectors();
  return records.map((r) => ({
    id: r.id,
    createdAt: r.createdAt,
    projectValue: r.projectValue,
    tags: r.tags,
    overallScore: r.analysis.overallScore,
    qualificationSummary: r.analysis.qualificationSummary,
  }));
}

/**
 * Removes a proposal from the KB by ID.
 */
export async function removeProposal(id: string): Promise<void> {
  const records = readVectors();
  const record = records.find((r) => r.id === id);
  if (!record) return;

  // Delete .md file
  try {
    unlinkSync(join(PROPOSALS_DIR, record.fileName));
  } catch {
    // File may already be deleted
  }

  // Update vectors.json
  const filtered = records.filter((r) => r.id !== id);
  writeVectors(filtered);
}

/**
 * Gets the details of a specific proposal by ID.
 */
export async function getProposalDetails(id: string): Promise<{
  id: string;
  createdAt: string;
  projectValue?: string;
  tags: string[];
  analysis: ProposalAnalysis;
  content: string;
} | null> {
  const records = readVectors();
  const record = records.find((r) => r.id === id);
  if (!record) return null;

  let content = '';
  try {
    content = readFileSync(join(PROPOSALS_DIR, record.fileName), 'utf-8');
  } catch {
    content = '(Arquivo de texto da proposta não encontrado)';
  }

  return {
    id: record.id,
    createdAt: record.createdAt,
    projectValue: record.projectValue,
    tags: record.tags,
    analysis: record.analysis,
    content,
  };
}

/**
 * Gets the current synchronization status of the KB embeddings.
 */
export async function getSyncStatus(): Promise<{
  total: number;
  outOfSync: number;
  provider: string;
}> {
  const records = readVectors();
  const provider = await getActiveProvider();
  const hasKey = provider === 'gemini' ? isGeminiConfigured() : isOpenAIConfigured();

  if (!hasKey) {
    return { total: records.length, outOfSync: 0, provider };
  }

  const outOfSync = records.filter(r => {
    if (provider === 'gemini') return !r.embeddings?.gemini;
    if (provider === 'openai') return !r.embeddings?.openai;
    return false;
  }).length;

  return {
    total: records.length,
    outOfSync,
    provider,
  };
}

/**
 * Performs a synchronization by generating missing embeddings for all records.
 * Only syncs the currently active provider to avoid unnecessary errors/calls.
 */
export async function performSync(): Promise<{ synchronized: number; errors: number }> {
  const records = readVectors();
  const provider = await getActiveProvider();
  const embedder = provider === 'gemini' ? geminiEmbedder : gptLargeEmbedder;
  
  let synchronized = 0;
  let errors = 0;

  for (const record of records) {
    const needsSync = provider === 'gemini' ? !record.embeddings?.gemini : !record.embeddings?.openai;

    if (needsSync) {
      try {
        let content = '';
        try {
          content = readFileSync(join(PROPOSALS_DIR, record.fileName), 'utf-8');
        } catch {
          errors++;
          continue;
        }

        const newEmbeddings = { ...(record.embeddings || {}) };
        
        try {
          const vector = await generateEmbedding(content, embedder);
          if (provider === 'gemini') newEmbeddings.gemini = vector;
          if (provider === 'openai') newEmbeddings.openai = vector;
          
          record.embeddings = newEmbeddings;
          synchronized++;
        } catch (e) {
          console.error(`[KB] Sync failed for ${provider} on record ${record.id}:`, e instanceof Error ? e.message : e);
          errors++;
        }
      } catch (e) {
        console.error(`[KB] Record sync process failed for ${record.id}:`, e);
        errors++;
      }
    }
  }

  if (synchronized > 0) {
    writeVectors(records);
  }

  return { synchronized, errors };
}
