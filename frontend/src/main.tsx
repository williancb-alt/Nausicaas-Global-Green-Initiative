import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"
import App from "./App.tsx"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
