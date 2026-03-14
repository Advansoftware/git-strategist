import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Wrench } from 'lucide-react';
import type { ProjectAnalysis } from '@/lib/types';

interface ResourceSuggestionsProps {
  suggestions: ProjectAnalysis['strategy']['resourceSuggestions'];
}

export function ResourceSuggestions({ suggestions }: ResourceSuggestionsProps) {
  return (
    <AccordionItem value="resource-suggestions">
      <AccordionTrigger className="text-lg font-semibold hover:no-underline">
        <div className="flex items-center gap-3">
          <Wrench className="h-5 w-5 text-accent" />
          Sugestões de Recursos
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 pl-4 border-l-2 ml-4">
        <ul className="list-disc list-inside space-y-3 text-base marker:text-accent">
          {suggestions.map((resource, index) => (
            <li key={index} className="pl-2">{resource}</li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}
