import { JSX } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { routes } from "./routes"
import { Header } from "./components/header/Header"

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <div className="min-vh-100 w-100">
        <Header />
        <main className="min-vh-100 w-100">
          <Routes>
            {routes.map(route => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
