import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"
import "./styles/theme.css"
import App from "./App.tsx"
import { ErrorBoundary } from "./components/errorBoundary/ErrorBoundary"
import { getMonitoring, initMonitoring } from "./services/monitoring"

initMonitoring()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError(error) {
        getMonitoring().captureException(error)
      },
    },
  },
})

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

const app = (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ErrorBoundary>
)

createRoot(rootElement).render(
  import.meta.env.DEV ? <StrictMode>{app}</StrictMode> : app,
)
