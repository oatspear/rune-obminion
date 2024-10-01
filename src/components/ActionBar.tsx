// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import React from "react"
import { useDnD } from "./DnDContext"

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function ActionBar() {
  const [, setType] = useDnD()

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string
  ) => {
    setType(nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <aside id="action-bar">
      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, "input")}
        draggable
      >
        Input
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, "default")}
        draggable
      >
        Default
      </div>
      <div
        className="dndnode output"
        onDragStart={(event) => onDragStart(event, "output")}
        draggable
      >
        Output
      </div>
    </aside>
  )
}
