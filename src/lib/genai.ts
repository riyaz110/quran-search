import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface SearchIntent {
    type: 'keyword' | 'verse_key' | 'topic';
    query: string; // The cleaned query or keywords
    verseKey?: string; // If specific verse is requested
    recommendedVerses?: string[]; // List of specific verse keys to fetch (e.g. ["17:78", "2:255"])
}

export async function understandQuery(userQuery: string): Promise<SearchIntent> {
    if (!apiKey) {
        console.error("API Key is missing");
        return { type: 'keyword', query: userQuery };
    }

    const prompt = `
  You are an expert Quran search assistant. Your goal is to understand the user's intent and recommend specific verses if possible.
  
  Query: "${userQuery}"
  
  Instructions:
  1. **Direct Recommendations**: If the user asks a question or topic that has famous or specific answers in the Quran, provide the verse keys in "recommendedVerses".
     - Example: "prayer times" -> ["17:78", "11:114", "20:130"]
     - Example: "Ayatul Kursi" -> ["2:255"]
  2. **Phonetic/Semantic**: Handle phonetic spelling and synonyms as before.
  3. **Keywords**: Generate broad search keywords for the search engine.
  
  Output JSON only:
  {
    "type": "keyword" | "verse_key" | "topic",
    "query": "optimized search keywords",
    "verseKey": "chapter:verse" (only if a SINGLE specific verse is clearly requested),
    "recommendedVerses": ["chapter:verse", "chapter:verse"] (list of relevant verses to fetch directly)
  }
  
  Examples:
  "verses about patience" -> {"type": "topic", "query": "patience sabr", "recommendedVerses": ["2:153", "39:10"]}
  "what are the recommended times to pray" -> {"type": "topic", "query": "prayer times salah", "recommendedVerses": ["17:78", "11:114", "20:130", "30:17"]}
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
