import type { ProjectStrategyBlueprintOutput } from '@/ai/flows/project-strategy-blueprint';
import type { SkillGapOutput } from '@/ai/flows/skill-gap-identification-flow';
import type { ProjectEffortComplexityOutput } from '@/ai/flows/project-effort-complexity-estimation';
import type { ProjectPriceOutput } from '@/ai/flows/project-price-estimation';
import type { ProposalStructureOutput } from '@/ai/flows/proposal-structure-flow';

export type ProjectAnalysis = {
    strategy: ProjectStrategyBlueprintOutput;
    gaps: SkillGapOutput;
    effort: ProjectEffortComplexityOutput;
    price: ProjectPriceOutput;
    proposal: ProposalStructureOutput;
};
