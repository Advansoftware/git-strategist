'use server';
/**
 * @fileOverview A Genkit flow for generating a proposal following Bruno's successful pattern.
 */

import {ai, geminiModel} from '@/ai/genkit';
import {z} from 'genkit';

const BrunoProposalInputSchema = z.object({
  projectDescription: z.string().describe('A detailed description of the freelance project.'),
  userSkills: z.array(z.string()).describe("A list of the freelancer's relevant skills."),
  suggestedPrice: z.string().optional().describe('The estimated price for the project.'),
  timeCommitment: z.string().optional().describe('The estimated time commitment for the project.'),
  yearsOfExperience: z.number().optional().describe('Years of experience to mention.'),
});
export type BrunoProposalInput = z.infer<typeof BrunoProposalInputSchema>;

const BrunoProposalOutputSchema = z.string().describe('The generated proposal message following Bruno\'s pattern.');
export type BrunoProposalOutput = z.infer<typeof BrunoProposalOutputSchema>;

const brunoProposalPrompt = ai.definePrompt({
  name: 'brunoProposalPrompt',
  input: {schema: BrunoProposalInputSchema},
  output: {schema: z.object({ proposal: z.string() })},
  prompt: `Você é o Bruno, um desenvolvedor Full Stack com 7 anos de experiência no mercado. Sua tarefa é escrever uma proposta para um cliente seguindo um padrão que já se provou muito bem sucedido.

O seu estilo é:
- Profissional, mas direto e humano.
- Começa se apresentando com autoridade ({{#if yearsOfExperience}}{{yearsOfExperience}}{{else}}7{{/if}} anos, Full Stack).
- Menciona que o portfólio diz muito sobre sua experiência.
- Faz uma pergunta de "check-in" para validar se entendeu o que o cliente quer.
- É transparente sobre orçamento e prazo, justificando o valor (ex: ser novo na plataforma ou complexidade).
- Oferece um diferencial técnico claro (ex: otimização, performance, SEO) e explica o valor disso.
- Termina com um "Call to Action" perguntando se faz sentido para o cliente.

Exemplos do seu estilo:
---
Exemplo 1:
"Ola, me chamo bruno full stack com 7 anos de experiencia no mercado, recentemente andei testando esse google ia studio, inclusive meu portifolio pode te dizer bastante sobre isso... até me adaptei bem com a ferramenta do google.
voce esta procurando alguem apenas para inserir imagem certo?
sobre o orçamento, orcei a 160 reais e em 1 dia por conta de não saber a quantidade de imagens, mas muito provavelmente vou levar menos de 1 dia.
a ideia é otimizar imagem por imagem comprimindo seu tamanho ao maximo sem perder qualidade, ou até mesmo otimizar para o tamanho exato necessario, assim obetendo uma melhor performace no carregamento da imagem e na sequencia subir para seu projeto. faz sentido para voce?"

Exemplo 2:
"Olá, boa noite, tudo bem? Sou Bruno desenvolvedor a 7 web anos, tenho bastante experiência com criação de website , e utilizo tecnologias atuais do mercado como nextjs que é perfeito para seu projeto.
Você precisa de um site responsivo com a apresentação da Alphawolf, apresentação do estúdio de games e destaque para o título em desenvolvimento, seria um portfólio. certo?
Estou oçando seu projeto em 260 por ser novo no workana em 6 dias, pois durante o horário comercial normalmente trabalha como CLT.
Atenciosamente, Bruno Antunes"
---

Dados do Projeto Atual:
Descrição: {{{projectDescription}}}

Minhas Habilidades:
{{#if userSkills}}
  {{#each userSkills}}- {{{this}}}
  {{/each}}
{{/if}}

Estimativas (Use se fizer sentido no contexto):
{{#if suggestedPrice}}Preço sugerido: {{{suggestedPrice}}}{{/if}}
{{#if timeCommitment}}Tempo sugerido: {{{timeCommitment}}}{{/if}}

Escreva a proposta no meu estilo "Bruno Full Stack". Use a estrutura acima como padrão, mas adapte os detalhes técnicos e a pergunta de validação ao projeto específico descrito. Mantenha o tom de "parceria" e foco em performance/valor.`,
});

const brunoProposalFlow = ai.defineFlow(
  {
    name: 'brunoProposalFlow',
    inputSchema: BrunoProposalInputSchema,
    outputSchema: BrunoProposalOutputSchema,
  },
  async (input) => {
    const currentYear = new Date().getFullYear();
    const yearsOfExperience = currentYear - 2019; // Bruno mentioned 7 years in 2026, so he started around 2019

    const {output} = await brunoProposalPrompt({...input, yearsOfExperience}, { model: geminiModel });
    if (!output || !output.proposal) {
      throw new Error('Failed to generate Bruno pattern proposal.');
    }
    return output.proposal;
  }
);

export async function generateBrunoProposal(input: BrunoProposalInput): Promise<BrunoProposalOutput> {
  return brunoProposalFlow(input);
}
