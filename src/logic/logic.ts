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
import { TURN_TIME } from "./constants"

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const PLAYER_1_GOAL = 0
const PLAYER_2_GOAL = 27
const NOT_ATTACKING = -1

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

export interface CombatReport {
  attackerDice: number[]
  defenderDice: number[]
  result: number
}

export interface PlayerState {
  id: PlayerId
  ready: boolean
  lastCombat: CombatReport | null
}

export interface GameState {
  board: BoardState
  benches: [UnitState[], UnitState[]]
  turnHolder: PlayerId
  players: PlayerState[]
  turnStartedAt: number
  attackingTile: number
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

function swapTurn(game: GameState, time: number = -1): void {
  const playerIndex = getTurnHolderIndex(game)
  const nextIndex = (playerIndex + 1) % game.players.length
  const nextPlayer = game.players[nextIndex]
  // nextPlayer.ready = false
  nextPlayer.lastCombat = null
  game.turnHolder = nextPlayer.id
  game.turnStartedAt = time < 0 ? Rune.gameTime() : time
  game.attackingTile = NOT_ATTACKING
}

export function getPlayerIndex(game: GameState, playerId: PlayerId): number {
  const players = game.players
  for (let i = players.length - 1; i >= 0; --i) {
    if (players[i].id === playerId) {
      return i
    }
  }
  return -1
}

function getTurnHolderIndex(game: GameState): number {
  return getPlayerIndex(game, game.turnHolder)
}

function spawnUnit(board: BoardState, unit: UnitState, tile: number): void {
  const occupant = board[tile]
  if (occupant != null) {
    throw Rune.invalidAction()
  }
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
  console.log("findAttackTargets", tiles, targets)
  return targets
}

function isWinningMove(playerIndex: number, tileIndex: number): boolean {
  return (
    (playerIndex === 0 && tileIndex === PLAYER_2_GOAL) ||
    (playerIndex === 1 && tileIndex === PLAYER_1_GOAL)
  )
}

function executeCombat(attacker: UnitState, defender: UnitState): CombatReport {
  const event: CombatReport = { attackerDice: [], defenderDice: [], result: 0 }
  let a = 0
  for (let d = 0; d < attacker.attackDice; ++d) {
    const r = rollDie()
    event.attackerDice.push(r)
    a += r
  }
  let b = 0
  for (let d = 0; d < defender.attackDice; ++d) {
    const r = rollDie()
    event.defenderDice.push(r)
    b += r
  }
  event.result = a - b // positive means victory
  return event
}

// -----------------------------------------------------------------------------
// Action Validation
// -----------------------------------------------------------------------------

function checkIsPlayersTurn(game: GameState, playerId: PlayerId): void {
  if (playerId !== game.turnHolder) {
    throw Rune.invalidAction()
  }
}

function checkPlayerOwnsUnit(unit: UnitState, playerIndex: number): void {
  if (unit.owner != playerIndex) {
    throw Rune.invalidAction()
  }
}

function checkTileIsEmpty(board: BoardState, tile: number): void {
  if (board[tile] !== null) {
    throw Rune.invalidAction()
  }
}

function checkTileIsNotEmpty(board: BoardState, tile: number): UnitState {
  const unit = board[tile]
  if (unit == null) {
    throw Rune.invalidAction()
  }
  return unit
}

function checkUnitCanMove(unit: UnitState): void {
  if (unit.movement < 1) {
    throw Rune.invalidAction()
  }
}

function checkNotInAttackPhase(game: GameState): void {
  if (game.attackingTile !== NOT_ATTACKING) {
    throw Rune.invalidAction()
  }
}

function checkIndexWithinBounds(array: unknown[], i: number): void {
  if (i < 0) {
    throw Rune.invalidAction()
  }
  if (array.length <= i) {
    throw Rune.invalidAction()
  }
}

function checkItemInCollection<V>(array: V[], item: V): void {
  if (array.indexOf(item) < 0) {
    throw Rune.invalidAction()
  }
}

function checkValuesEqual<V>(a: V, b: V): void {
  if (a !== b) {
    throw Rune.invalidAction()
  }
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function isTileOccupied(tile: TileState): boolean {
  return tile != null
}

function filterFreeTiles(board: BoardState, tiles: number[]): number[] {
  const empty: number[] = []
  for (const tile of tiles) {
    if (board[tile] == null) {
      empty.push(tile)
    }
  }
  return empty
}

function getOccupancyList(board: BoardState): boolean[] {
  return board.map(isTileOccupied)
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

function makePlayer(id: PlayerId): PlayerState {
  return { id, ready: false, lastCombat: null }
}

// -----------------------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------------------

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 2,
  updatesPerSecond: 1,
  persistPlayerData: true,

  setup: (allPlayerIds, { game }) => {
    for (const playerId of allPlayerIds) {
      game.persisted[playerId].sessionCount =
        (game.persisted[playerId].sessionCount || 0) + 1
    }
    return {
      board: buildInitialBoard(),
      benches: [buildDefaultBench(0), buildDefaultBench(1)],
      turnHolder: allPlayerIds[0],
      players: allPlayerIds.map(makePlayer),
      turnStartedAt: Rune.gameTime() + 5, // 5 second lenciency at the start
      attackingTile: NOT_ATTACKING,
    }
  },

  update: ({ game, allPlayerIds }) => {
    if (allPlayerIds.length < 2) {
      // runAI(game)
    }
    const now = Rune.gameTime()
    const elapsed = now - game.turnStartedAt
    if (elapsed > TURN_TIME) {
      swapTurn(game, now)
    }
  },

  actions: buildActionHandlers(),

  events: {
    playerJoined: (playerId, { game }) => {
      game.persisted[playerId].sessionCount =
        (game.persisted[playerId].sessionCount || 0) + 1
    },

    playerLeft: (playerId, { game, allPlayerIds }) => {
      const players = game.players
      for (let i = players.length - 1; i >= 0; --i) {
        if (players[i].id === playerId) {
          players.splice(i, 1)
        }
      }
      if (players.length < 2) {
        declareWinner(players[0].id, allPlayerIds)
      }
      if (game.turnHolder === playerId) {
        swapTurn(game)
      }
    },
  },
})

function buildActionHandlers(): ActionHandlers {
  // variables for closures
  const struct = getArenaStructure()

  const checkTileIsReachable = (
    tile: number,
    fromTiles: number[],
    movement: number,
    board: BoardState
  ): void => {
    if (board[tile] != null) {
      throw Rune.invalidAction()
    }
    const occupancy = getOccupancyList(board)
    for (const fromTile of fromTiles) {
      if (isTileReachable(tile, fromTile, movement, occupancy, struct)) {
        return
      }
    }
    throw Rune.invalidAction()
  }

  const checkTilesAdjacent = (a: number, b: number): void => {
    if (getAdjacentTiles(a, struct).indexOf(b) < 0) {
      throw Rune.invalidAction()
    }
  }

  return {
    moveUnit: (args, { game, playerId, allPlayerIds }) => {
      checkIsPlayersTurn(game, playerId)
      checkNotInAttackPhase(game)
      const playerIndex = getTurnHolderIndex(game)

      const board = game.board
      const fromTile = args.fromTile
      const toTile = args.toTile
      checkIndexWithinBounds(board, fromTile)
      checkIndexWithinBounds(board, toTile)
      checkTileIsEmpty(board, toTile)

      const unit = checkTileIsNotEmpty(board, fromTile)
      checkUnitCanMove(unit)
      checkPlayerOwnsUnit(unit, playerIndex)
      checkTileIsReachable(toTile, [fromTile], unit.movement, board)

      board[fromTile] = null
      board[toTile] = unit

      if (isWinningMove(unit.owner, toTile)) {
        return declareWinner(playerId, allPlayerIds)
      }

      const adjacency = getAdjacentTiles(toTile, struct)
      const attackable = findAttackTargets(board, adjacency, playerIndex)
      if (attackable.length > 0) {
        game.attackingTile = toTile
      } else {
        swapTurn(game)
      }
    },

    playUnit: (args, { game, playerId, allPlayerIds }) => {
      checkIsPlayersTurn(game, playerId)
      checkNotInAttackPhase(game)
      const playerIndex = getTurnHolderIndex(game)

      const bench = game.benches[playerIndex]
      const benchIndex = args.benchIndex
      checkIndexWithinBounds(bench, benchIndex)

      const board = game.board
      const toTile = args.toTile
      checkIndexWithinBounds(board, toTile)

      const unit = bench.splice(benchIndex, 1)[0]
      const spawns = filterFreeTiles(board, findSpawnTiles(playerIndex, struct))
      if (unit.movement === 1) {
        checkItemInCollection(spawns, toTile)
      } else {
        checkTileIsReachable(toTile, spawns, unit.movement - 1, board)
      }

      spawnUnit(board, unit, toTile)
      if (isWinningMove(unit.owner, toTile)) {
        return declareWinner(playerId, allPlayerIds)
      }

      const adjacency = getAdjacentTiles(toTile, struct)
      const attackable = findAttackTargets(board, adjacency, playerIndex)
      if (attackable.length > 0) {
        game.attackingTile = toTile
      } else {
        swapTurn(game)
      }
    },

    attack: (args, { game, playerId }) => {
      checkIsPlayersTurn(game, playerId)

      const board = game.board
      const fromTile = args.fromTile
      const toTile = args.toTile
      checkTilesAdjacent(fromTile, toTile)

      if (game.attackingTile !== NOT_ATTACKING) {
        checkValuesEqual(game.attackingTile, fromTile)
      }

      const unit = checkTileIsNotEmpty(board, fromTile)
      const playerIndex = getTurnHolderIndex(game)
      checkPlayerOwnsUnit(unit, playerIndex)

      const opponent = checkTileIsNotEmpty(board, toTile)
      const opponentIndex = (playerIndex + 1) % game.players.length
      checkPlayerOwnsUnit(opponent, opponentIndex)

      const event: CombatReport = executeCombat(unit, opponent)

      if (event.result >= 0) {
        board[toTile] = null
        game.benches[opponentIndex].push(opponent)
      }
      if (event.result <= 0) {
        board[fromTile] = null
        game.benches[playerIndex].push(unit)
      }

      game.players[playerIndex].lastCombat = event
      swapTurn(game)
    },

    endTurn: (_args, { game, playerId }) => {
      checkIsPlayersTurn(game, playerId)
      swapTurn(game)
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
