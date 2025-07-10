// Summarizes a duel log to identify key turns, damage, and effects.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDuelLogInputSchema = z.object({
  duelLog: z.string().describe('The duel log to summarize.'),
  characterName: z.string().describe('The name of the character whose perspective to summarize from.'),
});

export type SummarizeDuelLogInput = z.infer<typeof SummarizeDuelLogInputSchema>;

const SummarizeDuelLogOutputSchema = z.object({
  summary: z.string().describe('A summary of the duel log.'),
});

export type SummarizeDuelLogOutput = z.infer<typeof SummarizeDuelLogOutputSchema>;

export async function summarizeDuelLog(input: SummarizeDuelLogInput): Promise<SummarizeDuelLogOutput> {
  return summarizeDuelLogFlow(input);
}

const summarizeDuelLogPrompt = ai.definePrompt({
  name: 'summarizeDuelLogPrompt',
  input: {
    schema: SummarizeDuelLogInputSchema,
  },
  output: {
    schema: SummarizeDuelLogOutputSchema,
  },
  prompt: `Summarize the following duel log from the perspective of {{characterName}}. Identify key turns, damage dealt and received, and significant effects. Provide insights into tactics and overall duel flow.  Focus on what {{characterName}} could learn from the duel.

Duel Log:
{{duelLog}}`,
});

const summarizeDuelLogFlow = ai.defineFlow(
  {
    name: 'summarizeDuelLogFlow',
    inputSchema: SummarizeDuelLogInputSchema,
    outputSchema: SummarizeDuelLogOutputSchema,
  },
  async input => {
    const {output} = await summarizeDuelLogPrompt(input);
    return output!;
  }
);
