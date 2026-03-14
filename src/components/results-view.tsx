import { Accordion } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProjectAnalysis } from '@/lib/types';

import { ProjectSummary } from './analysis/project-summary';
import { ExecutionPlan } from './analysis/execution-plan';
import { ProposalStructure } from './analysis/proposal-structure';
import { SuggestedSkills } from './analysis/suggested-skills';
import { PotentialChallenges } from './analysis/potential-challenges';
import { ResourceSuggestions } from './analysis/resource-suggestions';

interface ResultsViewProps {
  analysis: ProjectAnalysis;
  onAddSkills: (skills: string[]) => void;
}

export function ResultsView({ analysis, onAddSkills }: ResultsViewProps) {
  const { strategy, gaps, effort, price, proposal } = analysis;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <div className="flex flex-wrap items-start gap-4">
            <CardTitle className="font-headline text-2xl lg:text-3xl sr-only">Plano do Projeto</CardTitle>
            <div className="flex-grow" />
            <ProjectSummary price={price} effort={effort} strategy={strategy} />
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={['execution-plan', 'proposal-structure']} className="w-full">
            <ExecutionPlan plan={strategy.executionPlan} />
            <ProposalStructure proposal={proposal} />
            <SuggestedSkills gaps={gaps} onAddSkills={onAddSkills} />
            <PotentialChallenges challenges={strategy.potentialChallenges} />
            <ResourceSuggestions suggestions={strategy.resourceSuggestions} />
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
