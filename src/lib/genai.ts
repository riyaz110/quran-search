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
  You are an expert Quran search assistant. Your goal is to understand the user's intent, even if they use phonetic spelling or broad concepts.
  
  Query: "${userQuery}"
  
  Instructions:
  1. **Phonetic Correction**: If the user uses phonetic spelling (e.g., "Emaam", "Wudu", "Salah"), convert it to the standard English or Transliterated spelling (e.g., "Imam", "Wudu", "Salah").
  2. **Semantic Search**: If the user asks for a concept (e.g., "Leader"), include relevant Arabic terms (e.g., "Imam") in the query to broaden the search.
  3. **Question Answering**: If the user asks a question (e.g., "when to pray"), convert it into a search query with the core concepts and relevant Quranic terms (e.g., "prayer times dawn sun decline").
  4. **Keywords**: Extract the most relevant keywords for a search engine.
  
  Output JSON only:
  {
    "type": "keyword" | "verse_key" | "topic",
    "query": "optimized search keywords (include synonyms/Arabic terms if helpful)",
    "verseKey": "chapter:verse" (only if specific verse is requested)
  }
  
  Examples:
  "verses about patience" -> {"type": "topic", "query": "patience sabr"}
  "surah baqarah verse 255" -> {"type": "verse_key", "query": "Ayatul Kursi", "verseKey": "2:255"}
  "what are the recommended times to pray" -> {"type": "topic", "query": "prayer times salah dawn noon night"}
  "tell me about moses" -> {"type": "keyword", "query": "Moses Musa"}
  "what does the quran say about emaam" -> {"type": "topic", "query": "Imam Leader"}
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
