import { ProjectAnalysis } from './types';

/**
 * Generates a structured Markdown string from the project analysis data.
 */
export function generateProposalMarkdown(analysis: ProjectAnalysis): string {
  const { strategy, gaps, effort, price, proposal, brunoProposal } = analysis;

  const sections = [
    `# Estratégia de Proposta: ${strategy.projectDifficulty} - ${price.suggestedPrice || 'Preço sob consulta'}`,
    '',
    '## 📊 Resumo Executivo',
    `- **Preço Sugerido:** ${price.suggestedPrice || 'Não especificado'}`,
    `- **Esforço Estimado:** ${strategy.recommendedTimeCommitment || effort.timeCommitment}`,
    `- **Complexidade:** ${strategy.projectDifficulty || effort.complexityRating}`,
    '',
    '---',
    '',
    '## 🚀 Proposta Final (Padrão Bruno)',
    '> Esta é a versão final para envio, otimizada para conversão.',
    '',
    brunoProposal.proposal,
    '',
    `*Referências da base de aprendizado utilizadas: ${brunoProposal.referencesUsed}*`,
    '',
    '---',
    '',
    '## 🏗️ Plano de Execução (Fases)',
    strategy.executionPlan.map((step, i) => `${i + 1}. ${step}`).join('\n'),
    '',
    '---',
    '',
    '## 🧠 Estrutura Lógica sugerida',
    proposal.sections.map(section => `### ${section.title}\n${section.suggestedText}`).join('\n\n'),
    '',
    '---',
    '',
    '## 🛠️ Sugestões de Recursos e Ferramentas',
    strategy.resourceSuggestions.map(res => `- ${res}`).join('\n'),
    '',
    '---',
    '',
    '## ⚠️ Desafios Potenciais e Mitigação',
    strategy.potentialChallenges.map(challenge => `- ${challenge}`).join('\n'),
    '',
    '---',
    '',
    '## 🎓 Gaps de Habilidades e Explicação',
    gaps.missingSkills.length > 0 
      ? `**Habilidades Sugeridas:**\n${gaps.missingSkills.map(s => `- ${s}`).join('\n')}`
      : 'Nenhuma habilidade crítica identificada como gap para este projeto.',
    '',
    gaps.explanation ? `**Análise de Gaps:**\n${gaps.explanation}` : '',
    '',
    '---',
    '',
    `*Gerado por Gig Strategist em ${new Date().toLocaleDateString('pt-BR')}*`
  ];

  return sections.join('\n');
}
