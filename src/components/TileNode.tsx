// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André "Oats" Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { Handle, NodeProps, Position, useConnection } from "@xyflow/react"
import { useShallow } from "zustand/react/shallow"

import "animate.css"

import { AppState, TileNodeType, TileType } from "../data/types"
import useAppStore from "../data/store"
import { UnitState } from "../logic/logic"
import { useMemo } from "react"

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export type TileNodeProps = NodeProps<TileNodeType>

export default function TileNode({ id, type, data, selected }: TileNodeProps) {
  const connection = useConnection()
  const { playerIndex, isPlayerTurn, focusedNode, attackTargets } = useAppStore(
    useShallow(stateSelector)
  )

  const unit = data.unit
  const hasPlayerUnit = unit != null && unit.owner === playerIndex
  const isEnabled = !focusedNode || focusedNode === id
  const isActionable =
    isPlayerTurn &&
    hasPlayerUnit &&
    isEnabled &&
    !data.reachable &&
    !data.attackable
  const isConnectable = isActionable && !!selected
  const isTarget = connection.inProgress && connection.fromNode.id !== id
  const backgroundColor = getBackgroundColor(
    playerIndex,
    data.unit,
    data.reachable,
    isTarget
  )

  const className = useMemo(() => {
    if (focusedNode && attackTargets.includes(id)) {
      return "custom-node-body animate__animated animate__heartBeat"
    }
    return "custom-node-body"
  }, [attackTargets, focusedNode, id])

  return (
    <div className={`custom-node ${type}`}>
      <div
        className={className}
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
        {type === TileType.GOAL && "🚩"}
        {type === TileType.SPAWN && "➕"}
        {data.unit != null && (data.unit.attackDice == 2 ? "🐺" : data.unit.attackDice == 1 ? "🐈" : "🐻")}
      </div>
      {isActionable && !selected && (
        <span className="hint animate__animated animate__bounce animate__infinite">
          👇
        </span>
      )}
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
    attackTargets: state.attackTargets,
  }
}

function getBackgroundColor(
  playerIndex: number,
  unit: UnitState | null,
  reachable: boolean | undefined,
  isTarget: boolean
): string {
  if (unit != null) {
    return playerIndex === unit.owner ? "cornflowerblue" : "salmon"
  }
  return isTarget && reachable ? "limegreen" : "whitesmoke"
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
