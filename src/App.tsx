// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { PlayerId } from "rune-sdk"
import { useEffect, useState } from "react"
import { ReactFlowProvider } from "@xyflow/react"

import selectSoundAudio from "./assets/select.wav"
import Board from "./components/Board.tsx"
import { GameState } from "./logic.ts"

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const selectSound = new Audio(selectSoundAudio)

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function App(): JSX.Element {
  const [game, setGame] = useState<GameState>()
  const [yourPlayerId, setYourPlayerId] = useState<PlayerId | undefined>()

  useEffect(() => {
    Rune.initClient({
      onChange: ({ game, action, yourPlayerId }) => {
        setGame(game)
        setYourPlayerId(yourPlayerId)

        if (action && action.name === "claimCell") selectSound.play()
      },
    })
  }, [])

  if (!game) {
    // Dusk only shows your game after an onChange() so no need for loading screen
    return <>{yourPlayerId}</>
  }

  return (
    <>
      <ReactFlowProvider>
        <Board />
      </ReactFlowProvider>
    </>
  )
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------
