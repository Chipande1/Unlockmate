import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DocumentMetadata } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const documentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A predicted title for the document based on the URL slug.",
    },
    platform: {
      type: Type.STRING,
      description: "The name of the platform (e.g., CourseHero, Studocu, Scribd).",
    },
    subject: {
      type: Type.STRING,
      description: "The academic subject likely associated with this document.",
    },
    summary: {
      type: Type.STRING,
      description: "A short, 1-sentence description of what this document might contain based on keywords in the URL.",
    },
  },
  required: ["title", "platform", "subject", "summary"],
};

export const analyzeUrl = async (url: string): Promise<DocumentMetadata> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this URL and extract metadata about the document it points to. 
      URL: ${url}. 
      If the URL is generic or not a study site, make a best guess based on the text structure.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: documentSchema,
        thinkingConfig: { thinkingBudget: 0 } // Speed is prioritized over deep reasoning
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as DocumentMetadata;
    }
    
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Fallback if AI fails or key is missing
    return {
      title: "Document Analysis Unavailable",
      platform: "Unknown Platform",
      subject: "General",
      summary: "We will manually verify this link."
    };
  }
};