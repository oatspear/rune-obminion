// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { createContext, useContext, useState } from "react"

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

type DnDContextType = [string, (_: string) => void]

const DnDContext = createContext<DnDContextType>(["", () => {}])

export default DnDContext

// -----------------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------------

export const DnDProvider = ({ children }: React.PropsWithChildren) => {
  const [type, setType] = useState<string>("")

  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  )
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useDnD = () => {
  return useContext(DnDContext)
}
