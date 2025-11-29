import SearchApp from "./components/SearchApp";
import { getChapters } from "@/lib/quran-api";

export default async function Home() {
  const chapters = await getChapters();

  return (
    <main className="bg-background min-h-screen">
      <SearchApp chapters={chapters} />

      <footer className="py-8 text-center text-xs text-gray-400 border-t border-gray-100 mt-auto">
        <p>Quran Search • Powered by AI</p>
      </footer>
    </main>
  );
}
