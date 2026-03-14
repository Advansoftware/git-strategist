'use server';
/**
 * @fileOverview A Genkit flow for estimating project price based on description, user skills, and optional budget.
 *
 * - estimateProjectPrice - A function that estimates the project's price.
 * - ProjectPriceInput - The input type for the estimateProjectPrice function.
 * - ProjectPriceOutput - The return type for the estimateProjectPrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProjectPriceInputSchema = z.object({
  projectDescription: z.string().describe('A detailed description of the freelance project.'),
  userSkills: z.array(z.string()).describe("A list of the freelancer's relevant skills."),
  minBudget: z.number().optional().describe('The minimum budget for the project.'),
  maxBudget: z.number().optional().describe('The maximum budget for the project.'),
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
  prompt: `Você é um especialista em precificação de projetos freelance. Sua tarefa é sugerir um preço justo para um projeto com base em sua descrição, as habilidades do freelancer e uma faixa de orçamento opcional.

Leve em consideração a complexidade, o tempo de desenvolvimento e o valor de mercado para as tecnologias e habilidades necessárias. As habilidades do freelancer devem influenciar o preço; um freelancer com todas as habilidades necessárias pode cobrar mais do que um que precisaria aprender durante o projeto.

Se uma faixa de orçamento (mínimo e máximo) for fornecida, tente sugerir um valor dentro dessa faixa, desde que seja realista e justo para o escopo do projeto. Se a faixa de orçamento parecer irrealista, justifique uma sugestão fora dela, explicando o porquê.

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
Orçamento Mínimo Fornecido: R$ {{{minBudget}}}
{{/if}}
{{#if maxBudget}}
Orçamento Máximo Fornecido: R$ {{{maxBudget}}}
{{/if}}

Com base em todas essas informações, forneça uma sugestão de preço.`,
});

const projectPriceEstimationFlow = ai.defineFlow(
  {
    name: 'projectPriceEstimationFlow',
    inputSchema: ProjectPriceInputSchema,
    outputSchema: ProjectPriceOutputSchema,
  },
  async (input) => {
    const {output} = await projectPricePrompt(input);
    if (!output) {
      throw new Error('Failed to generate project price estimation.');
    }
    return output;
  }
);

export async function estimateProjectPrice(input: ProjectPriceInput): Promise<ProjectPriceOutput> {
  return projectPriceEstimationFlow(input);
}
