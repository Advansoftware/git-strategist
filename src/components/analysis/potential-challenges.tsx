import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertTriangle } from 'lucide-react';
import type { ProjectAnalysis } from '@/lib/types';

interface PotentialChallengesProps {
  challenges: ProjectAnalysis['strategy']['potentialChallenges'];
}

export function PotentialChallenges({ challenges }: PotentialChallengesProps) {
  return (
    <AccordionItem value="potential-challenges">
      <AccordionTrigger className="text-lg font-semibold hover:no-underline">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-accent" />
          Desafios Potenciais
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 pl-4 border-l-2 ml-4">
        <ul className="list-disc list-inside space-y-3 text-base marker:text-accent">
          {challenges.map((challenge, index) => (
            <li key={index} className="pl-2">{challenge}</li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}
