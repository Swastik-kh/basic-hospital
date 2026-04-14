import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client directly with the environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHealthAdvice = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        // Use systemInstruction for defining the assistant's personality and rules
        systemInstruction: "You are a helpful medical assistant for Aadharbhut Nagar Aspatal (Beltar Municipal Hospital). Provide concise health advice STRICTLY in Nepali language (using Devanagari script). Always state that this is AI advice and they should consult a real doctor for emergencies in Nepali.",
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });
    // Directly access the text property as per documentation
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "माफ गर्नुहोला, अहिले जडानमा समस्या भयो। कृपया हाम्रो मेडिकल अफिसरसँग सम्पर्क गर्नुहोला।";
  }
};