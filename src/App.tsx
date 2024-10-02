// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { useEffect, useState } from "react"
import { PlayerId } from "rune-sdk"
import { ReactFlowProvider } from "@xyflow/react"
import { useShallow } from "zustand/react/shallow"

import selectSoundAudio from "./assets/select.wav"
import Board from "./components/Board.tsx"
import useAppStore from "./data/store.ts"
import { AppState } from "./data/types.ts"
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

  const { setBoardState, setPlayerIndex, setPlayerTurn } = useAppStore(
    useShallow(stateSelector)
  )

  useEffect(() => {
    Rune.initClient({
      onChange: ({ game, action, event, yourPlayerId }) => {
        setGame(game)
        setYourPlayerId(yourPlayerId)

        setPlayerIndex(game.playerIds.indexOf(yourPlayerId || ""))
        setPlayerTurn(!!yourPlayerId && game.lastMovePlayerId !== yourPlayerId)

        if (action != null || event?.name === "stateSync") {
          setBoardState(game.board)
        }

        if (action && action.name === "moveUnit") {
          selectSound.play()
        }
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!game) {
    // Rune only shows your game after an onChange() so no need for loading screen
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

function stateSelector(state: AppState) {
  return {
    setBoardState: state.setBoardState,
    setPlayerIndex: state.setPlayerIndex,
    setPlayerTurn: state.setPlayerTurn,
  }
}
