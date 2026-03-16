import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface BrunoProposalProps {
  proposal: string;
}

export function BrunoProposal({ proposal }: BrunoProposalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(proposal);
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
          Proposta Padrão Bruno (Alta Conversão)
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 pb-6 space-y-4">
        <div className="relative group">
          <div className="text-base p-6 bg-background rounded-xl border-2 border-accent/20 shadow-sm whitespace-pre-wrap leading-relaxed font-sans">
            {proposal}
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
          * Esta proposta segue o padrão de 7 anos de experiência e alta taxa de aprovação do Bruno.
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}
