import { db } from "@/lib/db";
import Board from "./components/Board"; // Importujemy nasz nowy komponent

export default async function Home() {
  // 1. Pobieramy dane (to się dzieje na serwerze)
  const boards = await db.board.findMany({
    include: {
      columns: {
        include: {
          cards: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  // Zakładamy, że wyświetlamy pierwszą tablicę (uproszczenie)
  const firstBoard = boards[0];

  if (!firstBoard) {
    return <div className="p-10">Brak tablic w bazie. Dodaj je przez Prisma Studio.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-black">
      <header className="p-6 bg-white border-b border-gray-200 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{firstBoard.title}</h1>
      </header>

      <main className="px-6 flex-1 overflow-x-auto">
        {/* Przekazujemy dane do komponentu klienckiego */}
        <Board columns={firstBoard.columns} />
      </main>
    </div>
  );
}