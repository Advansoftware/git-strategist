'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, Trash2, Loader2, Upload, Star, RefreshCcw, AlertCircle } from 'lucide-react';
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
  getKnowledgeBaseProposalDetails,
  getKnowledgeBaseSyncStatus,
  syncKnowledgeBase,
} from '@/lib/actions';

type KBProposal = {
  id: string;
  createdAt: string;
  projectValue?: string;
  tags: string[];
  overallScore: number;
  qualificationSummary: string;
};

type ProposalDetails = {
  id: string;
  createdAt: string;
  projectValue?: string;
  tags: string[];
  analysis: {
    overallScore: number;
    qualificationSummary: string;
    valueQualification: string;
    hookType: string;
    persuasionTechnique: string;
    ctaStrength: string;
    uniqueStrengths: string[];
  };
  content: string;
};

type SyncStatus = {
  total: number;
  outOfSync: number;
  missingGemini: number;
  missingOpenAI: number;
};

export function KnowledgeBaseManager() {
  const { toast } = useToast();
  const [proposals, setProposals] = useState<KBProposal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Details Modal State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedProposalDetails, setSelectedProposalDetails] = useState<ProposalDetails | null>(null);

  // Form state
  const [proposalText, setProposalText] = useState('');
  const [projectValue, setProjectValue] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const loadProposals = useCallback(async () => {
    try {
      const [data, status] = await Promise.all([
        getKnowledgeBaseProposals(),
        getKnowledgeBaseSyncStatus()
      ]);
      setProposals(data);
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to load KB data:', error);
    } finally {
      setIsLoaded(true);
    }
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

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
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

  const handleViewDetails = async (id: string) => {
    setIsLoadingDetails(true);
    setIsDetailsOpen(true);
    try {
      const details = await getKnowledgeBaseProposalDetails(id);
      setSelectedProposalDetails(details as ProposalDetails | null);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao carregar os detalhes da proposta.',
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncKnowledgeBase();
      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Erro na sincronização',
          description: result.error,
        });
      } else {
        toast({
          title: 'Sincronização concluída!',
          description: `Foram sincronizadas ${result.synchronized} propostas.`,
        });
        await loadProposals();
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao sincronizar memórias.',
      });
    } finally {
      setIsSyncing(false);
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
          <div className="flex items-center gap-1.5 ml-auto">
            {syncStatus && syncStatus.outOfSync > 0 && (
              <Badge variant="destructive" className="text-[9px] h-4 px-1 flex items-center gap-0.5 animate-pulse">
                <AlertCircle className="size-2" />
                {syncStatus.outOfSync}
              </Badge>
            )}
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              {proposals.length}
            </Badge>
          </div>
        )}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="flex gap-2 mb-3">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Adicionar à Base de Aprendizado
                </DialogTitle>
                <DialogDescription>
                  Cole uma proposta vencedora. A IA vai analisar os pontos fortes e usar como referência.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="proposal-text">Texto da Proposta *</Label>
                  <Textarea
                    id="proposal-text"
                    placeholder="Cole o texto aqui..."
                    value={proposalText}
                    onChange={(e) => setProposalText(e.target.value)}
                    className="min-h-[150px]"
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
                  <Input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={isSaving}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave} disabled={isSaving || !proposalText.trim()}>
                  {isSaving ? <Loader2 className="animate-spin" /> : 'Salvar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {syncStatus && syncStatus.outOfSync > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              className="gap-2 bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20"
            >
              <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync ({syncStatus.outOfSync})
            </Button>
          )}
        </div>

        <Dialog open={isDetailsOpen} onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) setTimeout(() => setSelectedProposalDetails(null), 300);
        }}>
          <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0 text-foreground">
            <DialogHeader className="p-6 pb-4 border-b shrink-0">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <BookOpen className="h-5 w-5 text-primary" />
                Detalhes da Proposta
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 p-6">
              {isLoadingDetails ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p>Buscando detalhes...</p>
                </div>
              ) : selectedProposalDetails ? (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`px-2 py-0.5 text-sm gap-1 ${getScoreColor(selectedProposalDetails.analysis.overallScore)}`}>
                        <Star className="h-4 w-4 fill-current" />
                        Score: {selectedProposalDetails.analysis.overallScore}/10
                      </Badge>
                      {selectedProposalDetails.projectValue && (
                        <Badge variant="secondary" className="px-2 py-0.5 text-sm text-foreground">
                          Valor: {selectedProposalDetails.projectValue}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">Tags Identificadas</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProposalDetails.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="bg-muted/50 text-foreground">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="space-y-4 rounded-lg bg-muted/50 p-4 border text-sm">
                        <div>
                          <span className="font-semibold block mb-1">Qualificação Geral:</span>
                          <span className="text-muted-foreground">{selectedProposalDetails.analysis.qualificationSummary}</span>
                        </div>
                        <div>
                          <span className="font-semibold block mb-1">Qualificação de Valor:</span>
                          <span className="text-muted-foreground">{selectedProposalDetails.analysis.valueQualification}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4 rounded-lg bg-muted/50 p-4 border text-sm">
                        <div>
                          <span className="font-semibold block mb-1">Tipo de Hook:</span>
                          <span className="text-muted-foreground">{selectedProposalDetails.analysis.hookType}</span>
                        </div>
                        <div>
                          <span className="font-semibold block mb-1">Técnica:</span>
                          <span className="text-muted-foreground">{selectedProposalDetails.analysis.persuasionTechnique}</span>
                        </div>
                        <div>
                          <span className="font-semibold block mb-1">CTA:</span>
                          <span className="text-muted-foreground">{selectedProposalDetails.analysis.ctaStrength}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Conteúdo Original</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 p-4 rounded-lg border whitespace-pre-wrap font-mono text-xs text-foreground">
                      {selectedProposalDetails.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">Nenhum detalhe.</div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-2">
          {!isLoaded ? (
            <SidebarMenuSkeleton className="h-12 w-full" />
          ) : proposals.length > 0 ? (
            proposals.map((p) => (
              <div
                key={p.id}
                className="relative group p-2.5 rounded-lg bg-sidebar-accent/50 border border-sidebar-border text-sm cursor-pointer hover:bg-sidebar-accent transition-colors"
                onClick={() => handleViewDetails(p.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Badge className={`text-[10px] h-5 px-1.5 ${getScoreColor(p.overallScore)}`}>
                      {p.overallScore}
                    </Badge>
                    <span className="text-xs font-medium truncate">{p.projectValue || 'S/ Valor'}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                    onClick={(e) => handleDelete(e, p.id)}
                    disabled={deletingId === p.id}
                  >
                    {deletingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[9px] h-4 px-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground px-2">Nenhuma proposta na base.</p>
          )}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
