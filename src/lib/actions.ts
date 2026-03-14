'use server';

import { projectStrategyBlueprint } from '@/ai/flows/project-strategy-blueprint';
import { identifySkillGaps } from '@/ai/flows/skill-gap-identification-flow';
import { estimateProjectEffortAndComplexity } from '@/ai/flows/project-effort-complexity-estimation';
import { estimateProjectPrice } from '@/ai/flows/project-price-estimation';
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
    
    const [strategy, gaps, effort, price] = await Promise.all([
      projectStrategyBlueprint(commonInput),
      identifySkillGaps(commonInput),
      estimateProjectEffortAndComplexity(commonInput),
      estimateProjectPrice({ ...commonInput, minBudget, maxBudget, minPossibleBudget }),
    ]);

    return { strategy, gaps, effort, price };
  } catch (error) {
    console.error('Error getting project analysis:', error);
    return { error: 'Falha ao gerar a análise do projeto. Por favor, tente novamente.' };
  }
}
