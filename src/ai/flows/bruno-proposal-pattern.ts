'use server';
/**
 * @fileOverview A Genkit flow for generating a proposal following Bruno's successful pattern.
 * Enhanced with Knowledge Base retrieval: fetches the top similar proposals
 * from the static KB and synthesizes the winning formula.
 */

import { ai, geminiModel } from '@/ai/genkit';
import { z } from 'genkit';
import { findSimilarProposals } from '@/lib/knowledge-base';
import type { ProposalAnalysis } from '@/ai/flows/analyze-proposal-strengths';

const BrunoProposalInputSchema = z.object({
  projectDescription: z.string().describe('A detailed description of the freelance project.'),
  userSkills: z.array(z.string()).describe("A list of the freelancer's relevant skills."),
  suggestedPrice: z.string().optional().describe('The estimated price for the project.'),
  timeCommitment: z.string().optional().describe('The estimated time commitment for the project.'),
  yearsOfExperience: z.number().optional().describe('Years of experience to mention.'),
});
export type BrunoProposalInput = z.infer<typeof BrunoProposalInputSchema>;

const BrunoProposalOutputSchema = z.object({
  proposal: z.string().describe('The generated proposal message.'),
  referencesUsed: z.number().describe('Number of KB references used to generate this proposal.'),
});
export type BrunoProposalOutput = z.infer<typeof BrunoProposalOutputSchema>;

// --- Fallback examples (used when KB is empty) ---
const FALLBACK_EXAMPLES = `
--- EXEMPLO 1 (Fixo) ---
"Ola, me chamo bruno full stack com 7 anos de experiencia no mercado, recentemente andei testando esse google ia studio, inclusive meu portifolio pode te dizer bastante sobre isso... até me adaptei bem com a ferramenta do google.
voce esta procurando alguem apenas para inserir imagem certo?
sobre o orçamento, orcei a 160 reais e em 1 dia por conta de não saber a quantidade de imagens, mas muito provavelmente vou levar menos de 1 dia.
a ideia é otimizar imagem por imagem comprimindo seu tamanho ao maximo sem perder qualidade, ou até mesmo otimizar para o tamanho exato necessario, assim obetendo uma melhor performace no carregamento da imagem e na sequencia subir para seu projeto. faz sentido para voce?"

--- EXEMPLO 2 (Fixo) ---
"Olá, boa noite, tudo bem? Sou Bruno desenvolvedor a 7 web anos, tenho bastante experiência com criação de website , e utilizo tecnologias atuais do mercado como nextjs que é perfeito para seu projeto.
Você precisa de um site responsivo com a apresentação da Alphawolf, apresentação do estúdio de games e destaque para o título em desenvolvimento, seria um portfólio. certo?
Estou oçando seu projeto em 260 por ser novo no workana em 6 dias, pois durante o horário comercial normalmente trabalha como CLT.
Atenciosamente, Bruno Antunes"
`;

// --- Prompt that uses KB references ---
const kbProposalPrompt = ai.definePrompt({
  name: 'kbBrunoProposalPrompt',
  input: {
    schema: z.object({
      projectDescription: z.string(),
      userSkills: z.array(z.string()),
      suggestedPrice: z.string().optional(),
      timeCommitment: z.string().optional(),
      yearsOfExperience: z.number().optional(),
      knowledgeBaseSection: z.string(),
      referencesCount: z.number(),
    }),
  },
  output: {
    schema: z.object({
      proposal: z.string(),
    }),
  },
  prompt: `Você é um Estrategista de Vendas B2B e Copywriter especializado em propostas freelance de tecnologia.
Você tem acesso a uma base de conhecimento com propostas vencedoras reais. Cada proposta foi analisada por um especialista que extraiu seus pontos fortes.

{{{knowledgeBaseSection}}}

---

**SUA MISSÃO:**
1. EXTRAIA o que há de MELHOR em cada proposta acima (gancho, técnica de persuasão, tom, CTA, diferenciais).
2. COMBINE os padrões vencedores em uma ÚNICA proposta nova e original.
3. ADAPTE 100% ao projeto abaixo. NÃO copie texto verbatim — inspire-se na estrutura e técnicas.
4. A proposta deve parecer NATURAL e HUMANA, como se o Bruno (desenvolvedor Full Stack com {{#if yearsOfExperience}}{{yearsOfExperience}}{{else}}7{{/if}} anos de experiência) estivesse escrevendo direto.

**PROJETO ATUAL:**
Descrição: {{{projectDescription}}}

**MINHAS HABILIDADES:**
{{#if userSkills}}
  {{#each userSkills}}- {{{this}}}
  {{/each}}
{{/if}}

**ESTIMATIVAS:**
{{#if suggestedPrice}}Preço sugerido: {{{suggestedPrice}}}{{/if}}
{{#if timeCommitment}}Tempo sugerido: {{{timeCommitment}}}{{/if}}

**ESTRUTURA OBRIGATÓRIA DA PROPOSTA:**
- **Gancho**: Vá direto ao ponto mostrando que entendeu o desafio principal do cliente. Use a melhor técnica de abertura encontrada na base de conhecimento.
- **Autoridade + Solução**: Demonstre segurança técnica e explique brevemente como vai resolver usando suas habilidades reais.
- **Entrega/Processo**: Dê uma visão de prazos, etapas ou como será trabalhar com você.
- **CTA (Call to Action)**: Termine com uma pergunta estratégica ou convite que abra a negociação naturalmente.

**RESTRIÇÕES:**
- NÃO use clichês corporativos ("soluções inovadoras", "agregar valor", "sinergia").
- NÃO invente experiências que não estão nas habilidades listadas.
- NÃO copie frases inteiras das propostas de referência.
- Seja CONCISO. Elimine palavras vazias.
- O tom deve ser profissional mas HUMANO e DIRETO.

Escreva a proposta completa, pronta para copiar e enviar ao cliente:`,
});

const brunoProposalFlow = ai.defineFlow(
  {
    name: 'brunoProposalFlow',
    inputSchema: BrunoProposalInputSchema,
    outputSchema: BrunoProposalOutputSchema,
  },
  async (input) => {
    const currentYear = new Date().getFullYear();
    const yearsOfExperience = input.yearsOfExperience ?? (currentYear - 2019);

    // --- RETRIEVAL: Fetch similar proposals from KB ---
    let knowledgeBaseSection = '';
    let referencesCount = 0;

    try {
      const similarProposals = await findSimilarProposals(input.projectDescription, 3);

      if (similarProposals.length > 0) {
        referencesCount = similarProposals.length;
        knowledgeBaseSection = `**BASE DE CONHECIMENTO (${referencesCount} propostas vencedoras encontradas):**\n\n`;

        similarProposals.forEach((ref, i) => {
          const a = ref.analysis;
          knowledgeBaseSection += `--- PROPOSTA #${i + 1} (Score: ${a.overallScore}/10 | Valor cobrado: ${ref.projectValue} | Similaridade: ${(ref.similarity * 100).toFixed(0)}%) ---\n`;
          knowledgeBaseSection += `**Texto:**\n${ref.content}\n\n`;
          knowledgeBaseSection += `**Análise de Pontos Fortes:**\n`;
          knowledgeBaseSection += `- Gancho: ${a.hookType}\n`;
          knowledgeBaseSection += `- Persuasão: ${a.persuasionTechnique}\n`;
          knowledgeBaseSection += `- Tom: ${a.toneOfVoice}\n`;
          knowledgeBaseSection += `- CTA: ${a.ctaStrength}\n`;
          knowledgeBaseSection += `- Qualificação do Valor: ${a.valueQualification}\n`;
          knowledgeBaseSection += `- Pontos Fortes: ${a.uniqueStrengths.join(', ')}\n`;
          knowledgeBaseSection += `- Resumo: ${a.qualificationSummary}\n\n`;
        });
      }
    } catch (error) {
      console.warn('[KB] Failed to retrieve similar proposals, using fallback:', error);
    }

    // Fallback to hardcoded examples if KB is empty
    if (referencesCount === 0) {
      knowledgeBaseSection = `**EXEMPLOS DE REFERÊNCIA (padrão Bruno):**\n${FALLBACK_EXAMPLES}`;
    }

    // --- GENERATION: Create the proposal ---
    const { output } = await kbProposalPrompt(
      {
        ...input,
        yearsOfExperience,
        knowledgeBaseSection,
        referencesCount,
      },
      { model: geminiModel }
    );

    if (!output || !output.proposal) {
      throw new Error('Failed to generate Bruno pattern proposal.');
    }

    return {
      proposal: output.proposal,
      referencesUsed: referencesCount,
    };
  }
);

export async function generateBrunoProposal(input: BrunoProposalInput): Promise<BrunoProposalOutput> {
  return brunoProposalFlow(input);
}
