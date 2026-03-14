'use server';
/**
 * @fileOverview A Genkit flow for generating a structured project proposal outline.
 *
 * - generateProposalStructure - A function that creates a proposal structure.
 * - ProposalStructureInput - The input type for the generateProposalStructure function.
 * - ProposalStructureOutput - The return type for the generateProposalStructure function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProposalStructureInputSchema = z.object({
  projectDescription: z.string().describe('A detailed description of the freelance project.'),
  userSkills: z.array(z.string()).describe("A list of the freelancer's relevant skills."),
});
export type ProposalStructureInput = z.infer<typeof ProposalStructureInputSchema>;

const ProposalSectionSchema = z.object({
    title: z.string().describe('O título da seção da proposta (ex: "Introdução e Contexto", "Sua Solução Detalhada").'),
    suggestedText: z.string().describe('Um texto de exemplo para esta seção, praticamente pronto para copiar, colar e adaptar ao projeto.'),
});

const ProposalStructureOutputSchema = z.object({
  sections: z.array(ProposalSectionSchema).describe('Uma lista de seções que compõem a estrutura de uma proposta de projeto vencedora.'),
});
export type ProposalStructureOutput = z.infer<typeof ProposalStructureOutputSchema>;

export async function generateProposalStructure(input: ProposalStructureInput): Promise<ProposalStructureOutput> {
  return proposalStructureFlow(input);
}

const proposalStructurePrompt = ai.definePrompt({
  name: 'proposalStructurePrompt',
  input: {schema: ProposalStructureInputSchema},
  output: {schema: ProposalStructureOutputSchema},
  prompt: `Você é um especialista em criação de propostas para projetos freelance, com um histórico de 95% de aprovação. Sua tarefa é criar uma estrutura de proposta vencedora, baseada na descrição de um projeto e na experiência (habilidades) de um freelancer.

A estrutura deve ser dividida em seções claras e estratégicas.

Contexto do Projeto:
Descrição: {{{projectDescription}}}

Habilidades do Freelancer:
{{#if userSkills}}
  {{#each userSkills}}- {{{this}}}
  {{/each}}
{{else}}
  Nenhuma habilidade específica fornecida.
{{/if}}

Crie uma estrutura de proposta com as seguintes seções. Para cada seção, forneça um título claro e um texto sugerido (o campo 'suggestedText') que seja um exemplo prático e quase pronto para copiar e colar, adaptado ao projeto.

1.  **Título da Proposta:** Um título impactante.
2.  **Introdução/Resumo Executivo:** Um parágrafo que resume o problema e a solução.
3.  **Entendimento do Desafio:** Mostre que você compreendeu profundamente as necessidades do cliente.
4.  **A Solução Proposta:** Detalhe o que você fará, como fará e quais tecnologias usará. Conecte com as habilidades do freelancer.
5.  **Escopo e Entregáveis:** Liste claramente o que está incluído e o que não está.
6.  **Cronograma:** Apresente um cronograma realista com as principais fases.
7.  **Investimento:** Explique a estrutura de preços.
8.  **Sobre Mim (Autoridade):** Uma breve seção para gerar confiança, mencionando a experiência relevante (habilidades).
9.  **Próximos Passos (Call to Action):** Indique claramente o que o cliente deve fazer a seguir.

O campo 'suggestedText' deve conter o conteúdo de exemplo para cada seção, pronto para ser usado.`,
});

const proposalStructureFlow = ai.defineFlow(
  {
    name: 'proposalStructureFlow',
    inputSchema: ProposalStructureInputSchema,
    outputSchema: ProposalStructureOutputSchema,
  },
  async (input) => {
    const {output} = await proposalStructurePrompt(input, { model: 'gemini-1.5-pro-latest' });
    if (!output) {
      throw new Error('Failed to generate proposal structure.');
    }
    return output;
  }
);
