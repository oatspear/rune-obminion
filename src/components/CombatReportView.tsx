// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André "Oats" Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { CombatReport } from "../logic/logic"

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export interface CombatReportViewProps {
  report: CombatReport
  playerIsAttacker: boolean
}

export default function CombatReportView({
  report,
  playerIsAttacker,
}: CombatReportViewProps): JSX.Element {
  const a = report.attackerDice.reduce(add, 0)
  const d = report.defenderDice.reduce(add, 0)

  return (
    <div className="combat-report">
      <h2>{getResultLabel(report.result, playerIsAttacker)}</h2>
      <p>
        🗡 [{report.attackerDice.map(printDie).join(" + ")}] = <b>{a}</b>
      </p>
      <p>
        🛡 [{report.defenderDice.map(printDie).join(" + ")}] = <b>{d}</b>
      </p>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function add(a: number, b: number): number {
  return a + b
}

function printDie(value: number): string {
  return `🎲${value}`
}

function getResultLabel(result: number, playerIsAttacker: boolean): string {
  result = playerIsAttacker ? result : -result
  return result > 0 ? "Victory" : result < 0 ? "Defeat" : "Draw"
}
