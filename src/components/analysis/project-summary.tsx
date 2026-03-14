import { Badge } from '@/components/ui/badge';
import { BrainCircuit, Clock, DollarSign } from 'lucide-react';
import type { ProjectAnalysis } from '@/lib/types';

interface ProjectSummaryProps {
  price: ProjectAnalysis['price'];
  effort: ProjectAnalysis['effort'];
  strategy: ProjectAnalysis['strategy'];
}

export function ProjectSummary({ price, effort, strategy }: ProjectSummaryProps) {
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
    <div className="flex flex-wrap gap-2">
      {price.suggestedPrice && (
         <Badge variant="outline" className="text-sm py-1 px-3 border-green-500/50 text-green-500 bg-green-500/10">
            <DollarSign className="h-4 w-4 mr-2" />
            {price.suggestedPrice}
         </Badge>
      )}
      <Badge variant={difficultyVariants[difficulty]} className="text-sm py-1 px-3">
        <BrainCircuit className="h-4 w-4 mr-2" />
        {difficulty}
      </Badge>
      <Badge variant="outline" className="text-sm py-1 px-3 border-primary/50 text-primary">
        <Clock className="h-4 w-4 mr-2" />
        {strategy.recommendedTimeCommitment || effort.timeCommitment}
      </Badge>
    </div>
  );
}
