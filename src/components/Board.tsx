// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { useCallback, useMemo } from "react"
import {
  Connection,
  ConnectionLineType,
  DefaultEdgeOptions,
  Edge,
  OnConnectStart,
  Panel,
  ReactFlow,
} from "@xyflow/react"
import { useShallow } from "zustand/react/shallow"

import { AppState, TileType } from "../data/types.ts"
import useAppStore from "../data/store.ts"

import ActionBar from "./ActionBar.tsx"
import FloatingEdge from "./FloatingEdge.tsx"
import TileNode from "./TileNode.tsx"

import "@xyflow/react/dist/style.css"
import { tileIdToIndex } from "../data/board.ts"
import {
  PLAYER_0_SPAWN_L,
  PLAYER_0_SPAWN_R,
  PLAYER_1_SPAWN_L,
  PLAYER_1_SPAWN_R,
} from "../logic.ts"

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const nodeTypes = {
  [TileType.TILE]: TileNode,
  [TileType.BASE]: TileNode,
  [TileType.SPAWN]: TileNode,
  [TileType.BENCH]: TileNode,
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
    playerIndex,
    isPlayerTurn,
    onNodesChange,
    startDragMovement,
    endDragMovement,
    isValidMovement,
  } = useAppStore(useShallow(stateSelector))

  const isSpawnSelected = useMemo(() => {
    for (const node of Object.values(nodes)) {
      if (!node.selected) continue
      if (node.type !== TileType.SPAWN) continue
      const i = tileIdToIndex(node.id)
      if (playerIndex === 0) {
        if (i === PLAYER_0_SPAWN_L || i === PLAYER_0_SPAWN_R) return true
      } else {
        if (i === PLAYER_1_SPAWN_L || i === PLAYER_1_SPAWN_R) return true
      }
    }
    return false
  }, [nodes, playerIndex])

  const onConnectStart: OnConnectStart = useCallback(
    (_event, params) => {
      if (isPlayerTurn && params.nodeId != null) {
        startDragMovement(params.nodeId)
      }
    },
    [isPlayerTurn, startDragMovement]
  )

  const onConnectEnd = endDragMovement

  const onConnect = useCallback((connection: Connection) => {
    const fromTile = tileIdToIndex(connection.source)
    const toTile = tileIdToIndex(connection.target)
    Rune.actions.moveUnit({ fromTile, toTile })
  }, [])

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      return isValidMovement(connection.source, connection.target)
    },
    [isValidMovement]
  )

  /*const onDragOver = useCallback((event: React.DragEvent) => {
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
  )*/

  return (
    <div id="board" className={isPlayerTurn ? "active" : ""}>
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
        deleteKeyCode={null}
        nodeClickDistance={2}
        connectOnClick={true}
        nodesDraggable={false}
        elementsSelectable={true}
        edgesReconnectable={false}
        nodesConnectable={isPlayerTurn}
        fitView
        fitViewOptions={{ minZoom: 0.25 }}
        minZoom={0.25}
        translateExtent={[
          [-200, -200],
          [800, 600],
        ]}
        autoPanOnConnect={false}
        proOptions={proOptions}
      >
        <Panel position="bottom-left">{isSpawnSelected && <ActionBar />}</Panel>
      </ReactFlow>
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
    playerIndex: state.playerIndex,
    isPlayerTurn: state.isPlayerTurn,
    onNodesChange: state.onNodesChange,
    startDragMovement: state.startDragMovement,
    endDragMovement: state.endDragMovement,
    isValidMovement: state.isValidMovement,
  }
}
