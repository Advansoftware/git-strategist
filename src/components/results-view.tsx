import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Award, BrainCircuit, ClipboardList, Clock, Plus, Wrench } from 'lucide-react';
import type { ProjectAnalysis } from '@/lib/types';
import { Button } from './ui/button';

interface ResultsViewProps {
  analysis: ProjectAnalysis;
  onAddSkills: (skills: string[]) => void;
}

export function ResultsView({ analysis, onAddSkills }: ResultsViewProps) {
  const { strategy, gaps, effort } = analysis;

  const difficulty = strategy.projectDifficulty || effort.complexityRating;
  
  const difficultyVariants: Record<string, 'secondary' | 'default' | 'destructive'> = {
    Beginner: 'secondary',
    Intermediate: 'default',
    Advanced: 'destructive',
    beginner: 'secondary',
    intermediate: 'default',
    advanced: 'destructive',
    Iniciante: 'secondary',
    Intermediário: 'default',
    Avançado: 'destructive',
    iniciante: 'secondary',
    intermediário: 'default',
    avançado: 'destructive',
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <div className="flex flex-wrap items-start gap-4">
            <CardTitle className="font-headline text-2xl lg:text-3xl">Plano do Projeto</CardTitle>
            <div className="flex-grow" />
            <div className="flex flex-wrap gap-2">
              <Badge variant={difficultyVariants[difficulty]} className="text-sm py-1 px-3">
                <BrainCircuit className="h-4 w-4 mr-2" />
                {difficulty}
              </Badge>
              <Badge variant="outline" className="text-sm py-1 px-3 border-primary/50 text-primary">
                <Clock className="h-4 w-4 mr-2" />
                {strategy.recommendedTimeCommitment || effort.timeCommitment}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={gaps.missingSkills.length > 0 ? ['execution-plan', 'missing-skills'] : ['execution-plan']} className="w-full">
            <AccordionItem value="execution-plan">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-accent" />
                  Plano de Execução
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pl-4 border-l-2 ml-4">
                <ol className="space-y-4 text-base">
                  {strategy.executionPlan.map((step, index) => (
                    <li key={index} className="flex gap-3">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0 mt-0.5">{index + 1}</div>
                        <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>

            {gaps.missingSkills.length > 0 && (
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
            )}

            <AccordionItem value="potential-challenges">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-accent" />
                  Desafios Potenciais
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pl-4 border-l-2 ml-4">
                <ul className="list-disc list-inside space-y-3 text-base marker:text-accent">
                  {strategy.potentialChallenges.map((challenge, index) => (
                    <li key={index} className="pl-2">{challenge}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="resource-suggestions">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-accent" />
                  Sugestões de Recursos
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pl-4 border-l-2 ml-4">
                <ul className="list-disc list-inside space-y-3 text-base marker:text-accent">
                  {strategy.resourceSuggestions.map((resource, index) => (
                    <li key={index} className="pl-2">{resource}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
