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
  const timeString = strategy.recommendedTimeCommitment || effort.timeCommitment;

  // Helper to convert "X-Y horas" to days (8h/day)
  const formatTimeWithDays = (text: string) => {
    const numbers = text.match(/\d+/g);
    if (!numbers) return text;

    const days = numbers.map(n => {
      const d = parseFloat(n) / 8;
      return d % 1 === 0 ? d.toString() : d.toFixed(1);
    });

    if (days.length === 1) return `${text} (~${days[0]} dias)`;
    return `${text} (~${days[0]}-${days[1]} dias)`;
  };
  
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
        {formatTimeWithDays(timeString)}
      </Badge>
    </div>
  );
}
