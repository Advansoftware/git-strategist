'use client';

import { useState } from 'react';
import { Award, Plus, X } from 'lucide-react';

import { useSkills } from '@/hooks/use-skills';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';

export function SkillManager() {
  const { skills, addSkill, removeSkill, isLoaded } = useSkills();
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      addSkill(newSkill.trim());
      setNewSkill('');
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <Award className="size-4" />
        Minhas Habilidades
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Adicionar nova habilidade..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
            className="h-9 bg-sidebar-background text-sidebar-foreground placeholder:text-sidebar-foreground/60 ring-1 ring-sidebar-border focus:bg-white focus:text-card-foreground"
          />
          <Button variant="primary" size="icon" className="h-9 w-9 shrink-0 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" onClick={handleAddSkill}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {!isLoaded ? (
            <>
              <SidebarMenuSkeleton className="h-6 w-20 rounded-full bg-sidebar-accent/50" />
              <SidebarMenuSkeleton className="h-6 w-24 rounded-full bg-sidebar-accent/50" />
              <SidebarMenuSkeleton className="h-6 w-16 rounded-full bg-sidebar-accent/50" />
            </>
          ) : skills.length > 0 ? (
            skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="bg-sidebar-accent text-sidebar-accent-foreground text-sm">
                {skill}
                <button onClick={() => removeSkill(skill)} className="ml-1.5 rounded-full p-0.5 hover:bg-sidebar-accent-foreground/20">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-xs text-sidebar-foreground/70 px-2">Nenhuma habilidade adicionada ainda. Adicione habilidades para melhorar a análise da IA.</p>
          )}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
