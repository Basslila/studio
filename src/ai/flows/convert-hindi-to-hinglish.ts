'use server';
/**
 * @fileOverview Converts Hindi SRT files to Hinglish SRT files using AI.
 *
 * - convertHindiToHinglish - A function that handles the conversion process.
 * - ConvertHindiToHinglishInput - The input type for the convertHindiToHinglish function.
 * - ConvertHindiToHinglishOutput - The return type for the convertHindiToHinglish function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertHindiToHinglishInputSchema = z.object({
  srtContent: z
    .string()
    .describe('The content of the Hindi SRT file.'),
});
export type ConvertHindiToHinglishInput = z.infer<typeof ConvertHindiToHinglishInputSchema>;

const ConvertHindiToHinglishOutputSchema = z.object({
  hinglishSrtContent: z
    .string()
    .describe('The content of the Hinglish SRT file.'),
});
export type ConvertHindiToHinglishOutput = z.infer<typeof ConvertHindiToHinglishOutputSchema>;

export async function convertHindiToHinglish(input: ConvertHindiToHinglishInput): Promise<ConvertHindiToHinglishOutput> {
  return convertHindiToHinglishFlow(input);
}

const shouldRetainHindiTool = ai.defineTool({
  name: 'shouldRetainHindi',
  description: 'Determine whether the given word should remain in Hindi or be transliterated to Hinglish.',
  inputSchema: z.object({
    word: z.string().describe('The Hindi word to evaluate.'),
  }),
  outputSchema: z.boolean().describe('True if the word should remain in Hindi, false if it should be transliterated.'),
}, async (input) => {
  // In a real application, this would use a more sophisticated method
  // to determine whether to retain the Hindi word, such as a dictionary lookup
  // or a machine learning model.
  // For this example, we will retain words that are shorter than 4 characters.
  return input.word.length <= 3;
});

const convertToHinglishPrompt = ai.definePrompt({
  name: 'convertToHinglishPrompt',
  input: {schema: ConvertHindiToHinglishInputSchema},
  output: {schema: ConvertHindiToHinglishOutputSchema},
  tools: [shouldRetainHindiTool],
  prompt: `You are an expert in converting Hindi text to Hinglish (Hindi transliterated into the Roman alphabet).
  You will receive the content of an SRT file, which contains subtitles in Hindi.
  Your task is to convert the Hindi text within the SRT file to Hinglish, while maintaining the SRT file structure.

  Here are some guidelines:
  - Preserve the SRT file format: Each subtitle entry consists of a number, a timecode, and the text.
  - Convert only the Hindi text: Leave the numbers and timecodes untouched.
  - Use the shouldRetainHindi tool to decide if a word should remain in Hindi, only convert the words that the tool returns false for.
  - Be accurate with transliteration.

  The SRT file content is as follows:
  {{{srtContent}}}
  `,
});

const convertHindiToHinglishFlow = ai.defineFlow(
  {
    name: 'convertHindiToHinglishFlow',
    inputSchema: ConvertHindiToHinglishInputSchema,
    outputSchema: ConvertHindiToHinglishOutputSchema,
  },
  async input => {
    const {output} = await convertToHinglishPrompt(input);
    return output!;
  }
);
