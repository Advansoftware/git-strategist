'use client';

import { useSkills } from '@/hooks/use-skills';
import { useToast } from '@/hooks/use-toast';
import { useChatHandler } from '@/hooks/use-chat-handler';

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
import { KnowledgeBaseManager } from '@/components/knowledge-base-manager';
import { Logo } from '@/components/logo';
import { ChatInterface } from '@/components/chat-interface';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const { skills, addMultipleSkills, isLoaded: skillsLoaded } = useSkills();
  const { toast } = useToast();

  const {
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
  } = useChatHandler({ skills: skillsLoaded ? skills : [] });

  const handleAddSkills = (newSkills: string[]) => {
    addMultipleSkills(newSkills);
    toast({
      title: "Habilidades Atualizadas",
      description: "Novas habilidades foram adicionadas ao seu perfil.",
    });
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo className="text-sidebar-foreground text-xl" />
        </SidebarHeader>
        <SidebarContent>
          <SkillManager />
          <Separator className="my-2 bg-sidebar-border" />
          <KnowledgeBaseManager />
        </SidebarContent>
        <SidebarFooter>
          <p className="text-xs text-center text-sidebar-foreground/50">© 2024 Gig Strategist</p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <header className="p-4 border-b flex items-center gap-4 shrink-0 h-16">
            <SidebarTrigger />
            <div className="flex-grow" />
          </header>
          <ChatInterface
            messages={messages}
            isLoading={isLoading || !skillsLoaded}
            handleFormSubmit={handleFormSubmit}
            prompt={prompt}
            setPrompt={setPrompt}
            minBudget={minBudget}
            setMinBudget={setMinBudget}
            maxBudget={maxBudget}
            setMaxBudget={setMaxBudget}
            minPossibleBudget={minPossibleBudget}
            setMinPossibleBudget={setMinPossibleBudget}
            onAddSkills={handleAddSkills}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
