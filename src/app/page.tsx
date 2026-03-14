'use client';

import { useState } from 'react';
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

export default function Home() {
  const { skills, addMultipleSkills, isLoaded: skillsLoaded } = useSkills();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim() || !skillsLoaded) return;

    setIsLoading(true);
    setAnalysis(null);

    const result = await getProjectAnalysis(prompt, skills);

    if ('error' in result) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: result.error,
      });
    } else {
      setAnalysis(result);
    }
    setIsLoading(false);
  };

  const handleAddSkills = (newSkills: string[]) => {
    addMultipleSkills(newSkills);
    toast({
        title: "Skills Updated",
        description: "New skills have been added to your profile.",
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
        <div className="flex flex-col h-screen">
          <header className="p-4 border-b flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <div className="md:hidden">
                <Logo className="text-foreground text-xl" />
            </div>
            <h1 className="text-xl font-semibold font-headline hidden md:block">
              Project Strategy Dashboard
            </h1>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto h-full flex flex-col">
              <div className="flex-1 space-y-8">
                {isLoading ? (
                  <div className="space-y-6">
                     <Skeleton className="h-24 w-full rounded-xl" />
                     <Skeleton className="h-64 w-full rounded-xl" />
                     <Skeleton className="h-32 w-full rounded-xl" />
                  </div>
                ) : analysis ? (
                  <ResultsView analysis={analysis} onAddSkills={handleAddSkills} />
                ) : (
                  <WelcomeView />
                )}
              </div>

              <div className="sticky bottom-0 mt-8 pb-4 bg-gradient-to-t from-background via-background/90 to-transparent">
                <ChatForm
                  onSubmit={handleFormSubmit}
                  prompt={prompt}
                  setPrompt={setPrompt}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
