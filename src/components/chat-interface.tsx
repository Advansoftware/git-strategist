'use client';

import { useRef, useEffect } from 'react';
import { WelcomeView } from '@/components/welcome-view';
import { UserMessage } from '@/components/user-message';
import { AssistantMessage } from '@/components/assistant-message';
import { ResultsView } from '@/components/results-view';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatForm } from '@/components/chat-form';
import type { ProjectAnalysis } from '@/lib/types';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string | ProjectAnalysis;
};

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  handleFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  minBudget: string;
  setMinBudget: (value: string) => void;
  maxBudget: string;
  setMaxBudget: (value: string) => void;
  minPossibleBudget: string;
  setMinPossibleBudget: (value: string) => void;
  onAddSkills: (skills: string[]) => void;
}

export function ChatInterface({
  messages,
  isLoading,
  handleFormSubmit,
  prompt,
  setPrompt,
  minBudget,
  setMinBudget,
  maxBudget,
  setMaxBudget,
  minPossibleBudget,
  setMinPossibleBudget,
  onAddSkills,
}: ChatInterfaceProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isChatEmpty = messages.length === 0 && !isLoading;

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <main ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className={`flex-1 space-y-8 ${isChatEmpty ? 'flex flex-col justify-center' : ''}`}>
            {isChatEmpty ? (
              <WelcomeView />
            ) : (
              messages.map((message) => (
                <div key={message.id}>
                  {message.role === 'user' && typeof message.content === 'string' && (
                    <UserMessage prompt={message.content} />
                  )}
                  {message.role === 'assistant' && typeof message.content !== 'string' && (
                    <AssistantMessage>
                      <ResultsView analysis={message.content} onAddSkills={onAddSkills} />
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
  );
}
