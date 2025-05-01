'use client'
import React, { createContext, useContext, useState } from 'react'

export interface Block { id: number; code: string; hint: string }
interface PuzzleContextType {
  blocks: Block[]
  setBlocks: (b: Block[]) => void
}
const PuzzleContext = createContext<PuzzleContextType | undefined>(undefined)

export const PuzzleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blocks, setBlocks] = useState<Block[]>([])
  return (
    <PuzzleContext.Provider value={{ blocks, setBlocks }}>
      {children}
    </PuzzleContext.Provider>
  )
}

export function usePuzzle() {
  const ctx = useContext(PuzzleContext)
  if (!ctx) throw new Error('usePuzzle must be inside a PuzzleProvider')
  return ctx
}
