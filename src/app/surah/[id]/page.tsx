import { getChapters, getSurahVerses } from '@/lib/quran-api';
import SurahViewer from '@/app/components/SurahViewer';

export const dynamic = 'force-dynamic';

export default async function SurahPage({ params }: { params: { id: string } }) {
    const chapterId = parseInt(params.id);
    const [chapters, verses] = await Promise.all([
        getChapters(),
        getSurahVerses(chapterId)
    ]);

    return (
        <SurahViewer
            initialVerses={verses}
            chapters={chapters}
            currentChapterId={chapterId}
        />
    );
}
