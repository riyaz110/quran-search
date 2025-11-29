'use client';

import { useState } from 'react';
import { Search, BookOpen, Sparkles, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Verse, EDITIONS } from '@/lib/quran-api';

import { Toggle } from './Toggle';
import { VerseCard } from './VerseCard';

export default function SearchApp() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Verse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // Translation Toggles
    const [showYusufAli, setShowYusufAli] = useState(true);
    const [showPickthall, setShowPickthall] = useState(true);
    const [showSahih, setShowSahih] = useState(true);
    const [showTransliteration, setShowTransliteration] = useState(true);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        setResults([]);

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.results) {
                setResults(data.results);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            {/* Navbar Placeholder */}
            <nav className="border-b border-gray-100 dark:border-gray-800 py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-50">
                <div className="font-bold text-xl tracking-tight text-primary">Quran.com AI</div>
                <div className="flex gap-4 text-sm font-medium text-gray-500">
                    <button className="hover:text-primary transition-colors">Settings</button>
                </div>
            </nav>

            {/* Hero / Search Area */}
            <div className={cn(
                "flex flex-col items-center transition-all duration-500 ease-in-out px-4",
                searched ? "py-8" : "justify-center min-h-[70vh]"
            )}>
                <div className="w-full max-w-3xl space-y-8 text-center">
                    {!searched && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                <BookOpen className="w-16 h-16 text-primary" />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
                                What do you want to read?
                            </h1>
                            <p className="text-lg text-gray-500 dark:text-gray-400">
                                Explore the Quran with AI-powered search and translations.
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSearch} className="relative w-full group max-w-2xl mx-auto">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-gray-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by Surah, Verse, or Topic (e.g. 'Patience')"
                            className="w-full pl-14 pr-14 py-5 text-xl rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md focus:shadow-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 outline-none bg-white dark:bg-gray-800"
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center">
                            {loading ? (
                                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <button type="submit" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </button>
                            )}
                        </div>
                    </form>

                    {!searched && (
                        <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500">
                            <span className="py-1">Popular:</span>
                            <button onClick={() => setQuery("Surah Yaseen")} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Surah Yaseen</button>
                            <button onClick={() => setQuery("Ayatul Kursi")} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Ayatul Kursi</button>
                            <button onClick={() => setQuery("Stories of Prophets")} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Stories of Prophets</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Area */}
            {searched && (
                <div className="flex-1 container max-w-4xl mx-auto pb-20 animate-slide-up px-4">
                    {/* Controls */}
                    <div className="sticky top-[73px] z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md py-4 mb-8 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {loading ? 'Searching...' : `Search Results`}
                        </h2>

                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex-wrap">
                            <Toggle label="Transliteration" active={showTransliteration} onClick={() => setShowTransliteration(!showTransliteration)} />
                            <Toggle label="Yusuf Ali" active={showYusufAli} onClick={() => setShowYusufAli(!showYusufAli)} />
                            <Toggle label="Pickthall" active={showPickthall} onClick={() => setShowPickthall(!showPickthall)} />
                            <Toggle label="Sahih" active={showSahih} onClick={() => setShowSahih(!showSahih)} />
                        </div>
                    </div>

                    {/* List */}
                    <div className="space-y-4">
                        {results.map((verse) => (
                            <VerseCard
                                key={verse.id}
                                verse={verse}
                                showYusufAli={showYusufAli}
                                showPickthall={showPickthall}
                                showSahih={showSahih}
                                showTransliteration={showTransliteration}
                            />
                        ))}

                        {!loading && results.length === 0 && (
                            <div className="text-center py-20 text-gray-500">
                                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No verses found. Try a different query.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
