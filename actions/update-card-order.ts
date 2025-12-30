"use server"; // Oznacza, że kod działa na backendzie

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

type CardUpdate = {
  id: string;
  order: number;
  columnId: string;
};

export async function updateCardOrder(items: CardUpdate[]) {
  try {
    // Tworzymy transakcję - albo zaktualizują się wszystkie karty, albo żadna
    const transaction = items.map((card) =>
      db.card.update({
        where: { id: card.id },
        data: {
          order: card.order,
          columnId: card.columnId,
        },
      })
    );

    await db.$transaction(transaction);
    
    // Odśwież cache strony, żeby serwer wiedział o zmianach
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Błąd zapisu:", error);
    return { error: "Nie udało się zapisać zmian." };
  }
}