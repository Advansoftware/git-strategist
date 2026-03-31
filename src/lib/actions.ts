'use server';

import { projectStrategyBlueprint } from '@/ai/flows/project-strategy-blueprint';
import { identifySkillGaps } from '@/ai/flows/skill-gap-identification-flow';
import { estimateProjectEffortAndComplexity } from '@/ai/flows/project-effort-complexity-estimation';
import { estimateProjectPrice } from '@/ai/flows/project-price-estimation';
import { generateProposalStructure } from '@/ai/flows/proposal-structure-flow';
import { generateBrunoProposal } from '@/ai/flows/bruno-proposal-pattern';
import {
  ingestProposal,
  listAllProposals,
  removeProposal,
  findSimilarProposals,
  getProposalDetails,
  getSyncStatus,
  performSync
} from '@/lib/knowledge-base';
import { loadSkills, saveSkills, addSkill as addSkillToStore, removeSkill as removeSkillFromStore } from '@/lib/skills-store';
import type { ProjectAnalysis } from '@/lib/types';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function getProjectAnalysis(
  projectDescription: string,
  userSkills: string[],
  minBudget?: number,
  maxBudget?: number,
  minPossibleBudget?: number
): Promise<ProjectAnalysis | { error: string }> {
  if (!projectDescription) {
    return { error: 'A descrição do projeto não pode estar vazia.' };
  }

  try {
    const commonInput = { projectDescription, userSkills };

    // Retrieve KB references first (needed for both price and proposal)
    const kbReferences = await findSimilarProposals(projectDescription, 3).catch(() => []);

    // Run all flows in parallel, passing KB references to price estimation
    const [strategy, gaps, effort, priceResult, proposal] = await Promise.all([
      projectStrategyBlueprint(commonInput),
      identifySkillGaps(commonInput),
      estimateProjectEffortAndComplexity(commonInput),
      estimateProjectPrice({
        ...commonInput,
        minBudget,
        maxBudget,
        minPossibleBudget,
        kbReferences: kbReferences.map(r => ({
          projectValue: r.projectValue,
          analysis: {
            valueQualification: r.analysis.valueQualification,
            overallScore: r.analysis.overallScore,
          },
        })),
      }),
      generateProposalStructure(commonInput),
    ]);

    // Generate the final proposal using KB + all other analysis data
    const brunoProposal = await generateBrunoProposal({
      ...commonInput,
      suggestedPrice: priceResult.suggestedPrice,
      timeCommitment: effort.timeCommitment,
    });

    return { strategy, gaps, effort, price: priceResult, proposal, brunoProposal };
  } catch (error) {
    console.error('AI API call failed:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Análise de IA falhou devido a um erro desconhecido.' };
  }
}

// --- Knowledge Base Actions ---

export async function saveProposalToKnowledgeBase(
  text: string,
  projectValue?: string,
  pdfBase64?: string
): Promise<{ success: true; analysis: Awaited<ReturnType<typeof ingestProposal>>['analysis'] } | { error: string }> {
  if (!text.trim()) {
    return { error: 'O texto da proposta não pode estar vazio.' };
  }

  try {
    const { analysis } = await ingestProposal(text, projectValue, pdfBase64);
    return { success: true, analysis };
  } catch (error) {
    console.error('Failed to save proposal to KB:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Falha ao salvar proposta na base de conhecimento.' };
  }
}

export async function getKnowledgeBaseProposals() {
  try {
    return await listAllProposals();
  } catch (error) {
    console.error('Failed to list KB proposals:', error);
    return [];
  }
}

export async function getKnowledgeBaseProposalDetails(id: string) {
  try {
    return await getProposalDetails(id);
  } catch (error) {
    console.error('Failed to get KB proposal details:', error);
    return null;
  }
}

export async function deleteProposalFromKnowledgeBase(
  id: string
): Promise<{ success: true } | { error: string }> {
  try {
    await removeProposal(id);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete proposal from KB:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Falha ao remover proposta.' };
  }
}

// --- Skills Actions ---

export async function getSkills(): Promise<string[]> {
  try {
    return await loadSkills();
  } catch (error) {
    console.error('Failed to load skills:', error);
    return [];
  }
}

export async function saveSkillsList(skills: string[]): Promise<{ success: true } | { error: string }> {
  try {
    await saveSkills(skills);
    return { success: true };
  } catch (error) {
    console.error('Failed to save skills:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Falha ao salvar habilidades.' };
  }
}

export async function addSkill(skill: string): Promise<{ success: true } | { error: string }> {
  if (!skill.trim()) {
    return { error: 'Habilidade não pode estar vazia.' };
  }

  try {
    await addSkillToStore(skill.trim());
    return { success: true };
  } catch (error) {
    console.error('Failed to add skill:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Falha ao adicionar habilidade.' };
  }
}

export async function removeSkill(skill: string): Promise<{ success: true } | { error: string }> {
  try {
    await removeSkillFromStore(skill);
    return { success: true };
  } catch (error) {
    console.error('Failed to remove skill:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Falha ao remover habilidade.' };
  }
}

export async function setAIProvider(provider: 'gemini' | 'openai') {
  const cookieStore = await cookies();
  cookieStore.set('PREFERRED_AI_PROVIDER', provider, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  revalidatePath('/');
}

export async function getAIProvider() {
  const cookieStore = await cookies();
  return cookieStore.get('PREFERRED_AI_PROVIDER')?.value || 'gemini';
}

export async function getKnowledgeBaseSyncStatus() {
  try {
    return await getSyncStatus();
  } catch (error) {
    console.error('Failed to get KB sync status:', error);
    return { total: 0, outOfSync: 0, missingGemini: 0, missingOpenAI: 0 };
  }
}

export async function syncKnowledgeBase() {
  try {
    const result = await performSync();
    revalidatePath('/');
    return { success: true, ...result };
  } catch (error) {
    console.error('Failed to sync KB:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Falha ao sincronizar a base de conhecimento.' };
  }
}
