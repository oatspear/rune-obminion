// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import type { PlayerId, RuneClient } from "rune-sdk"

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export const PLAYER_0_SPAWN_L = 21
export const PLAYER_0_SPAWN_R = 27
const PLAYER_0_BASE = 24
export const PLAYER_1_SPAWN_L = 6
export const PLAYER_1_SPAWN_R = 0
const PLAYER_1_BASE = 3

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

export interface MoveUnitActionPayload {
  fromTile: number
  toTile: number
}

export type GameActions = {
  moveUnit: (args: MoveUnitActionPayload) => void
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

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function declareWinner(playerId: PlayerId, allPlayerIds: PlayerId[]): void {
  const [player1, player2] = allPlayerIds
  Rune.gameOver({
    players: {
      [player1]: playerId === player1 ? "WON" : "LOST",
      [player2]: playerId === player2 ? "WON" : "LOST",
    },
  })
}

// -----------------------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------------------

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 2,
  setup: (allPlayerIds) => ({
    board: buildInitialBoard(),
    lastMovePlayerId: allPlayerIds[1],
    playerIds: allPlayerIds,
  }),
  actions: {
    moveUnit: (args, { game, playerId, allPlayerIds }) => {
      if (playerId == null || playerId === game.lastMovePlayerId) {
        throw Rune.invalidAction()
      }

      const fromTile = args.fromTile
      const toTile = args.toTile
      const board = game.board
      const unit = board[fromTile]
      const target = board[toTile]

      if (unit == null || target !== null) {
        throw Rune.invalidAction()
      }

      board[fromTile] = null
      board[toTile] = unit
      game.lastMovePlayerId = playerId

      if (isWinningMove(unit.owner, toTile)) {
        declareWinner(playerId, allPlayerIds)
      }
    },
  },
})

// -----------------------------------------------------------------------------
// Testing
// -----------------------------------------------------------------------------

function buildInitialBoard(): BoardState {
  const board = new Array(28).fill(null)
  const movement = 2
  const attackDice = 2
  board[0] = { owner: 1, movement, attackDice }
  board[21] = { owner: 0, movement, attackDice }
  return board
}
