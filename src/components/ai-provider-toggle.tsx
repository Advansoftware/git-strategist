'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Loader2 } from 'lucide-react';
import { setAIProvider, getAIProvider } from '@/lib/actions';
import { cn } from '@/lib/utils';

export function AIProviderToggle() {
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function load() {
      const current = await getAIProvider();
      setProvider(current as 'gemini' | 'openai');
    }
    load();
  }, []);

  const handleToggle = () => {
    const next = provider === 'gemini' ? 'openai' : 'gemini';
    setProvider(next);
    startTransition(async () => {
      await setAIProvider(next);
    });
  };

  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg border shadow-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => provider !== 'gemini' && handleToggle()}
        className={cn(
          "h-8 px-3 text-xs gap-1.5 transition-all duration-200",
          provider === 'gemini' 
            ? "bg-background text-foreground shadow-sm hover:bg-background" 
            : "text-muted-foreground hover:bg-transparent"
        )}
        disabled={isPending}
      >
        {isPending && provider === 'gemini' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className={cn("h-3.5 w-3.5", provider === 'gemini' ? "text-blue-500" : "")} />
        )}
        Gemini 2.0
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => provider !== 'openai' && handleToggle()}
        className={cn(
          "h-8 px-3 text-xs gap-1.5 transition-all duration-200",
          provider === 'openai' 
            ? "bg-background text-foreground shadow-sm hover:bg-background" 
            : "text-muted-foreground hover:bg-transparent"
        )}
        disabled={isPending}
      >
        {isPending && provider === 'openai' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Zap className={cn("h-3.5 w-3.5", provider === 'openai' ? "text-orange-500" : "")} />
        )}
        OpenAI (GPT-4o)
      </Button>
    </div>
  );
}
