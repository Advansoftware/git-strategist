'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a detailed project strategy blueprint.
 *
 * - projectStrategyBlueprint - A function that generates a detailed project plan based on a project description and user skills.
 * - ProjectStrategyBlueprintInput - The input type for the projectStrategyBlueprint function.
 * - ProjectStrategyBlueprintOutput - The return type for the projectStrategyBlueprint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProjectStrategyBlueprintInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('Detailed description of the freelance project.'),
  userSkills: z
    .array(z.string())
    .describe('A list of the freelancer\'s current skills and expertise.'),
});
export type ProjectStrategyBlueprintInput = z.infer<
  typeof ProjectStrategyBlueprintInputSchema
>;

const ProjectStrategyBlueprintOutputSchema = z.object({
  executionPlan: z
    .array(z.string())
    .describe('A detailed, step-by-step plan for executing the project.'),
  potentialChallenges: z
    .array(z.string())
    .describe(
      'Potential challenges or roadblocks during the project and how to mitigate them.'
    ),
  resourceSuggestions: z
    .array(z.string())
    .describe(
      'Suggested tools, technologies, and learning resources relevant to the project.'
    ),
  recommendedTimeCommitment: z
    .string()
    .describe(
      'An estimate of the time required to complete the project (e.g., "1-2 weeks", "40-80 hours").'
    ),
  projectDifficulty: z
    .enum(['Iniciante', 'Intermediário', 'Avançado'])
    .describe('An assessment of the project difficulty.'),
});
export type ProjectStrategyBlueprintOutput = z.infer<
  typeof ProjectStrategyBlueprintOutputSchema
>;

export async function projectStrategyBlueprint(
  input: ProjectStrategyBlueprintInput
): Promise<ProjectStrategyBlueprintOutput> {
  return projectStrategyBlueprintFlow(input);
}

const projectStrategyBlueprintPrompt = ai.definePrompt({
  name: 'projectStrategyBlueprintPrompt',
  input: {schema: ProjectStrategyBlueprintInputSchema},
  output: {schema: ProjectStrategyBlueprintOutputSchema},
  prompt: `Você é um estrategista especialista em projetos freelance. Seu objetivo é ajudar um freelancer a entender um projeto, sua dificuldade, o esforço necessário e como executá-lo, com base em suas habilidades.

Aqui está a descrição do projeto freelancer:
{{{projectDescription}}}

Aqui estão as habilidades conhecidas do freelancer:
{{#if userSkills}}
  Habilidades: {{#each userSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{else}}
  Nenhuma habilidade específica fornecida.
{{/if}}

Com base nessas informações, gere um plano de execução detalhado, identifique desafios potenciais, sugira recursos relevantes e forneça uma avaliação do tempo de dedicação recomendado e da dificuldade do projeto. A dificuldade e o tempo de dedicação devem refletir o alinhamento entre as habilidades do freelancer e os requisitos do projeto. Se o freelancer tiver as habilidades necessárias, a dificuldade e o tempo devem ser menores.

O resultado deve ser um objeto JSON em conformidade com o esquema especificado.

Siga estas diretrizes para sua resposta:
- O \`executionPlan\` deve ser um guia passo a passo para concluir o projeto.
- \`potentialChallenges\` deve listar possíveis obstáculos e como mitigá-los.
- \`resourceSuggestions\` deve incluir ferramentas, tecnologias e materiais de aprendizado.
- \`recommendedTimeCommitment\` deve ser uma estimativa de horas realista (ex: "40-50 horas"). Comece pelo tempo de execução principal e adicione uma margem sensata (cerca de 20%) para contratempos como bugs ou revisões. Não infle a estimativa excessivamente; uma tarefa que leva 8 horas para ser executada não deve ser estimada em 3 dias. O objetivo é ser realista, não pessimista.
- \`projectDifficulty\` deve ser um de "Iniciante", "Intermediário", ou "Avançado".`,
});

const projectStrategyBlueprintFlow = ai.defineFlow(
  {
    name: 'projectStrategyBlueprintFlow',
    inputSchema: ProjectStrategyBlueprintInputSchema,
    outputSchema: ProjectStrategyBlueprintOutputSchema,
  },
  async input => {
    const {output} = await projectStrategyBlueprintPrompt(input, { model: 'gemini-pro' });
    if (!output) {
      throw new Error('Failed to generate project strategy blueprint.');
    }
    return output;
  }
);
