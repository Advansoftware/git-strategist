'use server';

import { projectStrategyBlueprint } from '@/ai/flows/project-strategy-blueprint';
import { identifySkillGaps } from '@/ai/flows/skill-gap-identification-flow';
import { estimateProjectEffortAndComplexity } from '@/ai/flows/project-effort-complexity-estimation';
import type { ProjectAnalysis } from '@/lib/types';

export async function getProjectAnalysis(
  projectDescription: string,
  userSkills: string[]
): Promise<ProjectAnalysis | { error: string }> {
  if (!projectDescription) {
    return { error: 'Project description cannot be empty.' };
  }

  try {
    const [strategy, gaps, effort] = await Promise.all([
      projectStrategyBlueprint({ projectDescription, userSkills }),
      identifySkillGaps({ projectDescription, userSkills }),
      estimateProjectEffortAndComplexity({ projectDescription, userSkills }),
    ]);

    return { strategy, gaps, effort };
  } catch (error) {
    console.error('Error getting project analysis:', error);
    return { error: 'Failed to generate project analysis. Please try again.' };
  }
}
