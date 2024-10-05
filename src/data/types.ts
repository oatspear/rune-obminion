// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André "Oats" Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { Edge, Node, NodeChange } from "@xyflow/react"

import { BoardState, UnitState } from "../logic/logic"
import { PlayerId } from "rune-sdk"

// -----------------------------------------------------------------------------
// Type Declarations
// -----------------------------------------------------------------------------

export type UnitReach = Array<string[]>

export enum TileType {
  TILE = "tile",
  GOAL = "goal",
  SPAWN = "spawn",
  BENCH = "bench",
}

export type TileNodeData = {
  label: string
  unit: UnitState | null
  reachable?: boolean
  attackable?: boolean
  owner?: number
}

export type TileNodeType = Node<TileNodeData>

export type TileNodeMap = Record<string, TileNodeType>

export type TileNodeMapMutator = (nodes: TileNodeMap) => TileNodeMap

export type SetNodesPayload = TileNodeMap | TileNodeMapMutator

export type EdgeArrayMutator = (edges: Edge[]) => Edge[]

export type SetEdgesPayload = Edge[] | EdgeArrayMutator

export interface AppState {
  playerId: PlayerId | undefined
  playerIndex: number
  isPlayerTurn: boolean
  focusedNode: string
  turnTimer: number
  nodes: TileNodeMap
  edges: Edge[]
  setBoardState: (board: BoardState) => void
  setBenchState: (playerIndex: number, bench: UnitState[]) => void
  onNodesChange: (changes: NodeChange<TileNodeType>[]) => void
  startDragMovement: (source: string) => void
  endDragMovement: () => void
  isValidMovement: (source: string, target: string) => boolean
  setPlayerTurn: (isPlayerTurn: boolean) => boolean
  setPlayerInfo: (id: PlayerId | undefined, index: number) => void
  setFocusedTile: (tile: number) => void
  setTurnTimer: (turnTimer: number) => void
}
