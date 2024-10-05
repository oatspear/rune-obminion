// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André "Oats" Santos

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
  useReactFlow,
} from "@xyflow/react"
import { useShallow } from "zustand/react/shallow"

import { idToIndex, isBenchID, MAX_VIEW_X, MAX_VIEW_Y } from "../data/board.ts"
import { AppState, TileType } from "../data/types.ts"
import useAppStore from "../data/store.ts"

import FloatingEdge from "./FloatingEdge.tsx"
import TileNode from "./TileNode.tsx"

import "@xyflow/react/dist/style.css"

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const nodeTypes = {
  [TileType.TILE]: TileNode,
  [TileType.GOAL]: TileNode,
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
    focusedNode,
    isPlayerTurn,
    turnTimer,
    onNodesChange,
    startDragMovement,
    endDragMovement,
    isValidMovement,
  } = useAppStore(useShallow(stateSelector))

  const { fitView } = useReactFlow()

  const onConnectStart: OnConnectStart = useCallback(
    (_event, params) => {
      if (isPlayerTurn && params.nodeId != null) {
        startDragMovement(params.nodeId)
      }
    },
    [isPlayerTurn, startDragMovement]
  )

  const onConnectEnd = endDragMovement

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isPlayerTurn || connection.source === connection.target) {
        return
      }
      if (!!focusedNode && focusedNode != connection.source) {
        return
      }
      const fromTile = idToIndex(connection.source)
      const toTile = idToIndex(connection.target)
      const enemy = nodes[connection.target].data.unit
      if (focusedNode) {
        if (focusedNode === connection.source && enemy != null) {
          Rune.actions.attack({ fromTile, toTile })
        }
      } else {
        if (isBenchID(connection.source)) {
          return Rune.actions.playUnit({ benchIndex: fromTile, toTile })
        }
        if (enemy == null) {
          return Rune.actions.moveUnit({ fromTile, toTile })
        }
      }
    },
    [focusedNode, isPlayerTurn, nodes]
  )

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      return isValidMovement(connection.source, connection.target)
    },
    [isValidMovement]
  )

  const endTurn = useCallback(() => {
    if (isPlayerTurn) {
      Rune.actions.endTurn({})
    }
  }, [isPlayerTurn])

  const viewportTransitionOptions = useMemo(() => ({ duration: 250 }), [])

  const handleFitView = useCallback(() => {
    fitView(viewportTransitionOptions)
  }, [fitView, viewportTransitionOptions])

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
          [-2 * MAX_VIEW_X, -2 * MAX_VIEW_Y],
          [2 * MAX_VIEW_X, 2 * MAX_VIEW_Y],
        ]}
        autoPanOnConnect={false}
        proOptions={proOptions}
      >
        <Panel position="top-left">
          <span className="timer">
            <b>⌛ {turnTimer}</b>
          </span>
        </Panel>
        {/*<Panel position="top-right">{isSpawnSelected && <ActionBar />}</Panel>*/}
        {isPlayerTurn && (
          <Panel position="bottom-left">
            <button onClick={endTurn}>👌 End</button>
          </Panel>
        )}
        <Panel position="bottom-right">
          <button onClick={handleFitView}>🔍</button>
        </Panel>
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
    focusedNode: state.focusedNode,
    playerIndex: state.playerIndex,
    isPlayerTurn: state.isPlayerTurn,
    turnTimer: state.turnTimer,
    onNodesChange: state.onNodesChange,
    startDragMovement: state.startDragMovement,
    endDragMovement: state.endDragMovement,
    isValidMovement: state.isValidMovement,
  }
}
