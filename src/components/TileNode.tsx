// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André "Oats" Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { Handle, NodeProps, Position, useConnection } from "@xyflow/react"
import { useShallow } from "zustand/react/shallow"

import { AppState, TileNodeType } from "../data/types"
import useAppStore from "../data/store"
import { UnitState } from "../logic/logic"

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export type TileNodeProps = NodeProps<TileNodeType>

export default function TileNode({ id, type, data, selected }: TileNodeProps) {
  const connection = useConnection()
  const { playerIndex, isPlayerTurn, focusedNode } = useAppStore(
    useShallow(stateSelector)
  )

  const unit = data.unit
  const hasPlayerUnit = unit != null && unit.owner === playerIndex
  const isEnabled = !focusedNode || focusedNode === id
  const isConnectable =
    isPlayerTurn &&
    hasPlayerUnit &&
    isEnabled &&
    !data.reachable &&
    !data.attackable &&
    !!selected
  const isTarget = connection.inProgress && connection.fromNode.id !== id
  const backgroundColor = getBackgroundColor(
    playerIndex,
    data.unit,
    data.reachable,
    isTarget
  )

  return (
    <div className={`custom-node ${type}`}>
      <div
        className="custom-node-body"
        style={{
          backgroundColor,
          borderStyle: isTarget ? "dashed" : "solid",
        }}
      >
        <Handle
          className="custom-handle"
          position={Position.Right}
          type="source"
          isConnectable={isConnectable}
        />
        <Handle
          className="custom-handle"
          position={Position.Left}
          type="target"
          isConnectableStart={false}
          isConnectableEnd={!!data.reachable || !!data.attackable}
        />
        {data.label}
        {data.unit != null && "*"}
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function stateSelector(state: AppState) {
  return {
    playerIndex: state.playerIndex,
    isPlayerTurn: state.isPlayerTurn,
    focusedNode: state.focusedNode,
  }
}

function getBackgroundColor(
  playerIndex: number,
  unit: UnitState | null,
  reachable: boolean | undefined,
  isTarget: boolean
): string {
  if (unit != null) {
    return playerIndex === unit.owner ? "dodgerblue" : "#ffcce3"
  }
  return isTarget && reachable ? "#ccffe3" : "#ccd9f6"
}

// -----------------------------------------------------------------------------
// Notes
// -----------------------------------------------------------------------------

/*
// If handles are conditionally rendered and not present initially, you need to update
// the node internals https://reactflow.dev/docs/api/hooks/use-update-node-internals/
// In this case we don't need to use useUpdateNodeInternals, since !isConnecting is true
// at the beginning and all handles are rendered initially.
  {!connection.inProgress && (
    <Handle
      className="custom-handle"
      position={Position.Right}
      type="source"
      isConnectable={data.uid != 0}
    />
  )}
// We want to disable the target handle, if the connection was started from this node
  {(!connection.inProgress || isTarget) && (
    <Handle
      className="custom-handle"
      position={Position.Left}
      type="target"
      isConnectableStart={false}
    />
  )}
*/
