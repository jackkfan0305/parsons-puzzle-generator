"use client";
import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { usePuzzle } from "../context/puzzleContext";

interface Block {
  id: number;
  code: string;
}

export default function PuzzlePage() {
  const puzzle = usePuzzle();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [placed, setPlaced] = useState<Block[]>([]);

  useEffect(() => {
    setBlocks(puzzle.blocks.sort(() => Math.random() - 0.5));
  }, [puzzle.blocks]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    blockId: number
  ) => {
    e.dataTransfer.setData("text/plain", blockId.toString());
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData("text/plain"), 10);
    const block = blocks.find((b) => b.id === id);
    if (block) {
      setPlaced((prev) => [...prev, block]);
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const editorOptions = {
    readOnly: true,
    minimap: { enabled: false },
    lineNumbers: "off" as const,
    folding: false,
    glyphMargin: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 0,
    overviewRulerLanes: 0,
    renderLineHighlight: "none" as const,
    scrollbar: { vertical: "hidden", horizontal: "hidden" },
    padding: { top: 4, bottom: 4 },
    contextmenu: false,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "monospace",
    lineHeight: 1.2,
    wordWrap: "on" as const,
    wrappingStrategy: "advanced" as const,
    automaticLayout: true,
    fixedOverflowWidgets: true,
    scrollBeyondLastLine: false,
  };

  return (
    <div className="min-h-screen bg-gray-200 p-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Left: Available blocks */}
        <div className="bg-yellow-100 p-4 rounded-lg h-[80vh] overflow-auto">
          {blocks.map((block) => (
            <div
              key={block.id}
              draggable
              onDragStart={(e) => handleDragStart(e, block.id)}
              className="mb-2 px-1 py-1 bg-white rounded-lg shadow-sm cursor-move"
            >
              <div className="pointer-events-none">
                <Editor
                  height="24px"
                  defaultLanguage="python"
                  value={block.code}
                  options={editorOptions}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Right: Drop zone */}
        <div
          className="bg-yellow-50 p-4 rounded-lg h-[80vh] overflow-auto"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {placed.length === 0 && (
            <p className="text-gray-500">Drag code blocks here</p>
          )}
          {placed.map((block) => (
            <div
              key={block.id}
              draggable
              onDragStart={(e) => handleDragStart(e, block.id)}
              className="mb-2 px-2 py-1 bg-white rounded-lg shadow-sm cursor-move"
            >
              <div className="pointer-events-none">
                <Editor
                  height="24px"
                  defaultLanguage="python"
                  value={block.code}
                  options={editorOptions}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

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
