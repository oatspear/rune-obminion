// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André "Oats" Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { PlayerId } from "rune-sdk"
import { applyNodeChanges, Edge, NodeChange } from "@xyflow/react"
import { create } from "zustand"

import { BoardState, UnitState } from "../logic/logic"

import {
  arenaIndexToID,
  benchTiles,
  findAttackableNodes,
  flattenReach,
  getPathableReach,
  idToIndex,
  invertBoardView,
  isBenchEdge,
  isBenchID,
  makeDefaultBoardEdges,
  makeDefaultBoardNodes,
  mapNodes,
} from "./board"
import {
  AppState,
  TileNodeData,
  TileNodeMap,
  TileNodeType,
  TileType,
  UnitReach,
} from "./types"

// -----------------------------------------------------------------------------
// Data Store
// -----------------------------------------------------------------------------

const useAppStore = create<AppState>()((set, get) => ({
  board: [],
  playerId: undefined,
  playerIndex: -1,
  isPlayerTurn: false,
  focusedNode: "",
  nodes: mapNodes(makeDefaultBoardNodes()),
  edges: makeDefaultBoardEdges(),

  setBoardState: (board: BoardState) => {
    const nodes: TileNodeMap = { ...get().nodes }
    for (const node of Object.values(nodes)) {
      if (node.type === TileType.BENCH) continue
      const i = idToIndex(node.id)
      const unit: UnitState | null = board[i]
      if (node.data.unit != unit) {
        nodes[node.id] = changeData(node, { unit })
      }
    }
    set({ nodes })
  },

  setBenchState: (playerIndex: number, bench: UnitState[]) => {
    const nodes: TileNodeMap = { ...get().nodes }
    const benchStack = [...bench].reverse()
    for (const id of benchTiles[playerIndex]) {
      const unit = benchStack.pop() || null
      nodes[id] = changeData(nodes[id], { unit })
    }
    set({ nodes })
  },

  onNodesChange: (changes) => {
    const onlySelect = changes.filter(isSelectChange)
    const previous = Object.values(get().nodes)
    set({ nodes: mapNodes(applyNodeChanges(onlySelect, previous)) })
  },

  startDragMovement: (source: string) => {
    const state = get()
    const reach = getPathableReach(source, state.nodes, state.edges)
    const enemies = findAttackableNodes(source, state.nodes)
    const edges = animateActionEdges(state.edges, reach, source, enemies)
    const nodes = highlightActionNodes(state.nodes, reach, enemies)
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
    return !!targetTile.data.reachable || !!targetTile.data.attackable
  },

  setPlayerTurn: (isPlayerTurn: boolean): boolean => {
    if (isPlayerTurn != get().isPlayerTurn) {
      set({ isPlayerTurn })
      return true
    }
    return false
  },

  setPlayerInfo: (playerId: PlayerId | undefined, playerIndex: number) => {
    const state = get()
    if (playerIndex === 0 && state.playerIndex !== 0) {
      const nodes = invertBoardView(state.nodes)
      set({ playerId, playerIndex, nodes })
    } else {
      set({ playerId, playerIndex })
    }
  },

  setFocusedTile: (tile: number) => {
    const focusedNode = tile < 0 ? "" : arenaIndexToID(tile)
    set({ focusedNode })
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

function highlightActionNodes(
  oldNodes: TileNodeMap,
  reach: UnitReach,
  enemies: string[]
): TileNodeMap {
  const nodes: TileNodeMap = {}
  for (const node of Object.values(oldNodes)) {
    nodes[node.id] = changeData(node, { reachable: false, attackable: false })
  }
  const reachable = flattenReach(reach)
  for (const id of reachable) {
    nodes[id].data.reachable = true
  }
  for (const id of enemies) {
    nodes[id].data.attackable = true
  }
  return nodes
}

function animateMovementEdge(edge: Edge, reach: UnitReach): Edge {
  if (isBenchEdge(edge)) {
    const source = reach[0][0]
    const fromBench = isBenchID(source)
    if (fromBench) {
      if (edge.source === source || edge.target === source) {
        return { ...edge, animated: true, hidden: false }
      }
    }
    if (edge.animated || !edge.hidden) {
      return { ...edge, animated: false, hidden: true }
    }
    return edge
  }

  // arena edges
  for (let i = 0; i < reach.length - 1; ++i) {
    if (reach[i].includes(edge.source)) {
      return { ...edge, style: {}, animated: true, hidden: false }
    }
    if (reach[i].includes(edge.target)) {
      return {
        ...edge,
        style: {},
        source: edge.target,
        target: edge.source,
        animated: true,
        hidden: false,
      }
    }
  }
  if (edge.animated) {
    return { ...edge, animated: false }
  }
  return edge
}

function animateAttackEdge(
  edge: Edge,
  source: string,
  enemies: string[]
): Edge {
  if (isBenchEdge(edge)) {
    return edge
  }

  // arena edges
  if (edge.source === source && enemies.includes(edge.target)) {
    return {
      ...edge,
      style: { stroke: "firebrick", fill: "firebrick" },
      animated: true,
    }
  }
  if (edge.target === source && enemies.includes(edge.source)) {
    return {
      ...edge,
      style: { stroke: "firebrick", fill: "firebrick" },
      source: edge.target,
      target: edge.source,
      animated: true,
    }
  }
  return edge
}

function animateActionEdges(
  oldEdges: Edge[],
  reach: UnitReach,
  source: string,
  enemies: string[]
): Edge[] {
  const edges: Edge[] = []
  for (let edge of oldEdges) {
    edge = animateMovementEdge(edge, reach)
    edge = animateAttackEdge(edge, source, enemies)
    edges.push(edge)
  }
  return edges
}

function deanimateEdge(edge: Edge): Edge {
  const hidden = isBenchEdge(edge)
  return edge.animated ? { ...edge, style: {}, animated: false, hidden } : edge
}
