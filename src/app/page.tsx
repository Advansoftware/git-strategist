'use client';

import { useState, useRef, useEffect } from 'react';
import { getProjectAnalysis } from '@/lib/actions';
import { useSkills } from '@/hooks/use-skills';
import { useToast } from '@/hooks/use-toast';
import type { ProjectAnalysis } from '@/lib/types';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SkillManager } from '@/components/skill-manager';
import { Logo } from '@/components/logo';
import { ChatForm } from '@/components/chat-form';
import { ResultsView } from '@/components/results-view';
import { WelcomeView } from '@/components/welcome-view';
import { Skeleton } from '@/components/ui/skeleton';
import { UserMessage } from '@/components/user-message';
import { AssistantMessage } from '@/components/assistant-message';


type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string | ProjectAnalysis;
};

export default function Home() {
  const { skills, addMultipleSkills, isLoaded: skillsLoaded } = useSkills();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [minBudget, setMinBudget] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [minPossibleBudget, setMinPossibleBudget] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim() || !skillsLoaded) return;

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

    const result = await getProjectAnalysis(currentPrompt, skills, min, max, minPossible);

    if ('error' in result) {
      toast({
        variant: 'destructive',
        title: 'Ocorreu um erro',
        description: result.error,
      });
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

  const handleAddSkills = (newSkills: string[]) => {
    addMultipleSkills(newSkills);
    toast({
        title: "Habilidades Atualizadas",
        description: "Novas habilidades foram adicionadas ao seu perfil.",
    });
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo className="text-sidebar-foreground text-xl" />
        </SidebarHeader>
        <SidebarContent>
          <SkillManager />
        </SidebarContent>
        <SidebarFooter>
            <p className="text-xs text-center text-sidebar-foreground/50">© 2024 Gig Strategist</p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen bg-background">
           <header className="p-4 border-b flex items-center gap-4 shrink-0 h-16">
            <SidebarTrigger />
            <div className="flex-grow" />
            <div className="flex-grow" />
          </header>
          <main ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto h-full flex flex-col">
              <div className="flex-1 space-y-8">
                {messages.length === 0 && !isLoading ? (
                  <WelcomeView />
                ) : (
                  messages.map((message) => (
                    <div key={message.id}>
                      {message.role === 'user' && typeof message.content === 'string' && (
                        <UserMessage prompt={message.content} />
                      )}
                      {message.role === 'assistant' && typeof message.content !== 'string' && (
                        <AssistantMessage>
                            <ResultsView analysis={message.content} onAddSkills={handleAddSkills} />
                        </AssistantMessage>
                      )}
                    </div>
                  ))
                )}
                {isLoading && (
                    <AssistantMessage>
                        <div className="space-y-6">
                            <Skeleton className="h-24 w-full rounded-xl" />
                            <Skeleton className="h-64 w-full rounded-xl" />
                            <Skeleton className="h-32 w-full rounded-xl" />
                        </div>
                    </AssistantMessage>
                )}
              </div>

              <div className="sticky bottom-0 mt-8 pb-4 bg-gradient-to-t from-background via-background/90 to-transparent">
                <ChatForm
                  onSubmit={handleFormSubmit}
                  prompt={prompt}
                  setPrompt={setPrompt}
                  isLoading={isLoading}
                  minBudget={minBudget}
                  setMinBudget={setMinBudget}
                  maxBudget={maxBudget}
                  setMaxBudget={setMaxBudget}
                  minPossibleBudget={minPossibleBudget}
                  setMinPossibleBudget={setMinPossibleBudget}
                />
              </div>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
