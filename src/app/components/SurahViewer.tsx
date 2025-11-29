'use client';

import { useState, useEffect } from 'react';
import { Verse, Chapter } from '@/lib/quran-api';
import { VerseCard } from './VerseCard';
import { Toggle } from './Toggle';
import { Search, ChevronDown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SurahViewer({
    initialVerses,
    chapters,
    currentChapterId
}: {
    initialVerses: Verse[],
    chapters: Chapter[],
    currentChapterId: number
}) {
    const router = useRouter();
    const [verses, setVerses] = useState<Verse[]>(initialVerses);

    // Translation Toggles
    const [showYusufAli, setShowYusufAli] = useState(true);
    const [showPickthall, setShowPickthall] = useState(true);
    const [showSahih, setShowSahih] = useState(true);
    const [showTransliteration, setShowTransliteration] = useState(true);

    const currentChapter = chapters.find(c => c.id === currentChapterId);

    const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = e.target.value;
        router.push(`/surah/${newId}`);
    };

    useEffect(() => {
        // Handle hash scrolling on mount
        const hash = window.location.hash;
        if (hash) {
            const id = hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a highlight effect
                element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
                setTimeout(() => {
                    element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
                }, 2000);
            }
        }
    }, [verses]); // Run when verses load

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            {/* Sticky Header */}
            <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 py-4 px-4 md:px-6 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    {/* Left: Back & Dropdown */}
                    <div className="flex items-center gap-3 flex-1">
                        <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>

                        <div className="relative group">
                            <select
                                value={currentChapterId}
                                onChange={handleChapterChange}
                                className="appearance-none bg-transparent font-bold text-lg md:text-xl pr-8 cursor-pointer outline-none text-gray-900 dark:text-white"
                            >
                                {chapters.map(c => (
                                    <option key={c.id} value={c.id} className="text-gray-900 bg-white dark:bg-gray-900">
                                        {c.id}. {c.name_simple}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Right: Search & Settings */}
                    <div className="flex items-center gap-2">
                        <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <Search className="w-5 h-5 text-gray-500" />
                        </Link>
                    </div>
                </div>

                {/* Toggles Row (Mobile optimized) */}
                <div className="max-w-4xl mx-auto mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <Toggle label="Transliteration" active={showTransliteration} onClick={() => setShowTransliteration(!showTransliteration)} />
                    <Toggle label="Yusuf Ali" active={showYusufAli} onClick={() => setShowYusufAli(!showYusufAli)} />
                    <Toggle label="Pickthall" active={showPickthall} onClick={() => setShowPickthall(!showPickthall)} />
                    <Toggle label="Sahih" active={showSahih} onClick={() => setShowSahih(!showSahih)} />
                </div>
            </nav>

            {/* Content */}
            <main className="flex-1 container max-w-4xl mx-auto py-8 px-4">
                {/* Bismillah */}
                {currentChapterId !== 1 && currentChapterId !== 9 && (
                    <div className="text-center mb-12 font-arabic text-3xl text-gray-800 dark:text-gray-200">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                    </div>
                )}

                <div className="space-y-4">
                    {verses.map((verse) => (
                        <VerseCard
                            key={verse.id}
                            id={verse.verse_key}
                            verse={verse}
                            showYusufAli={showYusufAli}
                            showPickthall={showPickthall}
                            showSahih={showSahih}
                            showTransliteration={showTransliteration}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
