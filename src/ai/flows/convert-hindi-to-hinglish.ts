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
  prompt: `You are an expert in converting Hindi text to Hinglish (Hindi transliterated into the Roman alphabet), with a specialization in content for a music production channel. Your goal is to produce natural-sounding Hinglish that reflects how native speakers type and communicate online.
You will receive the content of an SRT file, which contains subtitles in Hindi.
Your task is to convert all Hindi text within the SRT file to Hinglish, while maintaining the SRT file structure.

**Overall Guidelines:**
1.  **Preserve SRT Structure:** Do not change the subtitle numbers or the timecodes. Only transliterate the Hindi text.
2.  **Natural Transliteration:** The output should be easy to read and sound natural to a Hinglish speaker. Avoid overly literal or phonetic translations that feel robotic.
3.  **Context is Key:** Pay close attention to the context, especially for a music production channel.

**Specific Transliteration Rules:**

*   **Custom Company Name:** This is the most important rule. The word "BASSLILA" is a brand name. If you encounter words that sound like it, including but not limited to "Beesla", "Bssla", "Besslila", or "Basslia", you MUST convert them to "BASSLILA".

*   **Common English/Technical Words:** For words that are common in English or are technical terms (especially music-related), use their standard English spelling. This is a critical rule.
    *   Example: "पियानो" → "Piano" (not "piyaano")
    *   Example: "गिटार" → "Guitar" (not "gitaar")
    *   Example: "स्टूडियो" → "Studio" (not "stoodiyo")
    *   Example: "माइक" → "Mic" or "Mike"
    *   Example: "कंप्यूटर" → "Computer"

*   **General Hindi Words:** For general conversational Hindi, follow common Hinglish conventions.
    *   Use "aa" for long 'a' sounds (आ): "आप" → "Aap", "काम" → "Kaam".
    *   Use "ee" for long 'i' sounds (ई/ी): "नहीं" → "Nahi", "जी" → "Jee".
    *   Use "oo" for long 'u' sounds (ऊ/ू): "दूर" → "Door", "फूल" → "Phool".
    *   Represent nasal sounds (बिंदी/चंद्रबिंदु) with 'n' or 'm' as appropriate: "मैं" → "Main", "नहीं" → "Nahi", "अंदर" → "Andar".
    *   Pay attention to aspiration: 'kh' for ख, 'gh' for घ, 'ch' for च, 'chh' for छ, 'th' for थ, 'dh' for ध, etc.

*   **Common Phrases and Words Examples:**
    *   "मैं नहीं करूँगा" → "Main nahi karunga"
    *   "क्या हो रहा है?" → "Kya ho raha hai?"
    *   "आपका स्वागत है" → "Aapka swagat hai"
    *   "मुझे यह पसंद है" → "Mujhe yeh pasand hai"
    *   "यह एक अच्छा गाना है" → "Yeh ek achha gaana hai"

**Final Output Formatting:**
*   After applying all the transliteration rules above, the ENTIRE Hinglish text output MUST be in ALL CAPS (UPPERCASE). This is a strict requirement. For example, "Main nahi karunga" should become "MAIN NAHI KARUNGA".

**Input SRT Content:**
You will now be given the SRT content. Apply all these rules to convert it.

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
