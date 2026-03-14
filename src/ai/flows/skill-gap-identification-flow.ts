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
  prompt: `You are an expert project analyst specializing in freelance projects. Your task is to analyze a given project description and identify skills that would be highly beneficial or are potentially missing for the user, based on their existing skill set. The goal is to help the user continuously improve their skill portfolio for future projects.

Project Description:
{{{projectDescription}}}

User's Current Skills:
{{#if userSkills}}
{{#each userSkills}}- {{{this}}}
{{/each}}
{{else}}
None provided.
{{/if}}

Based on the project description and the user's current skills, identify up to 5 key skills that would significantly aid in successfully completing this project but are not explicitly listed in the user's current skills. For each suggested skill, provide a brief explanation of its relevance. If no additional skills are deemed necessary or beneficial, return an empty array for 'missingSkills'.

Output must be in JSON format matching the SkillGapOutputSchema.`,
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
