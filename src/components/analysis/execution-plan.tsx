import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ClipboardList } from 'lucide-react';
import type { ProjectAnalysis } from '@/lib/types';

interface ExecutionPlanProps {
  plan: ProjectAnalysis['strategy']['executionPlan'];
}

export function ExecutionPlan({ plan }: ExecutionPlanProps) {
  return (
    <AccordionItem value="execution-plan">
      <AccordionTrigger className="text-lg font-semibold hover:no-underline">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-5 w-5 text-accent" />
          Plano de Execução
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 pl-4 border-l-2 ml-4">
        <ol className="space-y-4 text-base">
          {plan.map((step, index) => (
            <li key={index} className="flex gap-3">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0 mt-0.5">{index + 1}</div>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </AccordionContent>
    </AccordionItem>
  );
}
