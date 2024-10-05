// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André "Oats" Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { Edge, XYPosition } from "@xyflow/react"

import {
  ArenaStructure,
  ArenaTileType,
  getAdjacentTiles,
  getArenaStructure,
} from "../logic/board"
import { BENCH_SIZE, PLAYER1, PLAYER2 } from "../logic/constants"

import {
  TileNodeData,
  TileNodeMap,
  TileNodeType,
  TileType,
  UnitReach,
} from "./types"

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const ARENA_ID = "A"
const BENCH_ID = "B"

export const MAX_VIEW_X = 300
export const MAX_VIEW_Y = 300
export const NODE_OFFSET = 100

// -----------------------------------------------------------------------------
// Board Data
// -----------------------------------------------------------------------------

export const arenaStructure: ArenaStructure = getArenaStructure()
export const goalTiles: string[] = [
  findGoalNode(PLAYER1),
  findGoalNode(PLAYER2),
]
export const spawnTiles: string[][] = [
  findSpawnNodes(PLAYER1),
  findSpawnNodes(PLAYER2),
]
export const benchTiles: string[][] = [
  findBenchNodes(PLAYER1),
  findBenchNodes(PLAYER2),
]

export function makeDefaultBoardNodes(): TileNodeType[] {
  // arena tiles are mirrored between players
  return [
    // Arena Nodes
    // Player 1 zone (top) -----------
    makeGoalNode(PLAYER1, 0, 0, -200),
    makeSpawnNode(PLAYER1, 1, -300, -200),
    makeSpawnNode(PLAYER1, 2, 300, -200),
    makeArenaNode(3, -100, -200),
    makeArenaNode(4, -200, -200),
    makeArenaNode(5, 100, -200),
    makeArenaNode(6, 200, -200),
    // West Path (top to bottom) -----
    makeArenaNode(7, -300, -100),
    makeArenaNode(8, -300, 0),
    makeArenaNode(9, -300, 100),
    // Central island (top, west) ----
    makeArenaNode(10, 150, -100),
    makeArenaNode(11, 0, -100),
    makeArenaNode(12, -150, -100),
    makeArenaNode(13, -150, 0),
    // -------------------------------
    makeArenaNode(14, 150, 0),
    makeArenaNode(15, 150, 100),
    makeArenaNode(16, 0, 100),
    makeArenaNode(17, -150, 100),
    // East Path (bottom to top) -----
    makeArenaNode(18, 300, -100),
    makeArenaNode(19, 300, 0),
    makeArenaNode(20, 300, 100),
    // Player 2 zone (bottom) --------
    makeArenaNode(21, -200, 200),
    makeArenaNode(22, -100, 200),
    makeArenaNode(23, 200, 200),
    makeArenaNode(24, 100, 200),
    makeSpawnNode(PLAYER2, 25, -300, 200),
    makeSpawnNode(PLAYER2, 26, 300, 200),
    makeGoalNode(PLAYER2, 27, 0, 200),
    // Bench 1 Nodes
    makeBenchNode(0, 0, 250, -300),
    makeBenchNode(0, 1, 150, -300),
    makeBenchNode(0, 2, 50, -300),
    makeBenchNode(0, 3, -50, -300),
    makeBenchNode(0, 4, -150, -300),
    makeBenchNode(0, 5, -250, -300),
    // Bench 2 Nodes
    makeBenchNode(1, 0, -250, 300),
    makeBenchNode(1, 1, -150, 300),
    makeBenchNode(1, 2, -50, 300),
    makeBenchNode(1, 3, 50, 300),
    makeBenchNode(1, 4, 150, 300),
    makeBenchNode(1, 5, 250, 300),
  ]
}

export function makeDefaultBoardEdges(): Edge[] {
  const edges: Edge[] = []
  for (let s = 0; s < arenaStructure.edges.length; ++s) {
    for (const t of arenaStructure.edges[s]) {
      edges.push({
        id: `${s}-${t}`,
        source: arenaIndexToID(s),
        target: arenaIndexToID(t),
        type: "floating",
        selectable: false,
        focusable: false,
      })
    }
  }
  // add edges for bench nodes
  const nodes = arenaStructure.tiles
  for (let t = nodes.length - 1; t >= 0; --t) {
    let playerIndex = -1
    if (nodes[t] === ArenaTileType.PLAYER1_SPAWN) {
      playerIndex = 0
    } else if (nodes[t] === ArenaTileType.PLAYER2_SPAWN) {
      playerIndex = 1
    } else {
      continue
    }
    for (let b = 0; b < 6; ++b) {
      const source = benchIndexToID(playerIndex, b)
      edges.push({
        id: `${source}-${t}`,
        source,
        target: arenaIndexToID(t),
        type: "floating",
        selectable: false,
        focusable: false,
        hidden: true,
      })
    }
  }
  return edges
}

// -----------------------------------------------------------------------------
// ID Conversion
// -----------------------------------------------------------------------------

export function idToIndex(id: string): number {
  if (id.startsWith(ARENA_ID)) {
    return +id.substring(1)
  }
  if (id.startsWith(BENCH_ID)) {
    return +id.substring(id.indexOf(".") + 1)
  }
  return -1
}

export function arenaIndexToID(i: number): string {
  return `${ARENA_ID}${i}`
}

export function benchIndexToID(playerIndex: number, i: number): string {
  return `${BENCH_ID}${playerIndex}.${i}`
}

// -----------------------------------------------------------------------------
// Viewport Functions
// -----------------------------------------------------------------------------

export function invertBoardView(oldNodes: TileNodeMap): TileNodeMap {
  // invert positions
  const nodes: TileNodeMap = {}
  for (const node of Object.values(oldNodes)) {
    const x = -node.position.x
    const y = -node.position.y
    nodes[node.id] = { ...node, position: { x, y } }
  }
  return nodes
}

export function isBenchID(id: string): boolean {
  return id.startsWith(BENCH_ID)
}

export function isBenchEdge(edge: Edge): boolean {
  return edge.source.startsWith(BENCH_ID) || edge.target.startsWith(BENCH_ID)
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

export function mapNodes(nodes: TileNodeType[]): TileNodeMap {
  const mapping: TileNodeMap = {}
  for (const node of nodes) {
    mapping[node.id] = node
  }
  return mapping
}

export function isWithinReach(target: string, reach: UnitReach): boolean {
  for (const step of reach) {
    if (step.indexOf(target) >= 0) {
      return true
    }
  }
  return false
}

export function getPathableReach(
  source: string,
  nodes: TileNodeMap,
  edges: Edge[]
): UnitReach {
  const movement = nodes[source].data.unit?.movement || 0
  const reach: UnitReach = [[source]]
  const fromBench = nodes[source].type === TileType.BENCH
  for (let i = 1; i <= movement && edges.length > 0; ++i) {
    reach.push([])
    const previous = reach[i - 1]
    const nextEdges: Edge[] = []
    for (const edge of edges) {
      const sourceNode = nodes[edge.source]
      const targetNode = nodes[edge.target]
      if (!fromBench || i > 1) {
        if (sourceNode.type === TileType.BENCH) continue
        if (targetNode.type === TileType.BENCH) continue
      }
      let processLater = true
      if (previous.indexOf(edge.source) >= 0) {
        processLater = false
        const occupant = targetNode.data.unit
        if (!occupant) {
          reach[i].push(edge.target)
        }
      }
      if (previous.indexOf(edge.target) >= 0) {
        processLater = false
        const occupant = sourceNode.data.unit
        if (!occupant) {
          reach[i].push(edge.source)
        }
      }
      if (processLater) {
        nextEdges.push(edge)
      }
    }
    edges = nextEdges
  }
  return reach
}

export function flattenReach(reach: UnitReach): string[] {
  const flattened: string[] = []
  for (const step of reach) {
    for (const id of step) {
      if (!flattened.includes(id)) {
        flattened.push(id)
      }
    }
  }
  return flattened
}

export function findAttackableNodes(
  source: string,
  nodes: TileNodeMap
): string[] {
  const attacker = nodes[source].data.unit
  if (attacker == null || isBenchID(source)) {
    return []
  }
  const adjacency = getAdjacentTiles(idToIndex(source), arenaStructure)
  const targets: string[] = []
  for (const tile of adjacency) {
    const node = nodes[arenaIndexToID(tile)]
    const defender = node.data.unit
    if (defender != null && defender.owner != attacker.owner) {
      targets.push(node.id)
    }
  }
  return targets
}

export function findSpawnNodes(playerIndex: number): string[] {
  if (playerIndex === 0) return findNodes(ArenaTileType.PLAYER1_SPAWN)
  if (playerIndex === 1) return findNodes(ArenaTileType.PLAYER2_SPAWN)
  return []
}

export function findGoalNode(playerIndex: number): string {
  if (playerIndex === 0) return findNodes(ArenaTileType.PLAYER1_GOAL)[0]
  if (playerIndex === 1) return findNodes(ArenaTileType.PLAYER2_GOAL)[0]
  return ""
}

export function findBenchNodes(playerIndex: number): string[] {
  const ids: string[] = []
  for (let b = 0; b < BENCH_SIZE; ++b) {
    ids.push(benchIndexToID(playerIndex, b))
  }
  return ids
}

function findNodes(type: ArenaTileType): string[] {
  const ids: string[] = []
  const nodes = arenaStructure.tiles
  for (let i = nodes.length - 1; i >= 0; --i) {
    if (nodes[i] === type) {
      ids.push(arenaIndexToID(i))
    }
  }
  return ids
}

function makeArenaNode(i: number, x: number, y: number): TileNodeType {
  const id = arenaIndexToID(i)
  return makeTileNode(id, x, y, TileType.TILE)
}

function makeSpawnNode(
  playerIndex: number,
  i: number,
  x: number,
  y: number
): TileNodeType {
  const id = arenaIndexToID(i)
  const node = makeTileNode(id, x, y, TileType.SPAWN)
  node.data.owner = playerIndex
  return node
}

function makeGoalNode(
  playerIndex: number,
  i: number,
  x: number,
  y: number
): TileNodeType {
  const id = arenaIndexToID(i)
  const node = makeTileNode(id, x, y, TileType.GOAL)
  node.data.owner = playerIndex
  return node
}

function makeBenchNode(
  playerIndex: number,
  i: number,
  x: number,
  y: number
): TileNodeType {
  const id = benchIndexToID(playerIndex, i)
  const node = makeTileNode(id, x, y, TileType.BENCH)
  node.data.owner = playerIndex
  return node
}

function makeTileNode(
  id: string,
  x: number,
  y: number,
  type: TileType
): TileNodeType {
  const position: XYPosition = { x, y }
  const data: TileNodeData = { label: id, unit: null }
  return { id, type, position, data }
}
