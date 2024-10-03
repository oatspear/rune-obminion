// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André "Oats" Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import type { PlayerId, RuneClient } from "rune-sdk"
import {
  findSpawnTiles,
  getAdjacentTiles,
  getArenaStructure,
  isTileReachable,
} from "./board"

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const PLAYER_1_GOAL = 0
const PLAYER_2_GOAL = 27

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

export interface CombatEvent {
  attackerDice: number[]
  defenderDice: number[]
  fromTile: number
  toTile: number
  attacker: PlayerId
  result: number
}

export interface GameState {
  board: BoardState
  benches: [UnitState[], UnitState[]]
  lastMovePlayerId: PlayerId
  lastCombat: CombatEvent | null
  playerIds: PlayerId[]
}

export interface MoveUnitActionPayload {
  fromTile: number
  toTile: number
}

export interface PlayUnitActionPayload {
  benchIndex: number
  toTile: number
}

export interface AttackActionPayload {
  fromTile: number
  toTile: number
}

export type EndTurnActionPayload = Record<string, never>

export type GameActions = {
  moveUnit: (args: MoveUnitActionPayload) => void
  playUnit: (args: PlayUnitActionPayload) => void
  attack: (args: AttackActionPayload) => void
  endTurn: (args: EndTurnActionPayload) => void
}

interface Persisted {
  sessionCount: number
}

declare global {
  const Rune: RuneClient<GameState, GameActions, Persisted>
}

// some types adapted directly from Rune
type PersistedPlayers<PersistedData> = Record<PlayerId, PersistedData>
type GameStateWithPersisted<PersistedData> = GameState & {
  persisted: PersistedPlayers<PersistedData>
}
interface ActionContext<PersistedData> {
  playerId: PlayerId
  allPlayerIds: PlayerId[]
  game: PersistedData extends false
    ? GameState
    : GameStateWithPersisted<PersistedData>
}

type MoveUnitActionType = (
  params: MoveUnitActionPayload,
  context: ActionContext<false>
) => void

type PlayUnitActionType = (
  params: PlayUnitActionPayload,
  context: ActionContext<false>
) => void

type AttackActionType = (
  params: AttackActionPayload,
  context: ActionContext<false>
) => void

type EndTurnActionType = (
  params: EndTurnActionPayload,
  context: ActionContext<false>
) => void

interface ActionHandlers {
  moveUnit: MoveUnitActionType
  playUnit: PlayUnitActionType
  attack: AttackActionType
  endTurn: EndTurnActionType
}

// -----------------------------------------------------------------------------
// Logic
// -----------------------------------------------------------------------------

function getMovableUnit(board: BoardState, tile: number): UnitState {
  const unit = board[tile]
  if (unit == null) throw Rune.invalidAction()
  if (unit.movement < 1) throw Rune.invalidAction()
  return unit
}

function spawnUnit(board: BoardState, unit: UnitState, tile: number): void {
  const occupant = board[tile]
  if (occupant != null) throw Rune.invalidAction()
  board[tile] = unit
}

function findAttackTargets(
  board: BoardState,
  tiles: number[],
  playerIndex: number
): number[] {
  const targets: number[] = []
  for (const tile of tiles) {
    const unit = board[tile]
    if (unit != null && unit.owner != playerIndex) {
      targets.push(tile)
    }
  }
  return targets
}

function isWinningMove(playerIndex: number, tileIndex: number): boolean {
  return (
    (playerIndex === 0 && tileIndex === PLAYER_2_GOAL) ||
    (playerIndex === 1 && tileIndex === PLAYER_1_GOAL)
  )
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function getPlayerIndex(playerId: PlayerId, allPlayerIds: PlayerId[]): number {
  const playerIndex = allPlayerIds.indexOf(playerId)
  if (playerIndex < 0) throw Rune.invalidAction()
  return playerIndex
}

function isTileOccupied(tile: TileState): boolean {
  return tile != null
}

function getOccupancyList(board: BoardState): boolean[] {
  return board.map(isTileOccupied)
}

function checkIsPlayersTurn(playerId: PlayerId, lastMovePlayerId: PlayerId) {
  if (playerId == null || playerId === lastMovePlayerId) {
    throw Rune.invalidAction()
  }
}

function declareWinner(playerId: PlayerId, allPlayerIds: PlayerId[]): void {
  const [player1, player2] = allPlayerIds
  Rune.gameOver({
    players: {
      [player1]: playerId === player1 ? "WON" : "LOST",
      [player2]: playerId === player2 ? "WON" : "LOST",
    },
  })
}

function rollDie(): number {
  return ((Math.random() * 6) | 0) + 1
}

// -----------------------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------------------

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 2,
  persistPlayerData: true,

  setup: (allPlayerIds, { game }) => {
    for (const playerId of allPlayerIds) {
      game.persisted[playerId].sessionCount =
        (game.persisted[playerId].sessionCount || 0) + 1
    }
    return {
      board: buildInitialBoard(),
      benches: [buildDefaultBench(0), buildDefaultBench(1)],
      lastMovePlayerId: allPlayerIds[1],
      lastCombat: null,
      playerIds: allPlayerIds,
    }
  },

  actions: buildActionHandlers(),

  events: {
    playerJoined: (playerId, { game }) => {
      game.persisted[playerId].sessionCount =
        (game.persisted[playerId].sessionCount || 0) + 1
    },
    playerLeft: (playerId, { game }) => {
      const playerIds = game.playerIds
      playerIds.splice(playerIds.indexOf(playerId), 1)
      if (playerIds.length < 2) {
        declareWinner(playerIds[0], playerIds)
      }
    },
  },
})

function buildActionHandlers(): ActionHandlers {
  // variables for closures
  const struct = getArenaStructure()

  return {
    moveUnit: (args, { game, playerId, allPlayerIds }) => {
      checkIsPlayersTurn(playerId, game.lastMovePlayerId)

      const board = game.board
      const fromTile = args.fromTile
      const toTile = args.toTile
      const unit = getMovableUnit(board, fromTile)

      const playerIndex = getPlayerIndex(playerId, allPlayerIds)
      if (unit.owner != playerIndex) throw Rune.invalidAction()
      if (board[toTile] !== null) throw Rune.invalidAction()

      const reachable = isTileReachable(
        toTile,
        fromTile,
        unit.movement,
        getOccupancyList(board),
        struct
      )
      if (!reachable) throw Rune.invalidAction()

      board[fromTile] = null
      board[toTile] = unit
      game.lastCombat = null

      if (isWinningMove(unit.owner, toTile)) {
        return declareWinner(playerId, allPlayerIds)
      }

      const adjacency = getAdjacentTiles(toTile, struct)
      const attackable = findAttackTargets(board, adjacency, playerIndex)
      if (attackable.length === 0) {
        game.lastMovePlayerId = playerId
      }
    },

    playUnit: (args, { game, playerId, allPlayerIds }) => {
      checkIsPlayersTurn(playerId, game.lastMovePlayerId)

      const playerIndex = getPlayerIndex(playerId, allPlayerIds)
      const bench = game.benches[playerIndex]
      const benchIndex = args.benchIndex
      if (benchIndex < 0) throw Rune.invalidAction()
      if (bench.length < benchIndex) throw Rune.invalidAction()

      const board = game.board
      const toTile = args.toTile

      const unit = bench.splice(benchIndex, 1)[0]
      const spawns = findSpawnTiles(playerIndex, struct)
      if (unit.movement === 1) {
        if (spawns.indexOf(toTile) < 0) throw Rune.invalidAction()
      } else {
        if (board[toTile] !== null) throw Rune.invalidAction()
        // check whether the tile is reachable from any spawn point
        const movement = unit.movement - 1
        const occupancy = getOccupancyList(board)
        let reachable = false
        for (const tile of spawns) {
          // skip occupied spawns
          if (occupancy[tile]) continue
          reachable = isTileReachable(toTile, tile, movement, occupancy, struct)
          if (reachable) break
        }
        if (!reachable) throw Rune.invalidAction()
      }
      spawnUnit(board, unit, toTile)
      game.lastCombat = null

      if (isWinningMove(unit.owner, toTile)) {
        return declareWinner(playerId, allPlayerIds)
      }

      const adjacency = getAdjacentTiles(toTile, struct)
      const attackable = findAttackTargets(board, adjacency, playerIndex)
      if (attackable.length === 0) {
        game.lastMovePlayerId = playerId
      }
    },

    attack: (args, { game, playerId, allPlayerIds }) => {
      checkIsPlayersTurn(playerId, game.lastMovePlayerId)

      const board = game.board
      const fromTile = args.fromTile
      const toTile = args.toTile
      if (getAdjacentTiles(fromTile, struct).indexOf(toTile) < 0) {
        throw Rune.invalidAction()
      }

      const unit = getMovableUnit(board, fromTile)
      const playerIndex = getPlayerIndex(playerId, allPlayerIds)
      if (unit.owner != playerIndex) throw Rune.invalidAction()
      const opponentIndex = (playerIndex + 1) % 2
      const opponent = board[toTile]
      if (opponent == null) throw Rune.invalidAction()

      const event: CombatEvent = {
        attackerDice: [],
        defenderDice: [],
        fromTile,
        toTile,
        attacker: playerId,
        result: 0,
      }
      let a = 0
      for (let d = 0; d < unit.attackDice; ++d) {
        const r = rollDie()
        event.attackerDice.push(r)
        a += r
      }
      let b = 0
      for (let d = 0; d < opponent.attackDice; ++d) {
        const r = rollDie()
        event.defenderDice.push(r)
        b += r
      }
      event.result = a - b // positive means victory

      if (a >= b) {
        board[toTile] = null
        game.benches[opponentIndex].push(opponent)
      }
      if (a <= b) {
        board[fromTile] = null
        game.benches[playerIndex].push(unit)
      }

      game.lastCombat = event
      game.lastMovePlayerId = playerId
    },

    endTurn: (_args, { game, playerId }) => {
      checkIsPlayersTurn(playerId, game.lastMovePlayerId)
      game.lastCombat = null
      game.lastMovePlayerId = playerId
    },
  }
}

// -----------------------------------------------------------------------------
// Testing
// -----------------------------------------------------------------------------

function buildInitialBoard(): BoardState {
  const board = new Array(28).fill(null)
  return board
}

function buildDefaultBench(owner: number): UnitState[] {
  return [
    { owner, movement: 1, attackDice: 3 },
    { owner, movement: 2, attackDice: 2 },
    { owner, movement: 3, attackDice: 1 },
  ]
}
