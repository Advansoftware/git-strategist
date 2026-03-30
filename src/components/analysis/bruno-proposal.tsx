'use client';

import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sparkles, Copy, Check, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { BrunoProposalOutput } from '@/ai/flows/bruno-proposal-pattern';

interface BrunoProposalProps {
  proposal: BrunoProposalOutput;
}

export function BrunoProposal({ proposal }: BrunoProposalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(proposal.proposal);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "A proposta foi copiada para a área de transferência.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AccordionItem value="bruno-proposal" className="border-accent/20 bg-accent/5 rounded-lg px-4 mb-4">
      <AccordionTrigger className="text-lg font-bold hover:no-underline text-accent">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5" />
          Proposta Matadora (Alta Conversão)
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 pb-6 space-y-4">
        {proposal.referencesUsed > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 gap-1.5">
              <Database className="h-3 w-3" />
              Baseada em {proposal.referencesUsed} proposta{proposal.referencesUsed > 1 ? 's' : ''} da sua Base de Aprendizado
            </Badge>
          </div>
        )}
        <div className="relative group">
          <div className="text-base p-6 bg-background rounded-xl border-2 border-accent/20 shadow-sm whitespace-pre-wrap leading-relaxed font-sans">
            {proposal.proposal}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground italic">
          {proposal.referencesUsed > 0
            ? '* Proposta otimizada com padrões extraídos da sua base de conhecimento.'
            : '* Esta proposta segue o padrão Bruno com exemplos fixos. Adicione propostas à Base de Aprendizado para resultados ainda melhores.'}
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}
