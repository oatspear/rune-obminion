// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André "Oats" Santos

// -----------------------------------------------------------------------------
// Board Structure
// -----------------------------------------------------------------------------

export enum ArenaTileType {
  NONE = 0,
  PLAYER1_GOAL = 1,
  PLAYER2_GOAL = 2,
  PLAYER1_SPAWN = 3,
  PLAYER2_SPAWN = 4,
}

export interface ArenaStructure {
  tiles: ArenaTileType[]
  edges: Array<number[]>
}

// tiles are mirrored diagonally, splitting the two player sides
export function getArenaStructure(): ArenaStructure {
  return {
    tiles: [
      // Player 1 zone (top) -----------
      ArenaTileType.PLAYER1_GOAL, // 0
      ArenaTileType.PLAYER1_SPAWN, // 1
      ArenaTileType.PLAYER1_SPAWN, // 2
      ArenaTileType.NONE, // 3
      ArenaTileType.NONE, // 4
      ArenaTileType.NONE, // 5
      ArenaTileType.NONE, // 6
      // West Path (top to bottom) -----
      ArenaTileType.NONE, // 7
      ArenaTileType.NONE, // 8
      ArenaTileType.NONE, // 9
      // Central island (top, west) ----
      ArenaTileType.NONE, // 10
      ArenaTileType.NONE, // 11
      ArenaTileType.NONE, // 12
      ArenaTileType.NONE, // 13
      // -------------------------------
      ArenaTileType.NONE, // 14
      ArenaTileType.NONE, // 15
      ArenaTileType.NONE, // 16
      ArenaTileType.NONE, // 17
      // East Path (bottom to top) -----
      ArenaTileType.NONE, // 18
      ArenaTileType.NONE, // 19
      ArenaTileType.NONE, // 20
      // Player 2 zone (bottom) --------
      ArenaTileType.NONE, // 21
      ArenaTileType.NONE, // 22
      ArenaTileType.NONE, // 23
      ArenaTileType.NONE, // 24
      ArenaTileType.PLAYER2_SPAWN, // 25
      ArenaTileType.PLAYER2_SPAWN, // 26
      ArenaTileType.PLAYER2_GOAL, // 27
    ],
    edges: [
      // Player 1 zone -----------------
      [3, 5], // 0
      [7, 12], // 1
      [10], // 2
      [4, 11], // 3
      [1], // 4
      [6], // 5
      [2], // 6
      // West Path ---------------------
      [8], // 7
      [9], // 8
      [25], // 9
      // Central island ----------------
      [11], // 10
      [12], // 11
      [13], // 12
      [17], // 13
      // -----------------------
      [10], // 14
      [14], // 15
      [15], // 16
      [16], // 17
      // East Path ---------------------
      [2], // 18
      [18], // 19
      [19], // 20
      // Player 2 zone -----------------
      [25], // 21
      [21], // 22
      [26], // 23
      [23, 16], // 24
      [17], // 25
      [20, 15], // 26
      [24, 22], // 27
    ],
  }
}

// -----------------------------------------------------------------------------
// Query Interface
// -----------------------------------------------------------------------------

export function findSpawnTiles(
  playerIndex: number,
  struct: ArenaStructure
): number[] {
  if (playerIndex === 0) return findTiles(ArenaTileType.PLAYER1_SPAWN, struct)
  if (playerIndex === 1) return findTiles(ArenaTileType.PLAYER2_SPAWN, struct)
  return []
}

export function findGoalTile(
  playerIndex: number,
  struct: ArenaStructure
): number {
  if (playerIndex === 0) return findTiles(ArenaTileType.PLAYER1_GOAL, struct)[0]
  if (playerIndex === 1) return findTiles(ArenaTileType.PLAYER2_GOAL, struct)[0]
  return -1
}

function findTiles(type: ArenaTileType, struct: ArenaStructure): number[] {
  const indices: number[] = []
  const tiles = struct.tiles
  for (let i = tiles.length - 1; i >= 0; --i) {
    if (tiles[i] === type) {
      indices.push(i)
    }
  }
  return indices
}

export function getAdjacentTiles(
  tile: number,
  struct: ArenaStructure
): number[] {
  const edges = struct.edges
  const adjacent: number[] = [...edges[tile]]
  // check everything before
  for (let other = tile - 1; other >= 0; --other) {
    if (edges[other].indexOf(tile) > 0) {
      adjacent.push(other)
    }
  }
  // check everything after
  for (let other = tile + 1; other < edges.length; ++other) {
    if (edges[other].indexOf(tile) > 0) {
      adjacent.push(other)
    }
  }
  return adjacent
}

export function getReachableTiles(
  fromTile: number,
  movement: number,
  occupancy: boolean[],
  struct: ArenaStructure
): number[][] {
  const edges: number[][] = [...struct.edges]
  const reach: number[][] = [[fromTile]]
  for (let m = 1; m <= movement; ++m) {
    reach.push([])
    const previous = reach[m - 1]
    for (let source = 0; source < edges.length; ++source) {
      const adjacency = edges[source]
      for (let j = adjacency.length; j >= 0; --j) {
        let edgeConsumed = false
        const target = adjacency[j]
        if (previous.indexOf(source) >= 0) {
          edgeConsumed = true
          if (!occupancy[target]) {
            reach[m].push(target)
          }
        }
        if (previous.indexOf(target) >= 0) {
          edgeConsumed = true
          if (!occupancy[source]) {
            reach[m].push(source)
          }
        }
        if (edgeConsumed) {
          adjacency.splice(j, 1)
        }
      }
    }
  }
  return reach
}

export function isTileReachable(
  targetTile: number,
  fromTile: number,
  movement: number,
  occupancy: boolean[],
  struct: ArenaStructure
): boolean {
  if (fromTile === targetTile) return true
  const edges: number[][] = [...struct.edges]
  let previous: number[] = [fromTile]
  for (let m = 1; m <= movement; ++m) {
    const reach: number[] = []
    for (let source = 0; source < edges.length; ++source) {
      const adjacency = edges[source]
      for (let j = adjacency.length; j >= 0; --j) {
        let edgeConsumed = false
        const adjacent = adjacency[j]
        if (previous.indexOf(source) >= 0) {
          edgeConsumed = true
          if (!occupancy[adjacent]) {
            if (adjacent === targetTile) return true
            reach.push(adjacent)
          }
        }
        if (previous.indexOf(adjacent) >= 0) {
          edgeConsumed = true
          if (!occupancy[source]) {
            if (source === targetTile) return true
            reach.push(source)
          }
        }
        if (edgeConsumed) {
          adjacency.splice(j, 1)
        }
      }
    }
    previous = reach
  }
  return false
}
