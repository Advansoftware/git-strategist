'use server';

import { projectStrategyBlueprint } from '@/ai/flows/project-strategy-blueprint';
import { identifySkillGaps } from '@/ai/flows/skill-gap-identification-flow';
import { estimateProjectEffortAndComplexity } from '@/ai/flows/project-effort-complexity-estimation';
import { estimateProjectPrice } from '@/ai/flows/project-price-estimation';
import { generateProposalStructure } from '@/ai/flows/proposal-structure-flow';
import type { ProjectAnalysis } from '@/lib/types';

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
    
    const [strategy, gaps, effort, price, proposal] = await Promise.all([
      projectStrategyBlueprint(commonInput),
      identifySkillGaps(commonInput),
      estimateProjectEffortAndComplexity(commonInput),
      estimateProjectPrice({ ...commonInput, minBudget, maxBudget, minPossibleBudget }),
      generateProposalStructure(commonInput),
    ]);

    return { strategy, gaps, effort, price, proposal };
  } catch (error) {
    console.error('AI API call failed:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Análise de IA falhou devido a um erro desconhecido.' };
  }
}
