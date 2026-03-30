'use server';
/**
 * @fileOverview A Genkit flow that deconstructs a proposal to extract its
 * structural strengths, persuasion techniques, and quality score.
 * Runs once during knowledge base ingest.
 */

import { ai, geminiModel } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeInputSchema = z.object({
  proposalText: z.string().describe('The full text of the reference proposal.'),
  projectValue: z.string().optional().describe('The monetary value charged for this project (e.g. "R$ 2.500"). Optional if not provided.'),
});

const ProposalAnalysisSchema = z.object({
  hookType: z
    .string()
    .describe('Tipo de gancho usado para abrir a proposta (ex: "Pergunta direta", "Prova de autoridade", "Empatia com a dor", "Dado impactante").'),
  persuasionTechnique: z
    .string()
    .describe('Técnica de persuasão principal (ex: "Escassez", "Prova social", "Reciprocidade", "Especificidade técnica", "Ancoragem de preço").'),
  toneOfVoice: z
    .string()
    .describe('Tom de voz da proposta (ex: "Formal", "Casual-profissional", "Técnico-didático", "Consultivo").'),
  ctaStrength: z
    .string()
    .describe('Como a proposta convida à ação no final (ex: "Pergunta estratégica", "Convite direto", "Oferta limitada", "Próximos passos claros").'),
  uniqueStrengths: z
    .array(z.string())
    .describe('Lista de pontos fortes únicos dessa proposta (ex: "Transparência de prazo", "Oferta de otimização como bônus", "Menção de benchmark").'),
  valueQualification: z
    .string()
    .describe('Qualificação do valor cobrado em relação ao escopo e mercado (ex: "Coerente com o escopo", "Abaixo do mercado", "Acima do mercado mas justificado", "Competitivo").'),
  qualificationSummary: z
    .string()
    .describe('Uma frase resumindo a qualidade geral da proposta como referência para futuras propostas.'),
  tags: z
    .array(z.string())
    .describe('3 a 5 palavras-chave do nicho/contexto da proposta (ex: "react", "ecommerce", "landing-page", "wordpress", "mobile").'),
  overallScore: z
    .number()
    .describe('Nota geral de 1 a 10 de quão boa é essa proposta como referência para gerar novas propostas vencedoras.'),
});

export type ProposalAnalysis = z.infer<typeof ProposalAnalysisSchema>;

const analyzePrompt = ai.definePrompt({
  name: 'analyzeProposalStrengthsPrompt',
  input: { schema: AnalyzeInputSchema },
  output: { schema: ProposalAnalysisSchema },
  prompt: `Você é um analista sênior de copywriting B2B e precificação freelance com 15 anos de experiência avaliando propostas comerciais.

Sua tarefa é desconstruir a proposta abaixo e extrair os "segredos" que a tornam eficaz (ou identificar suas fraquezas).

**PROPOSTA:**
{{{proposalText}}}

{{#if projectValue}}**VALOR COBRADO:** {{{projectValue}}}{{/if}}

Analise com profundidade:

1. **Tipo de Gancho (hookType):** Como ela abre? Identifique a técnica: pergunta direta ao cliente, prova de autoridade, empatia com a dor do cliente, dado impactante, apresentação pessoal etc.

2. **Técnica de Persuasão (persuasionTechnique):** Qual o gatilho psicológico principal? Escassez ("estou disponível só até X"), prova social ("já fiz N projetos"), reciprocidade ("posso fazer uma análise grátis"), especificidade técnica ("usarei Next.js com SSR para SEO"), ancoragem de preço etc.

3. **Tom de Voz (toneOfVoice):** É formal? Casual-profissional? Técnico-didático? Consultivo? Identifique com precisão.

4. **Força do CTA (ctaStrength):** Como ela fecha? Pergunta que abre negociação? Convite direto para call? Oferta limitada? Próximos passos numerados?

5. **Pontos Fortes Únicos (uniqueStrengths):** Liste cada detalhe diferenciador: transparência de prazo, oferta de bônus, menção de métricas/benchmark, garantia, segmentação técnica etc.

6. **Qualificação do Valor (valueQualification):** {{#if projectValue}}O valor de {{{projectValue}}} é coerente com o escopo descrito? Está acima, abaixo ou alinhado ao mercado?{{else}}Não há valor informado. Estime brevemente quão "premium" ou "barato" o escopo parece ser independentemente do valor.{{/if}}

7. **Resumo de Qualificação (qualificationSummary):** Uma frase objetiva resumindo por que essa proposta é boa, regular ou fraca como referência.

8. **Tags (tags):** 3 a 5 palavras-chave do nicho/tecnologia (em lowercase).

9. **Nota Geral (overallScore):** De 1 a 10, quão útil é esta proposta como referência para gerar futuras propostas vencedoras?

Seja rigoroso e honesto na avaliação.`,
});

const analyzeFlow = ai.defineFlow(
  {
    name: 'analyzeProposalStrengthsFlow',
    inputSchema: AnalyzeInputSchema,
    outputSchema: ProposalAnalysisSchema,
  },
  async (input) => {
    const { output } = await analyzePrompt(input, { model: geminiModel });
    if (!output) {
      throw new Error('Failed to analyze proposal strengths.');
    }
    return output;
  }
);

export async function analyzeProposalStrengths(
  proposalText: string,
  projectValue?: string
): Promise<ProposalAnalysis> {
  return analyzeFlow({ proposalText, projectValue });
}
