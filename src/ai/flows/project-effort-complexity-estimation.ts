'use server';
/**
 * @fileOverview A Genkit flow for estimating project effort and complexity based on description and user skills.
 *
 * - estimateProjectEffortAndComplexity - A function that estimates the project's effort and complexity.
 * - ProjectEffortComplexityInput - The input type for the estimateProjectEffortAndComplexity function.
 * - ProjectEffortComplexityOutput - The return type for the estimateProjectEffortAndComplexity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the project effort and complexity estimation.
const ProjectEffortComplexityInputSchema = z.object({
  projectDescription: z.string().describe('A detailed description of the freelance project.'),
  userSkills: z.array(z.string()).describe('A list of the freelancer\'s relevant skills.'),
});
export type ProjectEffortComplexityInput = z.infer<typeof ProjectEffortComplexityInputSchema>;

// Define the output schema for the project effort and complexity estimation.
const ProjectEffortComplexityOutputSchema = z.object({
  timeCommitment: z.string().describe('Recommended time commitment for the project, e.g., "2-4 weeks", "80-120 hours".'),
  complexityRating: z.enum(['iniciante', 'intermediário', 'avançado']).describe('Overall project complexity rating (beginner, intermediate, or advanced).'),
});
export type ProjectEffortComplexityOutput = z.infer<typeof ProjectEffortComplexityOutputSchema>;

// Define the prompt for the AI to analyze the project and skills.
const projectEffortComplexityPrompt = ai.definePrompt({
  name: 'projectEffortComplexityPrompt',
  input: {schema: ProjectEffortComplexityInputSchema},
  output: {schema: ProjectEffortComplexityOutputSchema},
  prompt: `Você é um analista especialista em projetos freelance. Sua tarefa é avaliar a descrição de um projeto e determinar sua complexidade e o tempo de dedicação recomendado, considerando especificamente as habilidades listadas do freelancer.\\n\\nDescrição do Projeto: {{{projectDescription}}}\\n\\nHabilidades do Freelancer:\\n{{#each userSkills}}\\n- {{{this}}}\\n{{/each}}\\n\\nCom base na descrição do projeto e nas habilidades do freelancer, forneça uma recomendação de tempo de dedicação e uma classificação geral de complexidade do projeto. A classificação de complexidade deve ser 'iniciante', 'intermediário' ou 'avançado'. A dedicação de tempo deve ser uma estimativa clara (por exemplo, '2-4 semanas' ou '80-120 horas').`,
});

// Define the Genkit flow for estimating project effort and complexity.
const projectEffortComplexityEstimationFlow = ai.defineFlow(
  {
    name: 'projectEffortComplexityEstimationFlow',
    inputSchema: ProjectEffortComplexityInputSchema,
    outputSchema: ProjectEffortComplexityOutputSchema,
  },
  async (input) => {
    const {output} = await projectEffortComplexityPrompt(input);
    if (!output) {
      throw new Error('Failed to generate project effort and complexity estimation.');
    }
    return output;
  }
);

// Wrapper function to call the Genkit flow.
export async function estimateProjectEffortAndComplexity(input: ProjectEffortComplexityInput): Promise<ProjectEffortComplexityOutput> {
  return projectEffortComplexityEstimationFlow(input);
}
