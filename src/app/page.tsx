import SearchApp from "./components/SearchApp";

export default function Home() {
  return (
    <main className="bg-background min-h-screen">
      <SearchApp />

      <footer className="py-8 text-center text-xs text-gray-400 border-t border-gray-100 mt-auto">
        <p>Quran Search • Powered by AI</p>
      </footer>
    </main>
  );
}
