'use client';

import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { ChatInterface } from '@/components/chat-interface';
import { AIProviderToggle } from '@/components/ai-provider-toggle';

export default function Home() {
  const router = useRouter();
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
        <SidebarContent />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button onClick={() => router.push('/settings')}>
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <header className="p-4 border-b flex items-center justify-between shrink-0 h-16">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
            </div>
            <AIProviderToggle />
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
