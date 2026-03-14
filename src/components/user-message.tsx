import { User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserMessageProps {
  prompt: string;
}

export function UserMessage({ prompt }: UserMessageProps) {
  return (
    <div className="flex items-start gap-4 animate-in fade-in-50 duration-500">
        <Avatar className="h-8 w-8 border-2 border-primary/50">
            <AvatarFallback className="bg-transparent text-primary">
                <User className="h-5 w-5" />
            </AvatarFallback>
        </Avatar>
        <div className="flex-grow space-y-2 pt-0.5">
            <h2 className="font-semibold text-foreground">Você</h2>
            <p className="text-base text-foreground/90 whitespace-pre-wrap">{prompt}</p>
        </div>
    </div>
  );
}
