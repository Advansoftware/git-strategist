'use client';

import { User, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAbout } from '@/hooks/use-about';

export function AboutSettings() {
  const { toast } = useToast();
  const { content, setContent, save, isLoaded, isSaving } = useAbout();

  const handleSave = async () => {
    const result = await save();
    if (result && 'error' in result) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: result.error,
      });
    } else {
      toast({
        title: 'Sobre Mim salvo',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
    }
  };

  if (!isLoaded) {
    return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground border">
        <p>
          Descreva sua trajetória, experiências, projetos anteriores, ferramentas que domina,
          áreas de expertise e tudo que possa ajudar a IA a gerar análises mais precisas
          sobre prazos e esforço necessário.
        </p>
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`Exemplo:\n\n## Experiência\n- 5 anos com desenvolvimento web\n- Especialista em React e Next.js\n\n## Projetos Relevantes\n- E-commerce completo com Next.js + Stripe\n- SaaS de gestão de equipes\n\n## Ferramentas\n- Git, Docker, PostgreSQL\n- Figma para design\n\n## Observações\n- Mais comfortable com frontend do que backend\n- Prefiro projetos com prazos flexíveis`}
        className="min-h-[400px] font-mono text-sm"
        disabled={isSaving}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {content.length} caracteres · Salvo em src/data/about.md
        </span>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar
        </Button>
      </div>
    </div>
  );
}
