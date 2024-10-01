// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import type { PlayerId, RuneClient } from "rune-sdk"

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

// const PLAYER_0_SPAWN_L = 1
// const PLAYER_0_SPAWN_R = 7
const PLAYER_0_BASE = 4
// const PLAYER_1_SPAWN_L = 22
// const PLAYER_1_SPAWN_R = 28
const PLAYER_1_BASE = 25

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export interface UnitState {
  owner: number
  movement: number
  attackDice: number
}

export type TileState = UnitState | null

export type BoardState = TileState[]

export interface GameState {
  board: BoardState
  lastMovePlayerId: PlayerId | null
  playerIds: PlayerId[]
}

type GameActions = {
  claimCell: (cellIndex: number) => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

// -----------------------------------------------------------------------------
// Logic
// -----------------------------------------------------------------------------

function isWinningMove(playerIndex: number, tileIndex: number): boolean {
  return (
    (playerIndex === 0 && tileIndex === PLAYER_1_BASE) ||
    (playerIndex === 1 && tileIndex === PLAYER_0_BASE)
  )
}

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 2,
  setup: (allPlayerIds) => ({
    board: new Array(28).fill(null),
    lastMovePlayerId: null,
    playerIds: allPlayerIds,
  }),
  actions: {
    claimCell: (tileIndex, { game, playerId, allPlayerIds }) => {
      if (
        game.board[tileIndex] !== null ||
        playerId === game.lastMovePlayerId ||
        playerId == null
      ) {
        throw Rune.invalidAction()
      }

      const owner = game.playerIds.indexOf(playerId)
      const movement = 2
      const attackDice = 2
      game.board[tileIndex] = { owner, movement, attackDice }
      game.lastMovePlayerId = playerId

      if (isWinningMove(owner, tileIndex)) {
        const [player1, player2] = allPlayerIds

        Rune.gameOver({
          players: {
            [player1]: playerId === player1 ? "WON" : "LOST",
            [player2]: playerId === player2 ? "WON" : "LOST",
          },
        })
      }
    },
  },
})
