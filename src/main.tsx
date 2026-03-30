import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConvexProvider } from "convex/react"
import App from './App'
import { convex } from './lib/convex'
import './index.css'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('root element not found')
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>,
)
