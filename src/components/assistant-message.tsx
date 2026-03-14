import { BrainCircuit } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AssistantMessageProps {
  children: React.ReactNode;
}

export function AssistantMessage({ children }: AssistantMessageProps) {
  return (
    <div className="flex items-start gap-4 animate-in fade-in-50 duration-500">
        <Avatar className="h-8 w-8 border-2 border-accent/50">
            <AvatarFallback className="bg-transparent text-accent">
                <BrainCircuit className="h-5 w-5" />
            </AvatarFallback>
        </Avatar>
        <div className="flex-grow space-y-2 pt-0.5">
            <h2 className="font-semibold text-foreground">Gig Strategist</h2>
            <div className="text-base text-foreground/90">{children}</div>
        </div>
    </div>
  );
}
