'use server';
/**
 * @fileOverview A Genkit flow for estimating project price based on description, user skills, and optional budget.
 *
 * - estimateProjectPrice - A function that estimates the project's price.
 * - ProjectPriceInput - The input type for the estimateProjectPrice function.
 * - ProjectPriceOutput - The return type for the estimateProjectPrice function.
 */

import {ai, getActiveModel} from '@/ai/genkit';
import {z} from 'genkit';
import type { ProposalAnalysis } from '@/ai/flows/analyze-proposal-strengths';

const KBReferenceSchema = z.object({
  projectValue: z.string().optional(),
  analysis: z.object({
    valueQualification: z.string(),
    overallScore: z.number(),
  }),
});

const ProjectPriceInputSchema = z.object({
  projectDescription: z.string().describe('A detailed description of the freelance project.'),
  userSkills: z.array(z.string()).describe("A list of the freelancer's relevant skills."),
  minBudget: z.number().optional().describe('The minimum budget for the project.'),
  maxBudget: z.number().optional().describe('The maximum budget for the project.'),
  minPossibleBudget: z.number().optional().describe('The absolute minimum price the freelancer is willing to accept.'),
  kbReferences: z.array(KBReferenceSchema).optional().describe('Historical proposals from knowledge base with their values and qualifications.'),
});
export type ProjectPriceInput = z.infer<typeof ProjectPriceInputSchema>;

const ProjectPriceOutputSchema = z.object({
    suggestedPrice: z.string().describe('Suggested price for the project, e.g., "R$1500 - R$2500" or "R$5000".'),
});
export type ProjectPriceOutput = z.infer<typeof ProjectPriceOutputSchema>;

const projectPricePrompt = ai.definePrompt({
  name: 'projectPricePrompt',
  input: {schema: ProjectPriceInputSchema},
  output: {schema: ProjectPriceOutputSchema},
  prompt: `Você é um especialista em precificação de projetos freelance. Sua tarefa é sugerir um preço justo para um projeto com base em sua descrição, as habilidades do freelancer, os valores de orçamento fornecidos e dados históricos de projetos similares.

Fatores a considerar:
1.  **Complexidade e Habilidades:** A complexidade, o tempo de desenvolvimento e o valor de mercado para as tecnologias necessárias. Um freelancer com todas as habilidades pode cobrar mais.
2.  **Orçamento do Cliente:** Se uma faixa de orçamento (mínimo e máximo) for fornecida pelo cliente, tente sugerir um valor dentro dessa faixa, se for realista.
3.  **Mínimo Aceitável do Freelancer:** O "valor mínimo aceitável" é o piso absoluto do freelancer. A sugestão NUNCA deve ser inferior a este valor, mesmo que o orçamento do cliente seja menor.
4.  **Conflito de Orçamento:** Se o orçamento máximo do cliente for inferior ao seu mínimo aceitável, justifique uma sugestão de preço mais alta, explicando por que o orçamento do cliente é irrealista para o escopo.
5.  **Dados Históricos (Knowledge Base):** Use os valores reais cobrados em projetos similares como referência de mercado. Considere a qualificação de cada valor ("Coerente", "Abaixo do mercado", etc.) para calibrar sua sugestão.

Descrição do Projeto:
{{{projectDescription}}}

Habilidades do Freelancer:
{{#if userSkills}}
  {{#each userSkills}}- {{{this}}}
  {{/each}}
{{else}}
  Nenhuma habilidade específica fornecida.
{{/if}}

{{#if minBudget}}
Orçamento Mínimo do Cliente: R$ {{{minBudget}}}
{{/if}}
{{#if maxBudget}}
Orçamento Máximo do Cliente: R$ {{{maxBudget}}}
{{/if}}
{{#if minPossibleBudget}}
Seu Valor Mínimo Aceitável: R$ {{{minPossibleBudget}}}
{{/if}}

{{#if kbReferences}}
**DADOS HISTÓRICOS DE PROJETOS SIMILARES:**
{{#each kbReferences}}
- Projeto similar #{{@index}}: cobrou {{{this.projectValue}}} — Qualificação: {{{this.analysis.valueQualification}}} (Score: {{this.analysis.overallScore}}/10)
{{/each}}
Use esses valores como referência de mercado real ao sugerir o preço.
{{/if}}

Com base em todas essas informações, forneça uma sugestão de preço concisa e justificada.`,
});

const projectPriceEstimationFlow = ai.defineFlow(
  {
    name: 'projectPriceEstimationFlow',
    inputSchema: ProjectPriceInputSchema,
    outputSchema: ProjectPriceOutputSchema,
  },
  async (input) => {
    const {output} = await projectPricePrompt(input, { model: await getActiveModel() });
    if (!output) {
      throw new Error('Failed to generate project price estimation.');
    }
    return output;
  }
);

export async function estimateProjectPrice(input: ProjectPriceInput): Promise<ProjectPriceOutput> {
  return projectPriceEstimationFlow(input);
}
