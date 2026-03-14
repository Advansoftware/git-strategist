import type { ProjectStrategyBlueprintOutput } from '@/ai/flows/project-strategy-blueprint';
import type { SkillGapOutput } from '@/ai/flows/skill-gap-identification-flow';
import type { ProjectEffortComplexityOutput } from '@/ai/flows/project-effort-complexity-estimation';

export type ProjectAnalysis = {
    strategy: ProjectStrategyBlueprintOutput;
    gaps: SkillGapOutput;
    effort: ProjectEffortComplexityOutput;
};
