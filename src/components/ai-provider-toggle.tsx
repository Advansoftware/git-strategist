'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Loader2, Bot, Cpu } from 'lucide-react';
import { setAIProvider, getAIProvider } from '@/lib/actions';
import { cn } from '@/lib/utils';

type AIProvider = 'gemini' | 'openai' | 'openrouter' | 'ollama';

export function AIProviderToggle() {
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function load() {
      const current = await getAIProvider();
      setProvider(current as AIProvider);
    }
    load();
  }, []);

  const handleToggle = (next: AIProvider) => {
    setProvider(next);
    startTransition(async () => {
      await setAIProvider(next);
    });
  };

  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg border shadow-sm overflow-x-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => provider !== 'gemini' && handleToggle('gemini')}
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
        Gemini
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => provider !== 'openai' && handleToggle('openai')}
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
        OpenAI
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => provider !== 'openrouter' && handleToggle('openrouter')}
        className={cn(
          "h-8 px-3 text-xs gap-1.5 transition-all duration-200",
          provider === 'openrouter' 
            ? "bg-background text-foreground shadow-sm hover:bg-background" 
            : "text-muted-foreground hover:bg-transparent"
        )}
        disabled={isPending}
      >
        {isPending && provider === 'openrouter' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Bot className={cn("h-3.5 w-3.5", provider === 'openrouter' ? "text-purple-500" : "")} />
        )}
        OpenRouter
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => provider !== 'ollama' && handleToggle('ollama')}
        className={cn(
          "h-8 px-3 text-xs gap-1.5 transition-all duration-200",
          provider === 'ollama' 
            ? "bg-background text-foreground shadow-sm hover:bg-background" 
            : "text-muted-foreground hover:bg-transparent"
        )}
        disabled={isPending}
      >
        {isPending && provider === 'ollama' ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Cpu className={cn("h-3.5 w-3.5", provider === 'ollama' ? "text-emerald-500" : "")} />
        )}
        Ollama
      </Button>
    </div>
  );
}
