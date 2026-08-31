import { GoogleGenerativeAI } from "@google/generative-ai";

// List of supported Gemini models in order of preference
const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash",
  "gemini-pro",
];

export function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

export async function generateWithGemini(
  genAI: GoogleGenerativeAI,
  prompt: string,
  jsonMode: boolean = false
): Promise<string> {
  let lastError: unknown = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          maxOutputTokens: 6000,
          temperature: 0.25,
          ...(jsonMode ? { responseMimeType: "application/json" } : {}),
        },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err: unknown) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Gemini model ${modelName} returned: ${msg}. Trying next candidate...`);
    }
  }

  throw lastError || new Error("All Gemini model candidates failed");
}
