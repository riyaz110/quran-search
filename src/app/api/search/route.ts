import { NextResponse } from 'next/server';
import { understandQuery, generateTawil } from '@/lib/genai';
import { getVerseWithContext, searchVerses, Verse, EDITIONS } from '@/lib/quran-api';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        // 1. Understand the query using GenAI
        const intent = await understandQuery(query);
        console.log('Search Intent:', JSON.stringify(intent, null, 2)); // DEBUG LOG

        let results: Verse[] = [];

        // 2. Execute Search based on intent
        if (intent.type === 'verse_key' && intent.verseKey) {
            // Direct verse lookup with context
            const verses = await getVerseWithContext(intent.verseKey, 1); // 1 verse before/after
            results = verses;
        } else {
            // Hybrid Search: Recommended Verses + Keyword Search

            // A. Fetch Recommended Verses (if any)
            let recommendedResults: Verse[] = [];
            if (intent.recommendedVerses && intent.recommendedVerses.length > 0) {
                console.log('Fetching recommended verses:', intent.recommendedVerses); // DEBUG LOG
                const recommendedPromises = intent.recommendedVerses.map(async (vk) => {
                    try {
                        const v = await getVerseWithContext(vk, 0);
                        return v;
                    } catch (e) {
                        console.error(`Failed to fetch recommended verse ${vk}`, e);
                        return [];
                    }
                });
                const recommendedNested = await Promise.all(recommendedPromises);
                recommendedResults = recommendedNested.flat();
                console.log('Fetched recommended count:', recommendedResults.length); // DEBUG LOG
            }

            // B. Keyword/Topic search
            // Use the optimized query from GenAI to search the Quran API
            console.log('Executing keyword search for:', intent.query); // DEBUG LOG
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
            const keywordResults = detailedResultsNested.flat();

            // C. Merge Results (Recommended first)
            results = [...recommendedResults, ...keywordResults];

            // Remove duplicates if any (e.g. overlapping contexts)
            const uniqueIds = new Set();
            results = results.filter(v => {
                if (uniqueIds.has(v.id)) return false;
                uniqueIds.add(v.id);
                return true;
            });
        }

        // 3. Generate Ismaili Ta'wil for the results (Limit to top 5 to avoid rate limits/latency)
        // We will process them in parallel
        const resultsWithTawil = await Promise.all(results.slice(0, 5).map(async (verse) => {
            const translation = verse.translations?.find(t => t.resource_id === EDITIONS.yusufali)?.text || "";
            const tawil = await generateTawil(verse.verse_key, verse.text_uthmani || "", translation);
            return { ...verse, tawil: tawil || undefined };
        }));

        // Combine with the rest of the results (which won't have tawil for now to save time)
        const finalResults = [
            ...resultsWithTawil,
            ...results.slice(5)
        ];

        console.log('Total results returned:', finalResults.length); // DEBUG LOG
        return NextResponse.json({ intent, results: finalResults });
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
