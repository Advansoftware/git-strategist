'use server';

import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs';
import { join } from 'path';
import { ai, getActiveModel, getActiveEmbedder } from '@/ai/genkit';
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
  embedding: number[];
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

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// --- Embedding ---
async function generateEmbedding(text: string): Promise<number[]> {
  const embedder = await getActiveEmbedder();
  const result = await ai.embed({ embedder: embedder as any, content: text });
  // ai.embed returns an array of { embedding: number[] } objects
  if (Array.isArray(result) && result.length > 0 && 'embedding' in result[0]) {
    return (result as Array<{ embedding: number[] }>)[0].embedding;
  }
  // If it already returns a flat number array (older API versions)
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
 * 1. Extracts text from PDF (if provided).
 * 2. Analyzes the proposal for strengths via AI.
 * 3. Generates embedding vector.
 * 4. Saves .md file and updates vectors.json.
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

  // Run AI analysis and embedding generation in parallel
  const [analysis, embedding] = await Promise.all([
    analyzeProposalStrengths(fullText, projectValue),
    generateEmbedding(fullText),
  ]);

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
    embedding,
  });
  writeVectors(records);

  return { id, analysis };
}

/**
 * Finds the most similar proposals to a given query text.
 * Returns the top N proposals with their full content and analysis.
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
  if (records.length === 0) return [];

  const queryEmbedding = await generateEmbedding(query);

  // Calculate similarity for all records
  const scored = records.map((record) => ({
    ...record,
    similarity: cosineSimilarity(queryEmbedding, record.embedding),
  }));

  // Sort by similarity (highest first), take top N
  scored.sort((a, b) => b.similarity - a.similarity);
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
