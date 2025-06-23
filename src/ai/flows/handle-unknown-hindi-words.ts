'use server';
/**
 * @fileOverview This file defines a Genkit flow for handling unknown Hindi words during SRT conversion.
 *
 * - handleUnknownHindiWords - A function that processes Hindi text and allows the user to decide whether to transliterate or keep unknown words in their original form.
 * - HandleUnknownHindiWordsInput - The input type for the handleUnknownHindiWords function, including the Hindi text and a list of unknown words.
 * - HandleUnknownHindiWordsOutput - The return type for the handleUnknownHindiWords function, providing the converted Hinglish text.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HandleUnknownHindiWordsInputSchema = z.object({
  hindiText: z.string().describe('The Hindi text to be processed.'),
  unknownWords: z.array(z.string()).describe('A list of unknown Hindi words encountered during conversion.'),
});
export type HandleUnknownHindiWordsInput = z.infer<typeof HandleUnknownHindiWordsInputSchema>;

const HandleUnknownHindiWordsOutputSchema = z.object({
  hinglishText: z.string().describe('The converted Hinglish text with user-specified handling of unknown words.'),
});
export type HandleUnknownHindiWordsOutput = z.infer<typeof HandleUnknownHindiWordsOutputSchema>;

export async function handleUnknownHindiWords(input: HandleUnknownHindiWordsInput): Promise<HandleUnknownHindiWordsOutput> {
  return handleUnknownHindiWordsFlow(input);
}

const wordChoiceTool = ai.defineTool({
  name: 'wordChoiceTool',
  description: 'Presents the user with a choice to either transliterate a Hindi word to Hinglish or keep it in Hindi.',
  inputSchema: z.object({
    word: z.string().describe('The Hindi word to handle.'),
  }),
  outputSchema: z.enum(['transliterate', 'keep']),
},
async (input) => {
    // In a real implementation, this would present a UI to the user
    // to choose whether to transliterate or keep the word.
    // For now, we default to transliterate.
    console.log(`Please choose to transliterate or keep the word: ${input.word}`);
    return 'transliterate';
  }
);

const handleUnknownHindiWordsPrompt = ai.definePrompt({
  name: 'handleUnknownHindiWordsPrompt',
  input: {schema: HandleUnknownHindiWordsInputSchema},
  output: {schema: HandleUnknownHindiWordsOutputSchema},
  tools: [wordChoiceTool],
  prompt: `You are an AI tasked with converting Hindi text to Hinglish (Hindi transliterated into the Roman alphabet).

  The following Hindi text contains words that the AI is unsure how to convert:
  {{hindiText}}

  For each unknown word in the text, use the wordChoiceTool to determine whether to transliterate the word or keep it in its original Hindi form. Replace each unknown word with the transliterated/original version based on tool call.

  Return the fully converted Hinglish text.
  `,
});

const handleUnknownHindiWordsFlow = ai.defineFlow(
  {
    name: 'handleUnknownHindiWordsFlow',
    inputSchema: HandleUnknownHindiWordsInputSchema,
    outputSchema: HandleUnknownHindiWordsOutputSchema,
  },
  async input => {
    let {hinglishText} = await handleUnknownHindiWordsPrompt(input);
    return {hinglishText: hinglishText!};
  }
);
