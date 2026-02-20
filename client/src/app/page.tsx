import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">element8 nuox machine test</h1>
        <p className="text-xl text-gray-600 mb-8">Muhammed Nasim</p>

        <Link href="/teachers">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
            Go to Teachers Directory
          </button>
        </Link>
      </div>
    </main>
  );
}
