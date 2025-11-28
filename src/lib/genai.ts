import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface SearchIntent {
    type: 'keyword' | 'verse_key' | 'topic';
    query: string; // The cleaned query or keywords
    verseKey?: string; // If specific verse is requested
}

export async function understandQuery(userQuery: string): Promise<SearchIntent> {
    if (!apiKey) {
        console.error("API Key is missing");
        return { type: 'keyword', query: userQuery };
    }

    const prompt = `
  You are an expert Quran search assistant. Analyze the user's query and determine the best way to search the Quran.
  
  Query: "${userQuery}"
  
  Output JSON only:
  {
    "type": "keyword" | "verse_key" | "topic",
    "query": "optimized search keywords or topic",
    "verseKey": "chapter:verse" (only if specific verse is requested, e.g. "2:255")
  }
  
  Examples:
  "verses about patience" -> {"type": "topic", "query": "patience"}
  "surah baqarah verse 255" -> {"type": "verse_key", "query": "Ayatul Kursi", "verseKey": "2:255"}
  "tell me about moses" -> {"type": "keyword", "query": "Moses Musa"}
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error understanding query:", error);
        // Fallback to simple keyword search
        return { type: 'keyword', query: userQuery };
    }
}
