// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André "Oats" Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { useCallback, useEffect, useState } from "react"
import Modal from "react-modal"
import { ReactFlowProvider } from "@xyflow/react"
import { useShallow } from "zustand/react/shallow"

import selectSoundAudio from "./assets/select.wav"
import Board from "./components/Board.tsx"
import useAppStore from "./data/store.ts"
import { AppState } from "./data/types.ts"
import { getPlayerIndex } from "./logic/logic.ts"

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const selectSound = new Audio(selectSoundAudio)

Modal.setAppElement("#root")

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function App(): JSX.Element {
  const [initialized, setInitialized] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const {
    setBoardState,
    setBenchState,
    setPlayerInfo,
    setPlayerTurn,
    setFocusedTile,
  } = useAppStore(useShallow(stateSelector))

  useEffect(() => {
    Rune.initClient({
      onChange: ({ game, action, event, yourPlayerId }) => {
        setInitialized(game != null)
        if (game != null) {
          const playerIndex = getPlayerIndex(game, yourPlayerId || "")
          setPlayerInfo(yourPlayerId, playerIndex)
          setPlayerTurn(game.turnHolder === yourPlayerId)
          setFocusedTile(game.attackingTile)
        }

        if (action != null || event?.name === "stateSync") {
          setBoardState(game.board)
          setBenchState(0, game.benches[0])
          setBenchState(1, game.benches[1])
        }

        if (action && action.name === "moveUnit") {
          selectSound.play()
        }
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onRequestClose = useCallback(() => setModalOpen(false), [])

  if (!initialized) {
    // Rune only shows your game after an onChange() so no need for loading screen
    return <></>
  }

  return (
    <>
      <ReactFlowProvider>
        <Board />
      </ReactFlowProvider>
      <Modal
        isOpen={modalOpen}
        className="modal-content"
        overlayClassName="modal-overlay"
        onRequestClose={onRequestClose}
      >
        <p>This is my modal content</p>
      </Modal>
    </>
  )
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function stateSelector(state: AppState) {
  return {
    setBoardState: state.setBoardState,
    setBenchState: state.setBenchState,
    setPlayerInfo: state.setPlayerInfo,
    setPlayerTurn: state.setPlayerTurn,
    setFocusedTile: state.setFocusedTile,
  }
}
