import { Verse, EDITIONS } from '@/lib/quran-api';
import Link from 'next/link';

export function VerseCard({ verse, showYusufAli, showPickthall, showSahih, showTransliteration, id }: {
    verse: Verse,
    showYusufAli: boolean,
    showPickthall: boolean,
    showSahih: boolean,
    showTransliteration: boolean,
    id?: string
}) {
    const getTranslation = (id: number) => verse.translations?.find(t => t.resource_id === id)?.text;
    const cleanText = (text?: string) => text?.replace(/<[^>]*>/g, '') || '';

    return (
        <div id={id} className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
            {/* Verse Key Badge */}
            <div className="absolute top-0 left-0 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-br-xl border-b border-r border-gray-100 dark:border-gray-700 z-10">
                <a
                    href={`/surah/${verse.verse_key.split(':')[0]}#${verse.verse_key}`}
                    className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors block"
                >
                    {verse.verse_key}
                </a>
            </div>

            <div className="p-6 pt-12 md:p-8 md:pt-8 flex flex-col gap-8">
                {/* Arabic Text */}
                <div className="w-full text-right" dir="rtl">
                    <p className="text-3xl md:text-5xl leading-[2] font-arabic text-gray-900 dark:text-gray-100 font-normal">
                        {verse.text_uthmani}
                    </p>
                </div>

                {/* Ismaili Ta'wil Box */}
                {verse.tawil && (
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#00A693]/5 to-[#00A693]/10 border border-[#00A693]/20 p-6 shadow-sm">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 opacity-10">
                            <img src="/ismaili-icon.png" alt="Ismaili Icon" className="w-full h-full object-contain" />
                        </div>

                        <div className="flex gap-4 relative z-10">
                            <div className="flex-shrink-0 pt-1">
                                <img src="/ismaili-icon.png" alt="Ismaili Icon" className="w-8 h-8 object-contain" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-[#00A693] uppercase tracking-wider flex items-center gap-2">
                                    Ismaili Gnosis & Ta'wil
                                </h4>
                                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-serif italic">
                                    "{verse.tawil}"
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Translations */}
                <div className="space-y-6 w-full">
                    {showTransliteration && (
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 leading-relaxed">
                                {cleanText(getTranslation(EDITIONS.transliteration))}
                            </p>
                            <p className="mt-3 text-xs text-gray-400 font-bold uppercase tracking-wider">Transliteration</p>
                        </div>
                    )}

                    {showSahih && (
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 leading-relaxed">
                                {cleanText(getTranslation(EDITIONS.sahih))}
                            </p>
                            <p className="mt-3 text-xs text-gray-400 font-bold uppercase tracking-wider">Sahih International</p>
                        </div>
                    )}

                    {showYusufAli && (
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 leading-relaxed">
                                {cleanText(getTranslation(EDITIONS.yusufali))}
                            </p>
                            <p className="mt-3 text-xs text-gray-400 font-bold uppercase tracking-wider">Yusuf Ali</p>
                        </div>
                    )}

                    {showPickthall && (
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 leading-relaxed">
                                {cleanText(getTranslation(EDITIONS.pickthall))}
                            </p>
                            <p className="mt-3 text-xs text-gray-400 font-bold uppercase tracking-wider">Pickthall</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Bar */}
            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 flex justify-end gap-4 border-t border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-xs font-medium text-gray-500 hover:text-primary uppercase tracking-wide">Copy</button>
                <button className="text-xs font-medium text-gray-500 hover:text-primary uppercase tracking-wide">Tafsir</button>
                <button className="text-xs font-medium text-gray-500 hover:text-primary uppercase tracking-wide">Play</button>
            </div>
        </div>
    );
}
