import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export const getGeminiAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const translateToSinhala = async (text: string, retries = 3): Promise<string> => {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      const ai = getGeminiAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following real estate description into Sinhala. Keep it natural, professional, and attractive for potential buyers. Only return the translated text.

Description: ${text}`,
      });

      const translatedText = response.text;
      if (!translatedText) {
        throw new Error("No translation returned from Gemini");
      }
      
      return translatedText.trim();
    } catch (error: any) {
      lastError = error;
      
      const errorMessage = error?.message?.toLowerCase() || "";
      
      // Handle rate limits or high demand (429)
      if (errorMessage.includes("429") || errorMessage.includes("exhausted") || errorMessage.includes("demand")) {
        const waitTime = Math.pow(2, i) * 1000;
        console.warn(`Gemini API busy (429). Retrying in ${waitTime}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // If it's a 404, it might be the model name or endpoint. 
      // But using 'gemini-3-flash-preview' with the correct SDK should fix the 404.
      
      throw error;
    }
  }
  
  console.error("Translation error after retries:", lastError);
  throw lastError;
};
