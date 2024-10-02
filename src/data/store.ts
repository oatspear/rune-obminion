// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { create } from "zustand"
import { applyNodeChanges, Edge, NodeChange } from "@xyflow/react"

import {
  getPathableReach,
  initialEdges,
  initialNodes,
  isWithinReach,
  mapNodes,
  tileIdToIndex,
} from "./board"
import {
  AppState,
  TileNodeData,
  TileNodeMap,
  TileNodeType,
  UnitReach,
} from "./types"
import { BoardState, UnitState } from "../logic"

// -----------------------------------------------------------------------------
// Data Store
// -----------------------------------------------------------------------------

const useAppStore = create<AppState>()((set, get) => ({
  playerIndex: -1,
  isPlayerTurn: false,
  nodes: mapNodes(initialNodes),
  edges: initialEdges,
  setBoardState: (board: BoardState) => {
    const nodes: TileNodeMap = { ...get().nodes }
    for (const node of Object.values(nodes)) {
      const i = tileIdToIndex(node.id)
      const unit: UnitState | null = board[i]
      if (node.data.unit != unit) {
        nodes[node.id] = changeData(node, { unit })
      }
    }
    set({ nodes })
  },
  onNodesChange: (changes) => {
    const onlySelect = changes.filter(isSelectChange)
    const previous = Object.values(get().nodes)
    set({ nodes: mapNodes(applyNodeChanges(onlySelect, previous)) })
  },
  startDragMovement: (sourceId) => {
    const state = get()
    const reach = getPathableReach(sourceId, state.nodes, state.edges)
    const edges = animateMovementEdges(state.edges, reach)
    const nodes = highlightMovementNodes(state.nodes, reach)
    set({ edges, nodes })
  },
  endDragMovement: () => {
    const state = get()
    const edges = state.edges.map(deanimateEdge)
    const nodes = resetReachableNodes(state.nodes)
    set({ edges, nodes })
  },
  isValidMovement: (source, target) => {
    const state = get()
    if (!state.isPlayerTurn) return false
    const sourceTile = state.nodes[source]
    const unit = sourceTile.data.unit
    if (unit == null || unit.owner != state.playerIndex) return false
    const targetTile = state.nodes[target]
    return !!targetTile.data.reachable
  },
  spawn1p3mUnit: (id: string) => {
    const state = get()
    // is it the player's turn?
    if (!state.isPlayerTurn) return
    // is the spawn tile occupied?
    const node = state.nodes[id]
    if (node.data.unit != null) return
    const unit: UnitState = {
      owner: state.playerIndex,
      movement: 3,
      attackDice: 1,
    }
    const nodes = {
      ...state.nodes,
      [id]: changeData(node, { unit, phantom: true }),
    }
    set({ nodes })
  },
  setPlayerTurn: (isPlayerTurn: boolean) => {
    const state = get()
    if (state.isPlayerTurn === isPlayerTurn) return
    let changed = false
    const nodes = { ...state.nodes }
    for (const node of Object.values(nodes)) {
      if (!node.data.phantom) continue
      changed = true
      nodes[node.id] = changeData(node, { unit: null, phantom: false })
    }
    if (changed) set({ isPlayerTurn, nodes })
    else set({ isPlayerTurn })
  },
  setPlayerIndex: (playerIndex: number) => {
    let nodes = get().nodes
    if (playerIndex === 1 && get().playerIndex !== 1) {
      nodes = invertBoardView(nodes)
    }
    set({ playerIndex, nodes })
  },
}))

export default useAppStore

// onConnect: (connection) => {
//   const nodes: TileNodeMap = { ...get().nodes }
//   const source = nodes[connection.source]
//   const target = nodes[connection.target]
//   nodes[source.id] = changeData(source, { unit: null })
//   nodes[target.id] = changeData(target, { unit: source.data.unit })
//   set({ nodes })
// }

// onDropNode: (x: number, y: number) => {
//   const nodes: TileNodeMap = { ...get().nodes }
//   for (const node of Object.values(nodes)) {
//     // const inode = getInternalNode(node.id)!
//     const x0 = node.position.x
//     const y0 = node.position.y
//     const w = node.width || 50
//     const h = node.height || 50
//     const x2 = x0 + w
//     const y2 = y0 + h
//     if (x0 > x || x2 < x || y0 > y || y2 < y) {
//       continue
//     }
//     // found node
//   }
// }

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

// function indexToID(i: number): string {
//   return `${i + 1}`
// }

function isSelectChange(change: NodeChange<TileNodeType>): boolean {
  return change.type === "select"
}

function changeData(
  node: TileNodeType,
  data: Partial<TileNodeData>
): TileNodeType {
  return { ...node, data: { ...node.data, ...data } }
}

function resetReachableNodes(oldNodes: TileNodeMap): TileNodeMap {
  let changed = false
  const nodes: TileNodeMap = {}
  for (const node of Object.values(oldNodes)) {
    if (node.data.reachable) {
      changed = true
      const newNode = changeData(node, { reachable: false })
      newNode.selected = false
      nodes[node.id] = newNode
    } else if (node.selected) {
      changed = true
      nodes[node.id] = { ...node, selected: false }
    } else {
      nodes[node.id] = node
    }
  }
  return changed ? nodes : oldNodes
}

function highlightMovementNodes(
  oldNodes: TileNodeMap,
  reach: UnitReach
): TileNodeMap {
  const sourceId = reach[0][0]
  const nodes: TileNodeMap = {}
  for (const node of Object.values(oldNodes)) {
    nodes[node.id] = changeData(node, {
      reachable: node.id != sourceId && isWithinReach(node.id, reach),
    })
  }
  return nodes
}

function animateMovementEdge(edge: Edge, reach: UnitReach): Edge {
  for (let i = 0; i < reach.length - 1; ++i) {
    if (reach[i].indexOf(edge.source) >= 0) {
      return { ...edge, animated: true }
    }
    if (reach[i].indexOf(edge.target) >= 0) {
      return {
        ...edge,
        source: edge.target,
        target: edge.source,
        animated: true,
      }
    }
  }
  if (edge.animated) {
    return { ...edge, animated: false }
  }
  return edge
}

function animateMovementEdges(oldEdges: Edge[], reach: UnitReach): Edge[] {
  const edges: Edge[] = []
  for (const edge of oldEdges) {
    edges.push(animateMovementEdge(edge, reach))
  }
  return edges
}

function deanimateEdge(edge: Edge): Edge {
  return edge.animated ? { ...edge, animated: false } : edge
}

function invertBoardView(oldNodes: TileNodeMap): TileNodeMap {
  let ox = 0
  let oy = 0
  // find max
  for (const node of Object.values(oldNodes)) {
    if (node.position.x > ox) {
      ox = node.position.x
    }
    if (node.position.y > oy) {
      oy = node.position.y
    }
  }
  // invert positions
  const nodes: TileNodeMap = {}
  for (const node of Object.values(oldNodes)) {
    const x = Math.abs(node.position.x - ox)
    const y = Math.abs(node.position.y - oy)
    nodes[node.id] = { ...node, position: { x, y } }
  }
  return nodes
}
