// SPDX-License-Identifier: MPL-2.0
// Copyright © 2024 André Santos

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import React from "react"
import ReactDOM from "react-dom/client"

import App from "./App.tsx"
import "./styles.css"

// -----------------------------------------------------------------------------
// Entry Point
// -----------------------------------------------------------------------------

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
