import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Plus } from 'lucide-react';
import type { ProjectAnalysis } from '@/lib/types';

interface SuggestedSkillsProps {
  gaps: ProjectAnalysis['gaps'];
  onAddSkills: (skills: string[]) => void;
}

export function SuggestedSkills({ gaps, onAddSkills }: SuggestedSkillsProps) {
  if (gaps.missingSkills.length === 0) {
    return null;
  }

  return (
    <AccordionItem value="missing-skills">
      <AccordionTrigger className="text-lg font-semibold hover:no-underline">
        <div className="flex items-center gap-3">
          <Award className="h-5 w-5 text-accent" />
          Habilidades Sugeridas
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 pl-4 border-l-2 ml-4 space-y-4">
        <p className="text-base text-muted-foreground">{gaps.explanation}</p>
        <div className="flex flex-wrap gap-2">
          {gaps.missingSkills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-base">{skill}</Badge>
          ))}
        </div>
        <Button onClick={() => onAddSkills(gaps.missingSkills)} variant="ghost" className="text-accent hover:text-accent">
          <Plus className="mr-2 h-4 w-4"/>
          Adicionar estas habilidades ao meu perfil
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
}
