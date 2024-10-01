// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { useCallback } from "react"
import {
  Connection,
  ConnectionLineType,
  DefaultEdgeOptions,
  Edge,
  OnConnectStart,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react"
import { useShallow } from "zustand/react/shallow"

import { AppState, TileType } from "../data/types.ts"
import useAppStore from "../data/store.ts"

import { useDnD } from "./DnDContext.tsx"
import FloatingEdge from "./FloatingEdge.tsx"
import TileNode from "./TileNode.tsx"

import "@xyflow/react/dist/style.css"

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const nodeTypes = {
  [TileType.TILE]: TileNode,
  [TileType.BASE]: TileNode,
  [TileType.SPAWN]: TileNode,
}

const edgeTypes = {
  floating: FloatingEdge,
}

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "straight",
  animated: false,
}

const proOptions = { hideAttribution: true }

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function Board(): JSX.Element {
  const {
    nodes,
    edges,
    onNodesChange,
    startDragMovement,
    endDragMovement,
    isValidMovement,
    onConnect,
    onDropNode,
  } = useAppStore(useShallow(stateSelector))
  const [type] = useDnD()
  const { screenToFlowPosition } = useReactFlow()

  const onConnectStart: OnConnectStart = useCallback(
    (_event, params) => {
      if (params.nodeId != null) {
        startDragMovement(params.nodeId)
      }
    },
    [startDragMovement]
  )

  const onConnectEnd = endDragMovement

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      return isValidMovement(connection.source, connection.target)
    },
    [isValidMovement]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      if (!type) {
        return
      }
      const { x, y } = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      onDropNode(x, y)
    },
    [onDropNode, screenToFlowPosition, type]
  )

  return (
    <div id="board">
      <ReactFlow
        nodes={Object.values(nodes)}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.Straight}
        onNodesChange={onNodesChange}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeClickDistance={2}
        connectOnClick={true}
        nodesDraggable={false}
        elementsSelectable={false}
        fitView
        fitViewOptions={{ minZoom: 0.25 }}
        minZoom={0.25}
        translateExtent={[
          [-200, -200],
          [800, 600],
        ]}
        autoPanOnConnect={false}
        proOptions={proOptions}
      ></ReactFlow>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function stateSelector(state: AppState) {
  return {
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    startDragMovement: state.startDragMovement,
    endDragMovement: state.endDragMovement,
    isValidMovement: state.isValidMovement,
    onConnect: state.onConnect,
    onDropNode: state.onDropNode,
  }
}
