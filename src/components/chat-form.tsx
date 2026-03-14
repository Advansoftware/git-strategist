'use client';

import { SendHorizonal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface ChatFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  isLoading: boolean;
}

export function ChatForm({ onSubmit, prompt, setPrompt, isLoading }: ChatFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
        submitButton?.click();
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="relative w-full">
      <Card className="p-2 shadow-lg rounded-xl border-2 border-transparent focus-within:border-primary transition-colors">
        <Textarea
          name="prompt"
          placeholder="Cole a descrição do seu projeto freelancer aqui..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pr-20 min-h-[60px] resize-none border-0 shadow-none focus-visible:ring-0"
          disabled={isLoading}
          rows={1}
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <Button type="submit" size="icon" disabled={isLoading || !prompt.trim()} className="rounded-lg bg-accent hover:bg-accent/90">
                <SendHorizonal className="h-5 w-5" />
                <span className="sr-only">Gerar Plano</span>
            </Button>
        </div>
      </Card>
    </form>
  );
}
