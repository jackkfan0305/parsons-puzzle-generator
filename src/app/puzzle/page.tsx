"use client";
import { useEffect, useState } from "react";
import { usePuzzle } from "../context/puzzleContext";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { MonacoHighlighter } from "../../components/monacoHighlighter";

interface Block {
  id: number;
  code: string;
}

// Grid size for spacing
const grid = 8;

// Styling for draggable items
const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  userSelect: "none",
  padding: grid,
  margin: `0 0 ${grid}px 0`,
  background: isDragging ? "#f0f9ff" : "white", // Light blue when dragging
  borderRadius: "0.375rem", // rounded-lg equivalent
  width: "fit-content",
  boxShadow: isDragging
    ? "0 4px 6px rgba(0, 0, 0, 0.1)"
    : "0 1px 2px rgba(0, 0, 0, 0.05)",
  ...draggableStyle,
});

// Styling for droppable containers
const getListStyle = (isDraggingOver: boolean, isSource: boolean) => ({
  background: isDraggingOver
    ? isSource
      ? "#fef3c7"
      : "#fffbeb" // Slightly darker when dragging over
    : isSource
    ? "#fef9c3"
    : "#fef5d3", // Normal background colors
  padding: grid,
  borderRadius: "0.5rem",
  minHeight: "80vh",
  overflow: "auto",
});

export default function PuzzlePage() {
  const puzzle = usePuzzle();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [placed, setPlaced] = useState<Block[]>([]);

  useEffect(() => {
    setBlocks(puzzle.blocks.sort(() => Math.random() - 0.5));
  }, [puzzle.blocks]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return; // dropped outside any list

    // Figure out which arrays we’re working with
    const srcList = source.droppableId === "available" ? blocks : placed;
    const dstList = destination.droppableId === "available" ? blocks : placed;

    // If same list → just reorder
    if (source.droppableId === destination.droppableId) {
      const newList = Array.from(srcList);
      const [moved] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, moved);

      if (source.droppableId === "available") {
        setBlocks(newList);
      } else {
        setPlaced(newList);
      }
      return;
    }

    // Cross‐list move
    const newSrc = Array.from(srcList);
    const newDst = Array.from(dstList);
    const [moved] = newSrc.splice(source.index, 1);
    newDst.splice(destination.index, 0, moved);

    // Write back to state in the correct order
    if (source.droppableId === "available") {
      setBlocks(newSrc);
      setPlaced(newDst);
    } else {
      setPlaced(newSrc);
      setBlocks(newDst);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-6">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Available blocks */}
          <Droppable droppableId="available">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={getListStyle(snapshot.isDraggingOver, true)}
              >
                {blocks.map((block, index) => (
                  <Draggable
                    key={block.id}
                    draggableId={block.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                      >
                        <MonacoHighlighter code={block.code} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Right: Drop zone */}
          <Droppable droppableId="placed">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={getListStyle(snapshot.isDraggingOver, false)}
              >
                {placed.length === 0 && (
                  <p className="text-gray-500 p-4">Drag code blocks here</p>
                )}
                {placed.map((block, index) => (
                  <Draggable
                    key={block.id}
                    draggableId={block.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                      >
                        <MonacoHighlighter code={block.code} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      {/* Controls */}
      <div className="mt-6 flex justify-between">
        <div>
          <button className="px-4 py-2 bg-blue-800 text-white rounded-lg mr-2">
            undo
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            redo
          </button>
        </div>
        <div>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2">
            hint
          </button>
          <button className="px-4 py-2 bg-pink-600 text-white rounded-lg">
            check
          </button>
        </div>
      </div>
    </div>
  );
}
