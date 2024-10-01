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
    data: { label: "1", uid: 1 },
  },
  {
    id: "2",
    type: TileType.TILE,
    position: { x: 100, y: 0 },
    data: { label: "2", uid: 0 },
  },
  {
    id: "3",
    type: TileType.TILE,
    position: { x: 200, y: 0 },
    data: { label: "3", uid: 1 },
  },
  {
    id: "4",
    type: TileType.BASE,
    position: { x: 300, y: 0 },
    data: { label: "4", uid: 0 },
  },
  {
    id: "5",
    type: TileType.TILE,
    position: { x: 400, y: 0 },
    data: { label: "5", uid: 0 },
  },
  {
    id: "6",
    type: TileType.TILE,
    position: { x: 500, y: 0 },
    data: { label: "6", uid: 0 },
  },
  {
    id: "7",
    type: TileType.SPAWN,
    position: { x: 600, y: 0 },
    data: { label: "7", uid: 0 },
  },
  {
    id: "8",
    type: TileType.TILE,
    position: { x: 0, y: 100 },
    data: { label: "8", uid: 0 },
  },
  {
    id: "9",
    type: TileType.TILE,
    position: { x: 0, y: 200 },
    data: { label: "9", uid: 0 },
  },
  {
    id: "10",
    type: TileType.TILE,
    position: { x: 0, y: 300 },
    data: { label: "10", uid: 0 },
  },
  {
    id: "11",
    type: TileType.TILE,
    position: { x: 600, y: 100 },
    data: { label: "11", uid: 0 },
  },
  {
    id: "12",
    type: TileType.TILE,
    position: { x: 600, y: 200 },
    data: { label: "12", uid: 0 },
  },
  {
    id: "13",
    type: TileType.TILE,
    position: { x: 600, y: 300 },
    data: { label: "13", uid: 0 },
  },
  {
    id: "14",
    type: TileType.TILE,
    position: { x: 150, y: 100 },
    data: { label: "14", uid: 0 },
  },
  {
    id: "15",
    type: TileType.TILE,
    position: { x: 300, y: 100 },
    data: { label: "15", uid: 0 },
  },
  {
    id: "16",
    type: TileType.TILE,
    position: { x: 450, y: 100 },
    data: { label: "16", uid: 0 },
  },
  {
    id: "17",
    type: TileType.TILE,
    position: { x: 150, y: 200 },
    data: { label: "17", uid: 0 },
  },
  {
    id: "18",
    type: TileType.TILE,
    position: { x: 450, y: 200 },
    data: { label: "18", uid: 0 },
  },
  {
    id: "19",
    type: TileType.TILE,
    position: { x: 150, y: 300 },
    data: { label: "19", uid: 0 },
  },
  {
    id: "20",
    type: TileType.TILE,
    position: { x: 300, y: 300 },
    data: { label: "20", uid: 0 },
  },
  {
    id: "21",
    type: TileType.TILE,
    position: { x: 450, y: 300 },
    data: { label: "21", uid: 0 },
  },
  {
    id: "22",
    type: TileType.SPAWN,
    position: { x: 0, y: 400 },
    data: { label: "22", uid: 0 },
  },
  {
    id: "23",
    type: TileType.TILE,
    position: { x: 100, y: 400 },
    data: { label: "23", uid: 0 },
  },
  {
    id: "24",
    type: TileType.TILE,
    position: { x: 200, y: 400 },
    data: { label: "24", uid: 0 },
  },
  {
    id: "25",
    type: TileType.BASE,
    position: { x: 300, y: 400 },
    data: { label: "25", uid: 0 },
  },
  {
    id: "26",
    type: TileType.TILE,
    position: { x: 400, y: 400 },
    data: { label: "26", uid: 0 },
  },
  {
    id: "27",
    type: TileType.TILE,
    position: { x: 500, y: 400 },
    data: { label: "27", uid: 0 },
  },
  {
    id: "28",
    type: TileType.SPAWN,
    position: { x: 600, y: 400 },
    data: { label: "28", uid: 0 },
  },
]

export const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", type: "floating" },
  { id: "e2-3", source: "2", target: "3", type: "floating" },
  { id: "e3-4", source: "3", target: "4", type: "floating" },
  { id: "e5-4", source: "5", target: "4", type: "floating" },
  { id: "e6-5", source: "6", target: "5", type: "floating" },
  { id: "e7-6", source: "7", target: "6", type: "floating" },
  { id: "e1-8", source: "1", target: "8", type: "floating" },
  { id: "e8-9", source: "8", target: "9", type: "floating" },
  { id: "e10-9", source: "10", target: "9", type: "floating" },
  { id: "e7-11", source: "7", target: "11", type: "floating" },
  { id: "e11-12", source: "11", target: "12", type: "floating" },
  { id: "e13-12", source: "13", target: "12", type: "floating" },
  { id: "e14-15", source: "14", target: "15", type: "floating" },
  { id: "e16-15", source: "16", target: "15", type: "floating" },
  { id: "e14-17", source: "14", target: "17", type: "floating" },
  { id: "e16-18", source: "16", target: "18", type: "floating" },
  { id: "e19-17", source: "19", target: "17", type: "floating" },
  { id: "e19-20", source: "19", target: "20", type: "floating" },
  { id: "e21-18", source: "21", target: "18", type: "floating" },
  { id: "e21-20", source: "21", target: "20", type: "floating" },
  { id: "e22-23", source: "22", target: "23", type: "floating" },
  { id: "e23-24", source: "23", target: "24", type: "floating" },
  { id: "e24-25", source: "24", target: "25", type: "floating" },
  { id: "e26-25", source: "26", target: "25", type: "floating" },
  { id: "e27-26", source: "27", target: "26", type: "floating" },
  { id: "e28-27", source: "28", target: "27", type: "floating" },
  { id: "e22-10", source: "22", target: "10", type: "floating" },
  { id: "e28-13", source: "28", target: "13", type: "floating" },
  { id: "e1-14", source: "1", target: "14", type: "floating" },
  { id: "e7-16", source: "7", target: "16", type: "floating" },
  { id: "e22-19", source: "22", target: "19", type: "floating" },
  { id: "e28-21", source: "28", target: "21", type: "floating" },
  { id: "e3-15", source: "3", target: "15", type: "floating" },
  { id: "e26-20", source: "26", target: "20", type: "floating" },
]

// -----------------------------------------------------------------------------
// Precalculated Data
// -----------------------------------------------------------------------------

export const precalcUnitReach = calculateReachForAll(initialNodes, initialEdges)

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

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
  nodes: Record<string, TileNodeType>,
  edges: Edge[]
): UnitReach {
  const reach: UnitReach = [[source], [], [], []]
  for (let i = 1; i <= 3 && edges.length > 0; ++i) {
    const previous = reach[i - 1]
    const nextEdges: Edge[] = []
    for (const edge of edges) {
      let processLater = true
      if (previous.indexOf(edge.source) >= 0) {
        processLater = false
        const occupant = nodes[edge.target].data.uid
        if (!occupant) {
          reach[i].push(edge.target)
        }
      }
      if (previous.indexOf(edge.target) >= 0) {
        processLater = false
        const occupant = nodes[edge.source].data.uid
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
      if (flattened.indexOf(id) < 0) {
        flattened.push(id)
      }
    }
  }
  return flattened
}
