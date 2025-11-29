const BASE_URL = 'https://api.quran.com/api/v4';

// Edition IDs
export const EDITIONS = {
    yusufali: 22,
    pickthall: 19,
    sahih: 20,
    transliteration: 57,
};

export interface Translation {
    resource_id: number;
    text: string;
    resource_name: string;
}

export interface Verse {
    id: number;
    verse_key: string;
    text_uthmani?: string;
    translations?: Translation[];
    words?: {
        transliteration: {
            text: string;
        }
    }[];
    tawil?: string;
}

/**
 * Fetch a specific verse by key (e.g., "1:1") with translations and transliteration.
 */
export async function getVerse(verseKey: string): Promise<Verse | null> {
    try {
        const response = await fetch(
            `${BASE_URL}/verses/by_key/${verseKey}?language=en&words=true&translations=${Object.values(EDITIONS).join(',')}&fields=text_uthmani`
        );

        if (!response.ok) return null;
        const data = await response.json();
        return data.verse;
    } catch (error) {
        console.error('Error fetching verse:', error);
        return null;
    }
}

/**
 * Fetch a verse with surrounding context (e.g., 1 before, 1 after).
 */
export async function getVerseWithContext(verseKey: string, contextSize = 1): Promise<Verse[]> {
    const [chapter, verseNum] = verseKey.split(':').map(Number);
    if (!chapter || !verseNum) return [];

    const start = Math.max(1, verseNum - contextSize);
    // We don't know the max verses in a chapter easily without another call, 
    // but the API will just return 404 or empty for invalid keys, or we can handle it.
    // A better way is to fetch by chapter and filter, but that's heavy.
    // Let's just try to fetch the range.

    const promises = [];
    for (let i = start; i <= verseNum + contextSize; i++) {
        promises.push(getVerse(`${chapter}:${i}`));
    }

    const results = await Promise.all(promises);
    return results.filter((v): v is Verse => v !== null);
}

/**
 * Search for verses (using the API's search, or we will use GenAI to get keys and then fetch).
 * This function is for direct text search if needed.
 */
export async function searchVerses(query: string) {
    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}&size=10&language=en`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.search.results;
}

export interface Chapter {
    id: number;
    name_simple: string;
    name_arabic: string;
    verses_count: number;
}

export async function getChapters(): Promise<Chapter[]> {
    try {
        const response = await fetch(`${BASE_URL}/chapters`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.chapters;
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return [];
    }
}

export async function getSurahVerses(chapterId: number): Promise<Verse[]> {
    try {
        // First fetch to get verses and total count (if available) or just first page
        const perPage = 50;
        const params = `language=en&words=true&translations=${Object.values(EDITIONS).join(',')}&fields=text_uthmani&per_page=${perPage}`;
        const response = await fetch(`${BASE_URL}/verses/by_chapter/${chapterId}?${params}&page=1`, { cache: 'no-store' });

        if (!response.ok) {
            console.error(`Fetch failed for chapter ${chapterId}: ${response.status} ${response.statusText}`);
            return [];
        }
        const data = await response.json();
        console.log(`Fetched page 1 for chapter ${chapterId}, verses: ${data.verses?.length}, total_pages: ${data.pagination?.total_pages}`);

        let verses = data.verses as Verse[];

        // If we have pagination info, we can fetch the rest
        // The API v4 usually returns pagination meta. 
        // If not, we can estimate based on verses length.

        const totalPages = data.pagination?.total_pages || 1;

        if (totalPages > 1) {
            const promises = [];
            for (let p = 2; p <= totalPages; p++) {
                promises.push(
                    fetch(`${BASE_URL}/verses/by_chapter/${chapterId}?${params}&page=${p}`, { cache: 'no-store' })
                        .then(res => res.json())
                        .then(d => d.verses)
                );
            }

            const results = await Promise.all(promises);
            results.forEach(pageVerses => {
                verses = [...verses, ...pageVerses];
            });
        }

        return verses;
    } catch (error) {
        console.error(`Error fetching surah ${chapterId}:`, error);
        return [];
    }
}
