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
  You are an expert Quran search assistant with deep knowledge of Ismaili Gnosis, the works of the Institute of Ismaili Studies (IIS), and the teachings of the Aga Khan.
  
  Query: "${userQuery}"
  
  Instructions:
  1. **Direct Recommendations**: If the user asks a question or topic that has famous or specific answers in the Quran, provide the verse keys in "recommendedVerses".
     - Example: "prayer times" -> ["17:78", "11:114", "20:130"]
     - Example: "Ayatul Kursi" -> ["2:255"]
     - Example: "Light" or "Nur" -> ["24:35", "57:28", "4:174"] (Verses often interpreted as referring to the Imam)
     - Example: "Imam" or "Guide" -> ["36:12", "17:71", "21:73"]
  2. **Phonetic/Semantic**: Handle phonetic spelling and synonyms.
  3. **Ismaili Concepts**: If the user asks for concepts like "Intellect" (Aql), "Soul" (Nafs), "Light" (Nur), or "Imamat", prioritize verses relevant to Ismaili Ta'wil.
  4. **Keywords**: Generate broad search keywords for the search engine.
  
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
  "concept of imam" -> {"type": "topic", "query": "Imam Guide Leader", "recommendedVerses": ["36:12", "17:71"]}
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

export async function generateTawil(verseKey: string, arabicText: string, translation: string): Promise<string | null> {
    if (!apiKey) return null;

    const prompt = `
    You are an expert Ismaili Gnosis scholar. Provide a "Ta'wil" (esoteric interpretation) for the following Quranic verse.
    
    Verse: ${verseKey}
    Arabic: ${arabicText}
    Translation: ${translation}
    
    **Sources & Priorities:**
    1. **Aga Khan IV (The Present Imam)**: Prioritize any Farmans, speeches, or interviews where he references this verse or concept.
    2. **Previous Imams**: Cite works or sayings of previous Imams (e.g., Imam Sultan Muhammad Shah, Imam Ali).
    3. **Ismaili Scholars**: Cite Allamah Nasir Hunzai, Nasir Khusraw (Knowledge & Liberation), Abu Yaqub al-Sijistani, Nasir al-Din Tusi, or Henry Corbin (Temple & Contemplation).
    4. **Institute of Ismaili Studies (IIS)**: Reference academic works from IIS.
    5. **Ismaili Gnosis**: Use concepts from ismailignosis.com.
    
    **Style:**
    - Be concise but profound (max 2-3 sentences).
    - **Cite your sources explicitly** (e.g., "As Mawlana Hazar Imam stated...", "Nasir Khusraw explains in Knowledge & Liberation...").
    - If no direct Ta'wil exists for this specific verse, look for neighboring verses or general Ismaili concepts related to the keywords in the verse.
    - If you are inferring the Ta'wil based on general principles, state: "From an Ismaili Gnosis perspective..."
    
    Output just the text of the Ta'wil. Do not use markdown formatting like bolding the whole thing.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error(`Error generating Ta'wil for ${verseKey}:`, error);
        return null;
    }
}
