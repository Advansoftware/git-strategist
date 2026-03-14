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
    .enum(['Beginner', 'Intermediate', 'Advanced'])
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
  prompt: `You are an expert freelance project strategist. Your goal is to help a freelancer understand a project, its difficulty, required effort, and how to execute it, based on their skills.

Here is the freelance project description:
{{{projectDescription}}}

Here are the freelancer's known skills:
{{#if userSkills}}
  Skills: {{#each userSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{else}}
  No specific skills provided.
{{/if}}

Based on this information, generate a detailed execution plan, identify potential challenges, suggest relevant resources, and provide an assessment of the recommended time commitment and project difficulty.

The output must be a JSON object conforming to the specified schema.

Follow these guidelines for your response:
- The \`executionPlan\` should be a step-by-step guide to complete the project.
- \`potentialChallenges\` should list possible hurdles and how to mitigate them.
- \`resourceSuggestions\` should include tools, technologies, and learning materials.
- \`recommendedTimeCommitment\` should be a concise estimate (e.g., "1-2 weeks", "40-80 hours").
- \`projectDifficulty\` should be one of "Beginner", "Intermediate", or "Advanced".`,
});

const projectStrategyBlueprintFlow = ai.defineFlow(
  {
    name: 'projectStrategyBlueprintFlow',
    inputSchema: ProjectStrategyBlueprintInputSchema,
    outputSchema: ProjectStrategyBlueprintOutputSchema,
  },
  async input => {
    const {output} = await projectStrategyBlueprintPrompt(input);
    return output!;
  }
);
