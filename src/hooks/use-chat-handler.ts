'use client';

import { useState, useEffect } from 'react';
import { getProjectAnalysis, getAbout } from '@/lib/actions';
import type { ProjectAnalysis } from '@/lib/types';
import { useToast } from './use-toast';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string | ProjectAnalysis;
};

type UseChatHandlerProps = {
  skills: string[];
};

export function useChatHandler({ skills }: UseChatHandlerProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [minBudget, setMinBudget] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [minPossibleBudget, setMinPossibleBudget] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userAbout, setUserAbout] = useState<string>('');

  useEffect(() => {
    getAbout().then((about) => setUserAbout(about)).catch(() => {});
  }, []);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
    };

    setMessages(prev => [...prev, userMessage]);

    const currentPrompt = prompt;
    setPrompt('');

    const min = minBudget ? parseFloat(minBudget) : undefined;
    const max = maxBudget ? parseFloat(maxBudget) : undefined;
    const minPossible = minPossibleBudget ? parseFloat(minPossibleBudget) : undefined;

    const result = await getProjectAnalysis(currentPrompt, skills, userAbout, min, max, minPossible);

    if ('error' in result) {
      toast({
        variant: 'destructive',
        title: 'Ocorreu um erro',
        description: result.error,
      });
      // Remove the user message if the API call fails
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } else {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result,
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
    setIsLoading(false);
  };

  return {
    prompt,
    setPrompt,
    minBudget,
    setMinBudget,
    maxBudget,
    setMaxBudget,
    minPossibleBudget,
    setMinPossibleBudget,
    messages,
    isLoading,
    handleFormSubmit,
  };
}
