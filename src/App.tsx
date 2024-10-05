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
import fightSoundAudio from "./assets/fight.wav"
import Board from "./components/Board.tsx"
import CombatReportView from "./components/CombatReportView.tsx"
import useAppStore from "./data/store.ts"
import { AppState } from "./data/types.ts"
import { CombatReport, getPlayerIndex } from "./logic/logic.ts"
import PlayerPortrait from "./components/PlayerPortrait.tsx"
import { TURN_TIME } from "./logic/constants.ts"

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const selectSound = new Audio(selectSoundAudio)
const fightSound = new Audio(fightSoundAudio)

Modal.setAppElement("#root")

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function App(): JSX.Element {
  const [initialized, setInitialized] = useState(false)
  const [playerIsAttacker, setPlayerIsAttacker] = useState(false)
  const [combatReport, setCombatReport] = useState<CombatReport | null>(null)
  const [topPlayerId, setTopPlayerId] = useState("")
  const [bottomPlayerId, setBottomPlayerId] = useState("")
  const [turnHolder, setTurnHolder] = useState("")

  const {
    setBoardState,
    setBenchState,
    setPlayerInfo,
    setPlayerTurn,
    setFocusedTile,
    setTurnTimer,
  } = useAppStore(useShallow(stateSelector))

  useEffect(() => {
    Rune.initClient({
      onChange: ({ game, action, event, yourPlayerId }) => {
        setInitialized(game != null)
        if (game != null) {
          const playerIndex = getPlayerIndex(game, yourPlayerId || "")
          setPlayerInfo(yourPlayerId, playerIndex)

          if (playerIndex === 0) {
            setTopPlayerId(game.players[1].id)
            setBottomPlayerId(game.players[0].id)
          } else {
            setTopPlayerId(game.players[0].id)
            setBottomPlayerId(game.players[1].id)
          }
          setTurnHolder(game.turnHolder)

          const isPlayerTurn = game.turnHolder === yourPlayerId
          setPlayerTurn(isPlayerTurn)
          setFocusedTile(game.attackingTile)

          // if (changedTurn && isPlayerTurn) {
          //   setCombatReport(null)
          // }

          const timeSpentMs = Rune.gameTime() - game.turnStartedAt
          const timeLeftMs = Math.max(TURN_TIME - timeSpentMs, 0)
          setTurnTimer((timeLeftMs / 1000) | 0)

          if (action != null || event?.name === "stateSync") {
            setBoardState(game.board)
            setBenchState(0, game.benches[0])
            setBenchState(1, game.benches[1])
          }
        }

        if (action != null && action.name === "attack") {
          for (const player of game.players) {
            if (player.lastCombat != null) {
              setPlayerIsAttacker(player.id === yourPlayerId)
              setCombatReport(player.lastCombat)
              fightSound.play()
            }
          }
        }

        if (action != null && action.name === "moveUnit") {
          selectSound.play()
        }
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onRequestClose = useCallback(() => setCombatReport(null), [])

  if (!initialized) {
    // Rune only shows your game after an onChange() so no need for loading screen
    return <></>
  }

  return (
    <>
      <PlayerPortrait
        playerId={topPlayerId}
        hostile
        active={turnHolder === topPlayerId}
      />

      <ReactFlowProvider>
        <Board />
      </ReactFlowProvider>

      <PlayerPortrait
        playerId={bottomPlayerId}
        hostile={false}
        active={turnHolder === bottomPlayerId}
      />

      <Modal
        isOpen={combatReport != null}
        className="modal-content"
        overlayClassName="modal-overlay"
        onRequestClose={onRequestClose}
      >
        {combatReport && (
          <CombatReportView
            report={combatReport}
            playerIsAttacker={playerIsAttacker}
          />
        )}
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
    setTurnTimer: state.setTurnTimer,
  }
}
