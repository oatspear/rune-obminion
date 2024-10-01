// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { useCallback } from "react"

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export interface ActionBarProps {
  setNodesConnectable: (connectable: boolean) => void
}

export default function ActionBar({
  setNodesConnectable,
}: ActionBarProps): JSX.Element {
  const enableConnect = useCallback(
    () => setNodesConnectable(true),
    [setNodesConnectable]
  )

  const disableConnect = useCallback(
    () => setNodesConnectable(false),
    [setNodesConnectable]
  )

  return (
    <div className="action-bar">
      <button onClick={disableConnect}>Spawn</button>
      <button onClick={enableConnect}>Move</button>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------
