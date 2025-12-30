"use client";

import { updateCardOrder } from "@/actions/update-card-order";
//import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";

type Card = {
  id: string;
  title: string;
  order: number;
};

type Column = {
  id: string;
  title: string;
  cards: Card[];
};

type BoardProps = {
  columns: Column[];
};

export default function Board({ columns: initialColumns }: BoardProps) {
  const [columns, setColumns] = useState(initialColumns);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: any) => {
    const { destination, source } = result;

    // 1. Jeśli upuszczono poza listę
    if (!destination) return;

    // 2. Jeśli upuszczono w tym samym miejscu
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newColumns = [...columns];
    const sourceColIndex = newColumns.findIndex((col) => col.id === source.droppableId);
    const destColIndex = newColumns.findIndex((col) => col.id === destination.droppableId);

    const sourceCol = newColumns[sourceColIndex];
    const destCol = newColumns[destColIndex];

    if (!sourceCol || !destCol) return;

    let moveCard;

    // SCENARIUSZ A: Ta sama kolumna
    if (source.droppableId === destination.droppableId) {
      const newCards = Array.from(sourceCol.cards);
      const [movedCard] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, movedCard);

      newColumns[sourceColIndex] = {
        ...sourceCol,
        cards: newCards,
      };

      setColumns(newColumns);
      
      const cardsToUpdate = newCards.map((card, index) => ({
        id: card.id,
        order: index,
        columnId: sourceCol.id,
      }));
      updateCardOrder(cardsToUpdate);
    }

    else {
    // SCENARIUSZ B: Inna kolumna
    const sourceCards = Array.from(sourceCol.cards);
    const destCards = Array.from(destCol.cards);
    const [movedCard] = sourceCards.splice(source.index, 1);

    destCards.splice(destination.index, 0, movedCard);

    newColumns[sourceColIndex] = { ...sourceCol, cards: sourceCards };
    newColumns[destColIndex] = { ...destCol, cards: destCards };

    setColumns(newColumns);

    const cardsToUpdate = destCards.map((card, index) => ({
        id: card.id,
        order: index,
        columnId: destCol.id,
    }));
    updateCardOrder(cardsToUpdate);
}
  };

  if (!isMounted) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {columns.map((column) => (
          <div key={column.id} className="min-w-[280px] bg-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-gray-600 mb-3">{column.title}</h3>

            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex flex-col gap-2 min-h-[100px]"
                >
                  {column.cards.map((card, index) => (
                    <Draggable key={card.id} draggableId={card.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-3 rounded shadow-sm border border-gray-200"
                        >
                          {card.title}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}