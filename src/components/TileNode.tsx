// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import {
  ConnectionState,
  Handle,
  NodeProps,
  Position,
  useConnection,
} from "@xyflow/react"

import { TileNodeData, TileNodeType } from "../data/types"

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export type TileNodeProps = NodeProps<TileNodeType>

export default function TileNode({ id, type, data }: TileNodeProps) {
  const connection = useConnection()

  const isTarget = connection.inProgress && connection.fromNode.id !== id

  return (
    <div className={`custom-node ${type}`}>
      <div
        className="custom-node-body"
        style={{
          borderStyle: isTarget ? "dashed" : "solid",
          backgroundColor: getBackgroundColor(id, data, connection),
        }}
      >
        <Handle
          className="custom-handle"
          position={Position.Right}
          type="source"
          isConnectable={data.uid != 0 && !data.reachable}
        />
        <Handle
          className="custom-handle"
          position={Position.Left}
          type="target"
          isConnectableStart={false}
          isConnectableEnd={!!data.reachable}
        />
        {data.label}
        {data.uid != 0 && "*"}
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function getBackgroundColor(
  id: string,
  data: TileNodeData,
  connection: ConnectionState
): string {
  if (data.uid != 0) {
    return "#ffcce3"
  }
  const isTarget = connection.inProgress && connection.fromNode.id !== id
  return isTarget && data.reachable ? "#ccffe3" : "#ccd9f6"
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
