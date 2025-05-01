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
import toast, { Toaster } from "react-hot-toast";
import { Block } from "../context/puzzleContext";
// Grid size for spacing
const grid = 8;

// Styling for draggable items
const getItemStyle = (
  isDragging: boolean,
  draggableStyle?: any,
  blockId?: number,
  incorrectBlocks: number[] = [],
  indent?: number
) => ({
  userSelect: "none",
  padding: grid,
  paddingRight: grid * 0.5,
  margin: `${grid}px 0 ${grid}px ${grid}px`,
  background: isDragging ? "#f0f9ff" : "white", // Light blue when dragging
  borderRadius: "0.375rem", // rounded-lg equivalent
  width: "fit-content",
  boxShadow: isDragging
    ? "0 4px 6px rgba(0, 0, 0, 0.1)"
    : "0 1px 2px rgba(0, 0, 0, 0.05)",
  position: "relative", // Add this to position the question mark relative to the block
  border: incorrectBlocks.includes(blockId || -1)
    ? "2px solid #ef4444"
    : "none", // Apply red border if block is incorrect
  marginLeft: indent ? indent * 16 : 0,
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
  const [incorrectBlockIndices, setIncorrectBlockIndices] = useState<number[]>([]);
  // Add a new state to track incorrect blocks

  const [history, setHistory] = useState<{ block: Block[]; placed: Block[] }[]>(
    []
  );
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null);
  const [showHint, setShowHint] = useState<number | null>(null);
  const [hoveringQuestion, setHoveringQuestion] = useState<number | null>(null);

  const [hintedBlockId, setHintedBlockId] = useState<number | null>(null);
  const [hintDirection, setHintDirection] = useState<"up" | "down" | null>(
    null
  );
  const [hintDisabled, setHintDisabled] = useState(false);

  useEffect(() => {
    const initialBlocks = puzzle.blocks.sort(() => Math.random() - 0.5);
    setBlocks(initialBlocks);
    setHistory([{ block: initialBlocks, placed: [] }]);
    setCurrentStep(0);
  }, [puzzle.blocks]);


  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return; // dropped outside any list

    // Figure out which arrays we're working with
    const srcList = source.droppableId === "available" ? blocks : placed;
    const dstList = destination.droppableId === "available" ? blocks : placed;

    // If same list → just reorder
    if (source.droppableId === destination.droppableId) {
      const newList = Array.from(srcList);
      const [moved] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, moved);

      setPlaced(newList);
      const newHistory = [
        ...history.slice(0, currentStep + 1),
        { block: blocks, placed: newList },
      ];
      setHistory(newHistory);
      setCurrentStep(currentStep + 1);

      return;
    } else {
      // Cross‐list move
      const newSrc = Array.from(srcList);
      const newDst = Array.from(dstList);
      const [moved] = newSrc.splice(source.index, 1);
      newDst.splice(destination.index, 0, moved);

      setBlocks(newSrc);
      setPlaced(newDst);
      const newHistory = [
        ...history.slice(0, currentStep + 1),
        { block: newSrc, placed: newDst },
      ];
      setHistory(newHistory);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleRedo = () => {
    console.log(currentStep);
    if (currentStep < history.length - 1) {
      const nextState = history[currentStep + 1];
      setBlocks(nextState.block);
      setPlaced(nextState.placed);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleUndo = () => {
    if (currentStep > 0) {
      console.log(currentStep);
      const previousState = history[currentStep - 1];
      setBlocks(previousState.block);
      setPlaced(previousState.placed);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCheck = (placed: Block[]) => {
    const incorrectBlockIndices = placed.filter((b, idx) => b.id - 1 !== idx).map((b) => b.id);

    if (incorrectBlockIndices.length === 0 && placed.length === puzzle.blocks.length) {
      toast.success("Correct!");
      setIncorrectBlockIndices([]);
    } else {
      setIncorrectBlockIndices(incorrectBlockIndices);
      toast.error("Incorrect! Try again.");
    }
  };

  const handleHint = () => {
    const incorrect = placed.filter((b, idx) => b.id - 1 !== idx);
    if (incorrect.length === 0) return;

    console.log(incorrect.length);

    //picking random block
    const randomBlock = incorrect[Math.floor(Math.random() * incorrect.length)];
    const currentIndex = placed.findIndex((b) => b.id === randomBlock.id);
    const correctIndex = randomBlock.id - 1;

    const direction: "up" | "down" =
      correctIndex < currentIndex ? "up" : "down";

    console.log(randomBlock);
    console.log(direction);

    setHintedBlockId(randomBlock.id);
    setHintDirection(direction);
    setHintDisabled(true);

    setTimeout(() => {
      setHintDisabled(false);
      setHintedBlockId(null);
    }, 10_000);

    setTimeout(() => {
      setHintDirection(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-200 p-6">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Available blocks */}
          <Droppable droppableId="available" isDropDisabled={true}>
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
                          provided.draggableProps.style,
                          block.id,
                          incorrectBlockIndices
                        )}
                        onMouseEnter={() => setHoveredBlock(block.id)}
                        onMouseLeave={() => {
                          setHoveredBlock(null);
                          if (hoveringQuestion !== block.id) {
                            setShowHint(null);
                          }
                        }}
                      >
                        <div className="relative inline-flex items-center justify-center">
                          <MonacoHighlighter code={block.code.trim()} />

                          {(hoveredBlock === block.id ||
                            hoveringQuestion === block.id) && (
                            <div
                              className="absolute -right-8 top-1/2 transform -translate-y-1/2 w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center cursor-pointer"
                              title="Get a hint for this block"
                              onMouseEnter={() => {
                                setHoveringQuestion(block.id);
                                setShowHint(block.id);
                              }}
                              onMouseLeave={() => {
                                setHoveredBlock(null);
                                setHoveringQuestion(null);
                                setShowHint(null);
                              }}
                            >
                              <span className="text-gray-700 text-lg font-semibold">
                                ?
                              </span>
                            </div>
                          )}
                        </div>
                        {showHint === block.id && (
                          <div className="absolute left-20 w-64 p-0 bg-teal-100 rounded-md shadow-md z-10 border border-teal-200">
                            <p className="text-sm font-mono text-gray-900">
                              {block.hint}
                            </p>
                          </div>
                        )}
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
                          provided.draggableProps.style,
                          block.id,
                          incorrectBlockIndices,
                          block.indent
                        )}
                        onMouseEnter={() => setHoveredBlock(block.id)}
                        onMouseLeave={() => {
                          setHoveredBlock(null);
                          if (hoveringQuestion !== block.id) {
                            setShowHint(null);
                          }
                        }}
                      >
                        <div className="relative inline-flex items-center justify-center">
                          <MonacoHighlighter code={block.code.trim()} />
                          {hintedBlockId === block.id &&
                            hintDirection === "up" && (
                              <span
                                className="
                            absolute left-1/2 -translate-x-1/2
                            -top-6.5 text-red-500 text-2l
                            "
                              >
                                ▲
                              </span>
                            )}
                          {hintedBlockId === block.id &&
                            hintDirection === "down" && (
                              <span
                                className="
                            absolute left-1/2 -translate-x-1/2
                            -bottom-6.5 text-red-500 text-2l z-10
                            "
                              >
                                ▼
                              </span>
                            )}
                          {(hoveredBlock === block.id ||
                            hoveringQuestion === block.id) && (
                            <div
                              className="absolute -right-8 top-1/2 transform -translate-y-1/2 w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center cursor-pointer"
                              title="Get a hint for this block"
                              onMouseEnter={() => {
                                setHoveringQuestion(block.id);
                                setShowHint(block.id);
                              }}
                              onMouseLeave={() => {
                                setHoveringQuestion(null);
                                setShowHint(null);
                                setHoveredBlock(null);
                              }}
                            >
                              <span className="text-gray-700 text-lg font-semibold">
                                ?
                              </span>
                            </div>
                          )}
                        </div>

                        {showHint === block.id && (
                          <div className="absolute left-20 w-64 p-3 bg-teal-100 rounded-md shadow-md z-10 border border-teal-200">
                            <p className="text-sm font-mono text-gray-900">
                              {block.hint}
                            </p>
                          </div>
                        )}
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
          <button
            className="px-4 py-2 bg-blue-800 text-white rounded-lg mr-2 disabled:opacity-50 cursor-pointer "
            onClick={handleUndo}
            disabled={currentStep <= 0}
          >
            undo
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 cursor-pointer"
            onClick={handleRedo}
            disabled={currentStep >= history.length - 1}
          >
            redo
          </button>
        </div>
        <div>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2  disabled:opacity-50"
            onClick={() => handleHint()}
            disabled={hintDisabled}
          >
            hint
          </button>
          <button
            className="px-4 py-2 bg-pink-600 text-white rounded-lg cusor-pointer"
            onClick={() => handleCheck(placed)}
          >
            check
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
