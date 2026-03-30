'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, Trash2, Loader2, Upload, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import {
  saveProposalToKnowledgeBase,
  getKnowledgeBaseProposals,
  deleteProposalFromKnowledgeBase,
} from '@/lib/actions';

type KBProposal = {
  id: string;
  createdAt: string;
  projectValue?: string;
  tags: string[];
  overallScore: number;
  qualificationSummary: string;
};

export function KnowledgeBaseManager() {
  const { toast } = useToast();
  const [proposals, setProposals] = useState<KBProposal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [proposalText, setProposalText] = useState('');
  const [projectValue, setProjectValue] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const loadProposals = useCallback(async () => {
    const data = await getKnowledgeBaseProposals();
    setProposals(data);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else if (file) {
      toast({
        variant: 'destructive',
        title: 'Arquivo inválido',
        description: 'Apenas arquivos PDF são aceitos.',
      });
      e.target.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:application/pdf;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    if (!proposalText.trim()) return;

    setIsSaving(true);
    try {
      let pdfBase64: string | undefined;
      if (pdfFile) {
        pdfBase64 = await fileToBase64(pdfFile);
      }

      const result = await saveProposalToKnowledgeBase(proposalText, projectValue, pdfBase64);

      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Erro ao salvar',
          description: result.error,
        });
      } else {
        toast({
          title: `Proposta salva! Score: ${result.analysis.overallScore}/10`,
          description: result.analysis.qualificationSummary,
        });
        // Reset form and close
        setProposalText('');
        setProjectValue('');
        setPdfFile(null);
        setIsOpen(false);
        await loadProposals();
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha inesperada ao processar proposta.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await deleteProposalFromKnowledgeBase(id);
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Erro ao remover',
          description: result.error,
        });
      } else {
        toast({ title: 'Proposta removida da base.' });
        await loadProposals();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500/10 text-green-600 border-green-500/20';
    if (score >= 5) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    return 'bg-red-500/10 text-red-600 border-red-500/20';
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <BookOpen className="size-4" />
        Base de Aprendizado
        {isLoaded && proposals.length > 0 && (
          <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5">
            {proposals.length}
          </Badge>
        )}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full mb-3 gap-2 bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Adicionar Proposta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Adicionar à Base de Aprendizado
              </DialogTitle>
              <DialogDescription>
                Cole uma proposta vencedora. A IA vai analisar os pontos fortes, qualificar o valor e usar como referência para gerar propostas futuras.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="proposal-text">Texto da Proposta *</Label>
                <Textarea
                  id="proposal-text"
                  placeholder="Cole aqui o texto completo da proposta vencedora..."
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  className="min-h-[150px] resize-y"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-value">Valor do Projeto (R$)</Label>
                <Input
                  id="project-value"
                  placeholder="Ex: R$ 2.500"
                  value={projectValue}
                  onChange={(e) => setProjectValue(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdf-upload">Anexar PDF (opcional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={isSaving}
                    className="text-sm"
                  />
                  {pdfFile && (
                    <Badge variant="secondary" className="shrink-0 gap-1">
                      <Upload className="h-3 w-3" />
                      {pdfFile.name.slice(0, 20)}{pdfFile.name.length > 20 ? '...' : ''}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  O PDF será lido pela IA e o texto extraído será salvo como anexo. O arquivo PDF não é armazenado.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSave}
                disabled={isSaving || !proposalText.trim()}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    IA analisando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Salvar e Analisar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="space-y-2">
          {!isLoaded ? (
            <>
              <SidebarMenuSkeleton className="h-12 w-full rounded-lg bg-sidebar-accent/50" />
              <SidebarMenuSkeleton className="h-12 w-full rounded-lg bg-sidebar-accent/50" />
            </>
          ) : proposals.length > 0 ? (
            proposals.map((p) => (
              <div
                key={p.id}
                className="relative group p-2.5 rounded-lg bg-sidebar-accent/50 border border-sidebar-border text-sm space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Badge className={`shrink-0 text-[10px] h-5 px-1.5 gap-0.5 ${getScoreColor(p.overallScore)}`}>
                      <Star className="h-2.5 w-2.5" />
                      {p.overallScore}
                    </Badge>
                    <span className="text-xs font-medium text-sidebar-foreground truncate">
                      {p.projectValue || 'S/ Valor'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                  >
                    {deletingId === p.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {p.tags.slice(0, 4).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[10px] h-4 px-1 bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-[10px] text-sidebar-foreground/60 leading-snug line-clamp-2">
                  {p.qualificationSummary}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-sidebar-foreground/70 px-2">
              Nenhuma proposta na base ainda. Adicione propostas vencedoras para melhorar a geração da IA.
            </p>
          )}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
