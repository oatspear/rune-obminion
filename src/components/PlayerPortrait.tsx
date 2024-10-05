// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André "Oats" Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { useMemo } from "react"
import { Player } from "rune-sdk"

import aiAvatar from "../assets/avatar-bot.png"

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export interface PlayerPortraitProps {
  playerId: string
  hostile: boolean
  active: boolean
}

export default function PlayerPortrait({
  playerId,
  hostile,
  active,
}: PlayerPortraitProps): JSX.Element {
  const player: Player = useMemo(() => {
    if (!playerId) {
      return {
        playerId,
        displayName: "A.I.",
        avatarUrl: aiAvatar,
      }
    }
    return Rune.getPlayerInfo(playerId)
  }, [playerId])

  const className = useMemo(() => {
    if (hostile && active) {
      return "player-portrait hostile active"
    }
    if (hostile) {
      return "player-portrait hostile"
    }
    if (active) {
      return "player-portrait active"
    }
    return "player-portrait"
  }, [active, hostile])

  return (
    <div className={className}>
      <img src={player.avatarUrl} />
      <span>{player.displayName}</span>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------
