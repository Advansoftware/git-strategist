'use client';

import { SendHorizonal, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ChatFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  isLoading: boolean;
  minBudget: string;
  setMinBudget: (value: string) => void;
  maxBudget: string;
  setMaxBudget: (value: string) => void;
  minPossibleBudget: string;
  setMinPossibleBudget: (value: string) => void;
}

export function ChatForm({
  onSubmit,
  prompt,
  setPrompt,
  isLoading,
  minBudget,
  setMinBudget,
  maxBudget,
  setMaxBudget,
  minPossibleBudget,
  setMinPossibleBudget,
}: ChatFormProps) {
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
          placeholder="Cole a descrição do seu projeto freelancer aqui para começar..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pr-24 min-h-[60px] resize-none border-0 shadow-none focus-visible:ring-0 text-base"
          disabled={isLoading}
          rows={1}
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Configurações</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Configurações Opcionais</h4>
                    <p className="text-sm text-muted-foreground">
                      Forneça uma faixa de orçamento para refinar a sugestão de preço.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-budget">Orçamento Mín. (R$)</Label>
                      <Input 
                        id="min-budget" 
                        type="number" 
                        placeholder="Ex: 1000" 
                        value={minBudget}
                        onChange={(e) => setMinBudget(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-budget">Orçamento Máx. (R$)</Label>
                      <Input 
                        id="max-budget" 
                        type="number" 
                        placeholder="Ex: 5000"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="min-possible-budget">Valor Mín. Aceitável (R$)</Label>
                      <Input 
                        id="min-possible-budget" 
                        type="number" 
                        placeholder="Ex: 800"
                        value={minPossibleBudget}
                        onChange={(e) => setMinPossibleBudget(e.target.value)}
                        className="h-9"
                      />
                    </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button type="submit" size="icon" disabled={isLoading || !prompt.trim()} className="rounded-lg bg-accent hover:bg-accent/90">
                <SendHorizonal className="h-5 w-5" />
                <span className="sr-only">Gerar Plano</span>
            </Button>
        </div>
      </Card>
    </form>
  );
}
