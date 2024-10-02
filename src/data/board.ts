// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { Edge, Node } from "@xyflow/react"

import { TileNodeMap, TileNodeType, TileType, UnitReach } from "./types"

// -----------------------------------------------------------------------------
// Board
// -----------------------------------------------------------------------------

export const initialNodes: TileNodeType[] = [
  {
    id: "1",
    type: TileType.SPAWN,
    position: { x: 0, y: 0 },
    data: { label: "1", unit: null },
  },
  {
    id: "2",
    type: TileType.TILE,
    position: { x: 100, y: 0 },
    data: { label: "2", unit: null },
  },
  {
    id: "3",
    type: TileType.TILE,
    position: { x: 200, y: 0 },
    data: { label: "3", unit: null },
  },
  {
    id: "4",
    type: TileType.BASE,
    position: { x: 300, y: 0 },
    data: { label: "4", unit: null },
  },
  {
    id: "5",
    type: TileType.TILE,
    position: { x: 400, y: 0 },
    data: { label: "5", unit: null },
  },
  {
    id: "6",
    type: TileType.TILE,
    position: { x: 500, y: 0 },
    data: { label: "6", unit: null },
  },
  {
    id: "7",
    type: TileType.SPAWN,
    position: { x: 600, y: 0 },
    data: { label: "7", unit: null },
  },
  {
    id: "8",
    type: TileType.TILE,
    position: { x: 0, y: 100 },
    data: { label: "8", unit: null },
  },
  {
    id: "9",
    type: TileType.TILE,
    position: { x: 0, y: 200 },
    data: { label: "9", unit: null },
  },
  {
    id: "10",
    type: TileType.TILE,
    position: { x: 0, y: 300 },
    data: { label: "10", unit: null },
  },
  {
    id: "11",
    type: TileType.TILE,
    position: { x: 600, y: 100 },
    data: { label: "11", unit: null },
  },
  {
    id: "12",
    type: TileType.TILE,
    position: { x: 600, y: 200 },
    data: { label: "12", unit: null },
  },
  {
    id: "13",
    type: TileType.TILE,
    position: { x: 600, y: 300 },
    data: { label: "13", unit: null },
  },
  {
    id: "14",
    type: TileType.TILE,
    position: { x: 150, y: 100 },
    data: { label: "14", unit: null },
  },
  {
    id: "15",
    type: TileType.TILE,
    position: { x: 300, y: 100 },
    data: { label: "15", unit: null },
  },
  {
    id: "16",
    type: TileType.TILE,
    position: { x: 450, y: 100 },
    data: { label: "16", unit: null },
  },
  {
    id: "17",
    type: TileType.TILE,
    position: { x: 150, y: 200 },
    data: { label: "17", unit: null },
  },
  {
    id: "18",
    type: TileType.TILE,
    position: { x: 450, y: 200 },
    data: { label: "18", unit: null },
  },
  {
    id: "19",
    type: TileType.TILE,
    position: { x: 150, y: 300 },
    data: { label: "19", unit: null },
  },
  {
    id: "20",
    type: TileType.TILE,
    position: { x: 300, y: 300 },
    data: { label: "20", unit: null },
  },
  {
    id: "21",
    type: TileType.TILE,
    position: { x: 450, y: 300 },
    data: { label: "21", unit: null },
  },
  {
    id: "22",
    type: TileType.SPAWN,
    position: { x: 0, y: 400 },
    data: { label: "22", unit: null },
  },
  {
    id: "23",
    type: TileType.TILE,
    position: { x: 100, y: 400 },
    data: { label: "23", unit: null },
  },
  {
    id: "24",
    type: TileType.TILE,
    position: { x: 200, y: 400 },
    data: { label: "24", unit: null },
  },
  {
    id: "25",
    type: TileType.BASE,
    position: { x: 300, y: 400 },
    data: { label: "25", unit: null },
  },
  {
    id: "26",
    type: TileType.TILE,
    position: { x: 400, y: 400 },
    data: { label: "26", unit: null },
  },
  {
    id: "27",
    type: TileType.TILE,
    position: { x: 500, y: 400 },
    data: { label: "27", unit: null },
  },
  {
    id: "28",
    type: TileType.SPAWN,
    position: { x: 600, y: 400 },
    data: { label: "28", unit: null },
  },
  // Extra Tiles for the Bench -----------------------------
  {
    id: "B0.1",
    type: TileType.BENCH,
    position: { x: 50, y: -150 },
    data: { label: "B0.1", unit: null },
  },
  {
    id: "B0.2",
    type: TileType.BENCH,
    position: { x: 150, y: -150 },
    data: { label: "B0.2", unit: null },
  },
  {
    id: "B0.3",
    type: TileType.BENCH,
    position: { x: 250, y: -150 },
    data: { label: "B0.3", unit: null },
  },
  {
    id: "B0.4",
    type: TileType.BENCH,
    position: { x: 350, y: -150 },
    data: { label: "B0.4", unit: null },
  },
  {
    id: "B0.5",
    type: TileType.BENCH,
    position: { x: 450, y: -150 },
    data: { label: "B0.5", unit: null },
  },
  {
    id: "B0.6",
    type: TileType.BENCH,
    position: { x: 550, y: -150 },
    data: { label: "B0.6", unit: null },
  },
  {
    id: "B1.1",
    type: TileType.BENCH,
    position: { x: 50, y: 550 },
    data: { label: "B1.1", unit: null },
  },
  {
    id: "B1.2",
    type: TileType.BENCH,
    position: { x: 150, y: 550 },
    data: { label: "B1.2", unit: null },
  },
  {
    id: "B1.3",
    type: TileType.BENCH,
    position: { x: 250, y: 550 },
    data: { label: "B1.3", unit: null },
  },
  {
    id: "B1.4",
    type: TileType.BENCH,
    position: { x: 350, y: 550 },
    data: { label: "B1.4", unit: null },
  },
  {
    id: "B1.5",
    type: TileType.BENCH,
    position: { x: 450, y: 550 },
    data: { label: "B1.5", unit: null },
  },
  {
    id: "B1.6",
    type: TileType.BENCH,
    position: { x: 550, y: 550 },
    data: { label: "B1.6", unit: null },
  },
]

export const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e5-4",
    source: "5",
    target: "4",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e6-5",
    source: "6",
    target: "5",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e7-6",
    source: "7",
    target: "6",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e1-8",
    source: "1",
    target: "8",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e8-9",
    source: "8",
    target: "9",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e10-9",
    source: "10",
    target: "9",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e7-11",
    source: "7",
    target: "11",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e11-12",
    source: "11",
    target: "12",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e13-12",
    source: "13",
    target: "12",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e14-15",
    source: "14",
    target: "15",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e16-15",
    source: "16",
    target: "15",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e14-17",
    source: "14",
    target: "17",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e16-18",
    source: "16",
    target: "18",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e19-17",
    source: "19",
    target: "17",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e19-20",
    source: "19",
    target: "20",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e21-18",
    source: "21",
    target: "18",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e21-20",
    source: "21",
    target: "20",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e22-23",
    source: "22",
    target: "23",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e23-24",
    source: "23",
    target: "24",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e24-25",
    source: "24",
    target: "25",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e26-25",
    source: "26",
    target: "25",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e27-26",
    source: "27",
    target: "26",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e28-27",
    source: "28",
    target: "27",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e22-10",
    source: "22",
    target: "10",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e28-13",
    source: "28",
    target: "13",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e1-14",
    source: "1",
    target: "14",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e7-16",
    source: "7",
    target: "16",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e22-19",
    source: "22",
    target: "19",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e28-21",
    source: "28",
    target: "21",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e3-15",
    source: "3",
    target: "15",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  {
    id: "e26-20",
    source: "26",
    target: "20",
    type: "floating",
    selectable: false,
    focusable: false,
  },
  // Extra Edges
  {
    id: "eb01-1",
    source: "B0-1",
    target: "1",
    type: "floating",
    selectable: false,
    focusable: false,
    hidden: true,
  },
  {
    id: "eb02-1",
    source: "B0-2",
    target: "1",
    type: "floating",
    selectable: false,
    focusable: false,
    hidden: true,
  },
]

addBenchEdges(initialEdges)

// -----------------------------------------------------------------------------
// Precalculated Data
// -----------------------------------------------------------------------------

export const precalcUnitReach = calculateReachForAll(initialNodes, initialEdges)

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

export function tileIdToIndex(id: string): number {
  return +id - 1
}

export function mapNodes(nodes: TileNodeType[]): TileNodeMap {
  const mapping: Record<string, TileNodeType> = {}
  for (const node of nodes) {
    mapping[node.id] = node
  }
  return mapping
}

export function isWithinDefaultReach(source: string, target: string): boolean {
  const reach = precalcUnitReach[source]
  if (reach == null) {
    return false
  }
  return isWithinReach(target, reach)
}

export function isWithinReach(target: string, reach: UnitReach): boolean {
  for (const step of reach) {
    if (step.indexOf(target) >= 0) {
      return true
    }
  }
  return false
}

function calculateReachForAll(
  nodes: Node[],
  edges: Edge[]
): Record<string, UnitReach> {
  const reach: Record<string, UnitReach> = {}
  for (const node of nodes) {
    reach[node.id] = getReach(node.id, edges)
  }
  return reach
}

function getReach(node: string, edges: Edge[]): UnitReach {
  const reach: UnitReach = [[node], [], [], []]
  for (let i = 1; i <= 3 && edges.length > 0; ++i) {
    const previous = reach[i - 1]
    const nextEdges: Edge[] = []
    for (const edge of edges) {
      const n = reach[i].length
      if (previous.indexOf(edge.source) >= 0) {
        reach[i].push(edge.target)
      }
      if (previous.indexOf(edge.target) >= 0) {
        reach[i].push(edge.source)
      }
      if (reach[i].length === n) {
        nextEdges.push(edge)
      }
    }
    edges = nextEdges
  }
  return reach
}

export function getPathableReach(
  source: string,
  nodes: TileNodeMap,
  edges: Edge[]
): UnitReach {
  const movement = nodes[source].data.unit?.movement || 0
  const reach: UnitReach = [[source]]
  for (let i = 1; i <= movement && edges.length > 0; ++i) {
    reach.push([])
    const previous = reach[i - 1]
    const nextEdges: Edge[] = []
    for (const edge of edges) {
      const sourceNode = nodes[edge.source]
      if (sourceNode.type === TileType.BENCH) continue
      const targetNode = nodes[edge.target]
      if (targetNode.type === TileType.BENCH) continue
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

// export function flattenReach(reach: UnitReach): string[] {
//   const flattened: string[] = []
//   for (const step of reach) {
//     for (const id of step) {
//       if (flattened.indexOf(id) < 0) {
//         flattened.push(id)
//       }
//     }
//   }
//   return flattened
// }

export function getPlayerSpawns(playerIndex: number): string[] {
  if (playerIndex === 0) return ["1", "7"]
  if (playerIndex === 1) return ["22", "28"]
  return []
}

export function getPlayerBench(playerIndex: number): string[] {
  if (playerIndex === 0) return ["B1", "B2", "B3", "B4", "B5", "B6"]
  if (playerIndex === 1) return ["B7", "B8", "B9", "B10", "B11", "B12"]
  return []
}

export function connectBenchToSpawn(
  nodes: TileNodeMap,
  playerIndex: number
): Edge[] {
  const spawns = getPlayerSpawns(playerIndex).map((id) => nodes[id])
  const bench = getPlayerBench(playerIndex).map((id) => nodes[id])
  const edges: Edge[] = []
  for (const node of bench) {
    if (node.data.unit == null) continue
    for (const spawn of spawns) {
      if (spawn.data.unit != null) continue
      edges.push({
        id: `s${node.id}-${spawn.id}`,
        source: node.id,
        target: spawn.id,
        type: "floating",
        selectable: false,
        focusable: false,
        hidden: true,
      })
    }
  }
  return edges
}

function addBenchEdges(edges: Edge[]): void {
  for (let i = 0; i < 2; ++i) {
    const spawns = getPlayerSpawns(i)
    for (let b = 0; b < 6; ++b) {
      for (const target of spawns) {
        const source = `B${i}.${b}`
        edges.push({
          id: `e${source}-${target}`,
          source,
          target,
          type: "floating",
          selectable: false,
          focusable: false,
          hidden: true,
        })
      }
    }
  }
}
