// This is an experimental implementation of this flow. It has not been verified and is likely incorrect.
'use server';
/**
 * @fileOverview An AI agent to suggest the next action in a magic duel.
 *
 * - suggestNextAction - A function that suggests the next action in a magic duel.
 * - SuggestNextActionInput - The input type for the suggestNextAction function.
 * - SuggestNextActionOutput - The return type for the suggestNextAction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNextActionInputSchema = z.object({
  playerStats: z.object({
    OZ: z.number().describe('Player health points.'),
    OM: z.number().describe('Player mana points.'),
    OD: z.number().describe('Player action points.'),
    penalties: z.string().describe('Current penalties affecting the player.'),
    bonuses: z.string().describe('Current bonuses affecting the player.'),
    race: z.string().describe('Player race'),
    reserve: z.string().describe('Player reserve level'),
    elementalKnowledge: z.string().describe('Player elemental knowledge'),
    faithLevel: z.number().describe('Player faith level'),
    inventory: z.string().describe('Player inventory'),
  }).describe('Player current stats and status.'),
  opponentStats: z.object({
    OZ: z.number().describe('Opponent health points.'),
    OM: z.number().describe('Opponent mana points.'),
    OD: z.number().describe('Opponent action points.'),
    race: z.string().describe('Opponent race'),
    penalties: z.string().describe('Opponent current penalties'),
    bonuses: z.string().describe('Opponent current bonuses'),
  }).describe('Opponent current stats and status.'),
  duelRules: z.string().describe('The rules of the magic duel.'),
});
export type SuggestNextActionInput = z.infer<typeof SuggestNextActionInputSchema>;

const SuggestNextActionOutputSchema = z.object({
  suggestedAction: z.string().describe('The AI suggested action for the player.'),
  costEstimate: z.string().describe('The estimated cost (OM/OD) of the suggested action.'),
  predictedEffect: z.string().describe('The predicted effect of the suggested action.'),
});
export type SuggestNextActionOutput = z.infer<typeof SuggestNextActionOutputSchema>;

export async function suggestNextAction(input: SuggestNextActionInput): Promise<SuggestNextActionOutput> {
  return suggestNextActionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNextActionPrompt',
  input: {schema: SuggestNextActionInputSchema},
  output: {schema: SuggestNextActionOutputSchema},
  prompt: `You are an AI assistant designed to suggest the best next action for a player in a magic duel.
  Consider the player's current stats, opponent stats, and the duel rules to provide a strategic suggestion.

  Player Stats:
  {{playerStats}}

  Opponent Stats:
  {{opponentStats}}

  Duel Rules:
  {{duelRules}}

  Based on this information, suggest ONE action for the player, estimate its cost (OM/OD), and predict its effect.
  Return the suggested action, cost estimate, and predicted effect in the output schema format.`,
});

const suggestNextActionFlow = ai.defineFlow(
  {
    name: 'suggestNextActionFlow',
    inputSchema: SuggestNextActionInputSchema,
    outputSchema: SuggestNextActionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
