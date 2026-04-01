'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, Trash2, Loader2, Star, RefreshCcw, AlertCircle } from 'lucide-react';
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

export function KnowledgeBaseSettings() {
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
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex items-center gap-2">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" className="gap-2">
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
                Cole uma proposta vencedora. A IA vai analisar os pontos fortes e usar como referência.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="proposal-text-kb">Texto da Proposta *</Label>
                <Textarea
                  id="proposal-text-kb"
                  placeholder="Cole o texto aqui..."
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  className="min-h-[150px]"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-value-kb">Valor do Projeto (R$)</Label>
                <Input
                  id="project-value-kb"
                  placeholder="Ex: R$ 2.500"
                  value={projectValue}
                  onChange={(e) => setProjectValue(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdf-upload-kb">Anexar PDF (opcional)</Label>
                <Input
                  id="pdf-upload-kb"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={isSaving}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={isSaving || !proposalText.trim()}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
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

        {syncStatus && (
          <span className="text-sm text-muted-foreground ml-auto">
            {syncStatus.total} propostas {syncStatus.outOfSync > 0 && `· ${syncStatus.outOfSync} fora de sync`}
          </span>
        )}
      </div>

      {/* Details Dialog */}
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

      {/* Proposals List */}
      {!isLoaded ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : proposals.length > 0 ? (
        <div className="space-y-2">
          {proposals.map((p) => (
            <div
              key={p.id}
              className="relative group p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handleViewDetails(p.id)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge className={`text-xs px-2 py-0.5 ${getScoreColor(p.overallScore)}`}>
                    {p.overallScore}/10
                  </Badge>
                  <span className="text-sm font-medium truncate">{p.projectValue || 'S/ Valor'}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                  onClick={(e) => handleDelete(e, p.id)}
                  disabled={deletingId === p.id}
                >
                  {deletingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {p.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <BookOpen className="h-10 w-10 mb-3 opacity-50" />
          <p>Nenhuma proposta na base.</p>
          <p className="text-xs mt-1">Adicione propostas vencedoras para treinar a IA.</p>
        </div>
      )}
    </div>
  );
}
