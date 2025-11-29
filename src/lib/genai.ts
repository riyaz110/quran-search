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
     - Example: "prayer times" -> ["11:114", "17:78", "24:58"] (Verses indicating the 3 times of prayer: Morning, Evening, Night)
     - Example: "Ayatul Kursi" -> ["2:255"]
     - Example: "Light" or "Nur" -> ["24:35", "57:28", "4:174"] (Verses often interpreted as referring to the Imam)
     - Example: "Imam" or "Guide" -> ["36:12", "17:71", "21:73"]
     - Example: "Dasond" or "Zakat" -> ["9:103", "6:141"] (Purification of wealth)
     - Example: "Bandagi" or "Ibadat" or "Night Prayer" -> ["73:1", "73:6", "17:79", "32:16"] (Bait-ul-Khayal / Night Vigil)
     - Example: "Nass" or "Succession" -> ["5:67", "4:59", "3:33"] (Designation of the Imam)
  2. **Ismaili Context**: If the user asks about "prayer", "salah", "namaz", or "how to pray", understand that Ismailis recite the **Holy Dua** three times a day (Subh, Maghrib, Isha) in Jamatkhana or at home. Prioritize verses that support this practice (e.g., 11:114, 17:78).
  3. **Phonetic/Semantic**: Handle phonetic spelling and synonyms.
  4. **Ismaili Concepts**: If the user asks for concepts like "Intellect" (Aql), "Soul" (Nafs), "Light" (Nur), "Imamat", "Dasond", "Bandagi", or "Nass", prioritize verses relevant to Ismaili Ta'wil.
  5. **Keywords**: Generate broad search keywords for the search engine.
  
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
  "what is dasond" -> {"type": "topic", "query": "zakat purification wealth", "recommendedVerses": ["9:103", "6:141"]}
  "verses about bandagi" -> {"type": "topic", "query": "night prayer tahajjud", "recommendedVerses": ["73:6", "17:79"]}
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
    
    **Sources & Priorities (MUST CITE DIRECTLY):**
    1. **The Holy Dua**: If this verse is part of the Ismaili Dua (e.g., 4:59, 36:12, 48:10), explicitly mention its place in the Dua (e.g., "Recited in the 2nd Part of the Holy Dua...") and its significance.
    2. **Farmans of the Aga Khan**: Quote relevant Farmans of Mawlana Hazar Imam or previous Imams if applicable.
    3. **Quranic Context**: Connect to other relevant verses.
    4. **Ismaili Scholars**: Cite Allamah Nasir Hunzai, Nasir Khusraw, Sijistani, etc.
    
    **Style:**
    - Be concise but profound (max 3-4 sentences).
    - **MANDATORY**: You MUST provide direct quotes or specific references (e.g., "As recited in the Dua...", "Mawlana Hazar Imam has said...", "In Knowledge & Liberation, Nasir Khusraw states...").
    - If explaining concepts like Dasond, Bandagi, or Nass, link them to the verse.
    
    Output just the text of the Ta'wil.
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
