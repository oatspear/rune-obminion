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
} from "./board"
import {
  AppState,
  TileNodeData,
  TileNodeMap,
  TileNodeType,
  UnitReach,
} from "./types"

// -----------------------------------------------------------------------------
// Data Store
// -----------------------------------------------------------------------------

const useAppStore = create<AppState>()((set, get) => ({
  nodes: mapNodes(initialNodes),
  edges: initialEdges,
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
    const nodes = get().nodes
    return !!nodes[target].data.reachable
  },
  onConnect: (connection) => {
    const nodes: TileNodeMap = { ...get().nodes }
    const source = nodes[connection.source]
    const target = nodes[connection.target]
    nodes[source.id] = changeData(source, { uid: 0 })
    nodes[target.id] = changeData(target, { uid: source.data.uid })
    set({ nodes })
  },
  onDropNode: (x: number, y: number) => {
    const nodes: TileNodeMap = { ...get().nodes }
    for (const node of Object.values(nodes)) {
      // const inode = getInternalNode(node.id)!
      const x0 = node.position.x
      const y0 = node.position.y
      const w = node.width || 50
      const h = node.height || 50
      const x2 = x0 + w
      const y2 = y0 + h
      if (x0 > x || x2 < x || y0 > y || y2 < y) {
        continue
      }
      // found node
    }
  },
}))

export default useAppStore

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
      nodes[node.id] = changeData(node, { reachable: false })
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
