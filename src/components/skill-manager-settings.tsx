'use client';

import { useState } from 'react';
import { Plus, X, Loader2, Search } from 'lucide-react';

import { useSkills } from '@/hooks/use-skills';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function SkillManagerSettings() {
  const { toast } = useToast();
  const { skills, addSkill, removeSkill, isLoaded } = useSkills();
  const [newSkill, setNewSkill] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingSkill, setRemovingSkill] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSkills = skills.filter((skill) =>
    skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="space-y-4">
      {/* Add skill row */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Adicionar nova habilidade..."
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isAdding && handleAddSkill()}
          disabled={isAdding}
        />
        <Button onClick={handleAddSkill} disabled={isAdding || !newSkill.trim()}>
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Adicionar
        </Button>
      </div>

      {/* Search/filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Buscar habilidades... (${skills.length} no perfil)`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Skills grid */}
      <div className="flex flex-wrap gap-2">
        {!isLoaded ? (
          <p className="text-sm text-muted-foreground">Carregando habilidades...</p>
        ) : filteredSkills.length > 0 ? (
          filteredSkills.map((skill, index) => (
            <Badge
              key={`${skill}-${index}`}
              variant="secondary"
              className="text-sm py-1.5 px-3 gap-1.5"
            >
              {skill}
              <button
                onClick={() => !removingSkill && handleRemoveSkill(skill)}
                disabled={removingSkill === skill}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 disabled:opacity-50"
              >
                {removingSkill === skill ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </button>
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? 'Nenhuma habilidade encontrada.'
              : 'Nenhuma habilidade adicionada ainda.'}
          </p>
        )}
      </div>
    </div>
  );
}
