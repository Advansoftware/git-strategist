'use client';

import { useState } from 'react';
import { Award, Plus, X, Loader2 } from 'lucide-react';

import { useSkills } from '@/hooks/use-skills';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';

export function SkillManager() {
  const { toast } = useToast();
  const { skills, addSkill, removeSkill, isLoaded } = useSkills();
  const [newSkill, setNewSkill] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingSkill, setRemovingSkill] = useState<string | null>(null);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    
    setIsAdding(true);
    try {
      const result = await addSkill(newSkill.trim());
      if (result && 'error' in result) {
        toast({
          variant: 'destructive',
          title: 'Erro ao adicionar',
          description: result.error,
        });
      } else {
        setNewSkill('');
        toast({
          title: 'Habilidade adicionada!',
          description: `"${newSkill.trim()}" foi salva no seu perfil.`,
        });
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveSkill = async (skill: string) => {
    setRemovingSkill(skill);
    try {
      const result = await removeSkill(skill);
      if (result && 'error' in result) {
        toast({
          variant: 'destructive',
          title: 'Erro ao remover',
          description: result.error,
        });
      } else {
        toast({
          title: 'Habilidade removida',
        });
      }
    } finally {
      setRemovingSkill(null);
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
            onKeyDown={(e) => e.key === 'Enter' && !isAdding && handleAddSkill()}
            disabled={isAdding}
            className="h-9 bg-sidebar-accent text-sidebar-accent-foreground placeholder:text-sidebar-accent-foreground/60 border-sidebar-border focus:bg-background focus:text-foreground"
          />
          <Button 
            variant="default" 
            size="icon" 
            className="h-9 w-9 shrink-0 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" 
            onClick={handleAddSkill}
            disabled={isAdding || !newSkill.trim()}
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
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
            skills.map((skill, index) => (
              <Badge key={`${skill}-${index}`} variant="secondary" className="bg-sidebar-accent text-sidebar-accent-foreground text-sm">
                {skill}
                <button 
                  onClick={() => !removingSkill && handleRemoveSkill(skill)} 
                  disabled={removingSkill === skill}
                  className="ml-1.5 rounded-full p-0.5 hover:bg-sidebar-accent-foreground/20 disabled:opacity-50"
                >
                  {removingSkill === skill ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
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
