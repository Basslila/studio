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

const convertToHinglishPrompt = ai.definePrompt({
  name: 'convertToHinglishPrompt',
  input: {schema: ConvertHindiToHinglishInputSchema},
  output: {schema: ConvertHindiToHinglishOutputSchema},
  prompt: `You are an expert in converting Hindi text to Hinglish (Hindi transliterated into the Roman alphabet), with a specialization in content for a music production channel.
You will receive the content of an SRT file, which contains subtitles in Hindi.
Your task is to convert all Hindi text within the SRT file to Hinglish, while maintaining the SRT file structure.

Here are some guidelines for transliteration:
- Preserve the SRT file format: Each subtitle entry consists of a number, a timecode, and the text. You must not change these.
- Convert only the Hindi text: Leave the numbers and timecodes untouched.
- For general Hindi phrases, provide a standard Hinglish transliteration. For example, "मैं नहीं करूँगा" should become "Mai Nahi Karunga".
- **Crucially, for words that are common in English or are technical terms, especially music-related terms, use their standard English spelling, not a direct phonetic transliteration.** For example, the Hindi word "पियानो" should be converted to "Piano", not "piyaano". Similarly, "गिटार" should be "Guitar", and "स्टूडियो" should be "Studio".

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
