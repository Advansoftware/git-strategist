import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookMarked } from 'lucide-react';
import type { ProjectAnalysis } from '@/lib/types';

interface ProposalStructureProps {
  proposal: ProjectAnalysis['proposal'];
}

export function ProposalStructure({ proposal }: ProposalStructureProps) {
  return (
    <AccordionItem value="proposal-structure">
      <AccordionTrigger className="text-lg font-semibold hover:no-underline">
        <div className="flex items-center gap-3">
          <BookMarked className="h-5 w-5 text-accent" />
          Estrutura da Proposta
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 pl-4 border-l-2 ml-4 space-y-6">
        {proposal.sections.map((section, index) => (
          <div key={index}>
            <h4 className="font-semibold text-base mb-2">{index + 1}. {section.title}</h4>
            <div className="text-base p-4 bg-muted/50 rounded-md border whitespace-pre-wrap">
              {section.suggestedText}
            </div>
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}
