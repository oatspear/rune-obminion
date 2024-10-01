// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { Edge, Node, NodeChange, OnConnect } from "@xyflow/react"

// -----------------------------------------------------------------------------
// Type Declarations
// -----------------------------------------------------------------------------

export type UnitReach = [string[], string[], string[], string[]]

export enum TileType {
  TILE = "tile",
  BASE = "base",
  SPAWN = "spawn",
}

export type TileNodeData = {
  label: string
  uid: number
  reachable?: boolean
}

export type TileNodeType = Node<TileNodeData>

export type TileNodeMap = Record<string, TileNodeType>

export type TileNodeMapMutator = (nodes: TileNodeMap) => TileNodeMap

export type SetNodesPayload = TileNodeMap | TileNodeMapMutator

export type EdgeArrayMutator = (edges: Edge[]) => Edge[]

export type SetEdgesPayload = Edge[] | EdgeArrayMutator

export interface AppState {
  nodes: TileNodeMap
  edges: Edge[]
  onNodesChange: (changes: NodeChange<TileNodeType>[]) => void
  startDragMovement: (sourceId: string) => void
  endDragMovement: () => void
  isValidMovement: (source: string, target: string) => boolean
  onConnect: OnConnect
  onDropNode: (x: number, y: number) => void
}
