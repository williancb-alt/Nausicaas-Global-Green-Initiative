import { ProtectedRoute } from "./components/protectedRoute/ProtectedRoute"
import { ForgotPassword } from "./pages/ForgotPassword"
import { Home } from "./pages/Home"
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"

export const routes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
]
