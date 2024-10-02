// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { Edge, Node, NodeChange } from "@xyflow/react"
import { BoardState, UnitState } from "../logic"

// -----------------------------------------------------------------------------
// Type Declarations
// -----------------------------------------------------------------------------

export type UnitReach = Array<string[]>

export enum TileType {
  TILE = "tile",
  BASE = "base",
  SPAWN = "spawn",
}

export type TileNodeData = {
  label: string
  unit: UnitState | null
  reachable?: boolean
  phantom?: boolean
}

export type TileNodeType = Node<TileNodeData>

export type TileNodeMap = Record<string, TileNodeType>

export type TileNodeMapMutator = (nodes: TileNodeMap) => TileNodeMap

export type SetNodesPayload = TileNodeMap | TileNodeMapMutator

export type EdgeArrayMutator = (edges: Edge[]) => Edge[]

export type SetEdgesPayload = Edge[] | EdgeArrayMutator

export interface AppState {
  playerIndex: number
  isPlayerTurn: boolean
  nodes: TileNodeMap
  edges: Edge[]
  setBoardState: (board: BoardState) => void
  onNodesChange: (changes: NodeChange<TileNodeType>[]) => void
  startDragMovement: (sourceId: string) => void
  endDragMovement: () => void
  isValidMovement: (source: string, target: string) => boolean
  // onConnect: OnConnect
  // onDropNode: (x: number, y: number) => void
  spawn1p3mUnit: (id: string) => void
  setPlayerTurn: (isPlayerTurn: boolean) => void
  setPlayerIndex: (i: number) => void
}
