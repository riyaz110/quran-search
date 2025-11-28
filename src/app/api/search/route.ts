import { NextResponse } from 'next/server';
import { understandQuery } from '@/lib/genai';
import { searchVerses, getVerseWithContext, Verse } from '@/lib/quran-api';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        // 1. Understand the query using GenAI
        const intent = await understandQuery(query);
        console.log('Search Intent:', intent);

        let results: Verse[] = [];

        // 2. Execute Search based on intent
        if (intent.type === 'verse_key' && intent.verseKey) {
            // Direct verse lookup with context
            const verses = await getVerseWithContext(intent.verseKey, 1); // 1 verse before/after
            results = verses;
        } else {
            // Keyword/Topic search
            // Use the optimized query from GenAI to search the Quran API
            const searchResults = await searchVerses(intent.query);

            // For each result, we want to get the full details (translations, etc.)
            // The search API returns limited info, so we might need to fetch details for top results.
            // Let's limit to top 5 for performance.
            const topResults = searchResults.slice(0, 5);

            const detailedResultsPromises = topResults.map(async (r: any) => {
                // Fetch context for each result
                const verses = await getVerseWithContext(r.verse_key, 1);
                return verses;
            });

            const detailedResultsNested = await Promise.all(detailedResultsPromises);
            // Flatten the array
            results = detailedResultsNested.flat();

            // Remove duplicates if any (e.g. overlapping contexts)
            const uniqueIds = new Set();
            results = results.filter(v => {
                if (uniqueIds.has(v.id)) return false;
                uniqueIds.add(v.id);
                return true;
            });
        }

        return NextResponse.json({ intent, results });
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
