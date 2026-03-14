'use server';
/**
 * @fileOverview This file implements a Genkit flow for identifying skill gaps.
 *
 * - identifySkillGaps - A function that handles the skill gap identification process.
 * - SkillGapInput - The input type for the identifySkillGaps function.
 * - SkillGapOutput - The return type for the identifySkillGaps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SkillGapInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('The description of the freelance project.'),
  userSkills: z
    .array(z.string())
    .describe('A list of the user\'s current skills.'),
});
export type SkillGapInput = z.infer<typeof SkillGapInputSchema>;

const SkillGapOutputSchema = z.object({
  missingSkills: z
    .array(z.string())
    .describe(
      'A list of skills identified as beneficial or potentially missing for the project, not currently possessed by the user.'
    ),
  explanation: z
    .string()
    .describe(
      'An explanation of why these skills are suggested and how they relate to the project requirements.'
    ),
});
export type SkillGapOutput = z.infer<typeof SkillGapOutputSchema>;

export async function identifySkillGaps(
  input: SkillGapInput
): Promise<SkillGapOutput> {
  return skillGapIdentificationFlow(input);
}

const skillGapIdentificationPrompt = ai.definePrompt({
  name: 'skillGapIdentificationPrompt',
  input: {schema: SkillGapInputSchema},
  output: {schema: SkillGapOutputSchema},
  prompt: `Você é um analista de projetos especialista em projetos freelance. Sua tarefa é analisar a descrição de um projeto e identificar habilidades que seriam muito benéficas ou que estão potencialmente faltando para o usuário, com base em seu conjunto de habilidades existente. O objetivo é ajudar o usuário a melhorar continuamente seu portfólio de habilidades para projetos futuros.

Descrição do Projeto:
{{{projectDescription}}}

Habilidades Atuais do Usuário:
{{#if userSkills}}
{{#each userSkills}}- {{{this}}}
{{/each}}
{{else}}
Nenhuma fornecida.
{{/if}}

Com base na descrição do projeto e nas habilidades atuais do usuário, identifique até 5 habilidades-chave que ajudariam significativamente na conclusão bem-sucedida deste projeto, mas que não estão explicitamente listadas nas habilidades atuais do usuário. Para cada habilidade sugerida, forneça uma breve explicação de sua relevância. Se nenhuma habilidade adicional for considerada necessária ou benéfica, retorne um array vazio para 'missingSkills'.

O resultado deve estar no formato JSON correspondente ao SkillGapOutputSchema.`,
});

const skillGapIdentificationFlow = ai.defineFlow(
  {
    name: 'skillGapIdentificationFlow',
    inputSchema: SkillGapInputSchema,
    outputSchema: SkillGapOutputSchema,
  },
  async input => {
    const {output} = await skillGapIdentificationPrompt(input);
    return output!;
  }
);
