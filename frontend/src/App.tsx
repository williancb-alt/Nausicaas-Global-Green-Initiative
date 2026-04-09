import { JSX } from "react"
import * as Sentry from "@sentry/react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { routes } from "./routes"
import { Header } from "./components/header/Header"
import { useUser } from "./hooks/useAuthHooks"
import { OAuthErrorHandler } from "./features/oauth/OAuthErrorHandler"

const SentryRoutes = Sentry.withSentryReactRouterV7Routing(Routes)

function App(): JSX.Element {
  useUser()
  return (
    <BrowserRouter>
      <div className="min-vh-100 w-100">
        <OAuthErrorHandler />
        <Header />
        <main className="min-vh-100 w-100">
          <SentryRoutes>
            {routes.map(route => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </SentryRoutes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
