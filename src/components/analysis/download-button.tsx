'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ProjectAnalysis } from '@/lib/types';
import { generateProposalMarkdown } from '@/lib/export-utils';

interface DownloadProposalButtonProps {
  analysis: ProjectAnalysis;
}

export function DownloadProposalButton({ analysis }: DownloadProposalButtonProps) {
  const handleDownload = () => {
    const markdown = generateProposalMarkdown(analysis);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Create a filename based on the project difficulty or date
    const date = new Date().toISOString().split('T')[0];
    const filename = `proposta-gig-strategist-${date}.md`;
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button 
      onClick={handleDownload}
      variant="outline" 
      size="sm"
      className="flex items-center gap-2 border-primary/50 text-primary hover:bg-primary/10"
    >
      <Download className="h-4 w-4" />
      <span>Baixar Plano (.md)</span>
    </Button>
  );
}
