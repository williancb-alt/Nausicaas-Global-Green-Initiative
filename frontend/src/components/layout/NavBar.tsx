import React from "react"
import { Link, NavLink } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { LogoutButton } from "./LogoutButton"

const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore()

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "nav-link active" : "nav-link"

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark"
      style={{ backgroundColor: "#3b7a57" }}
    >
      <div className="container-fluid">
        <Link
          className="navbar-brand fw-bold"
          to="/"
          style={{ fontSize: "1.1rem" }}
        >
          Nausicaas Global Green Initiative
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto">
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/login">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/signup">
                    Sign Up
                  </NavLink>
                </li>
              </>
            ) : user?.admin ? (
              <>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/admin">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/admin/applications">
                    Applications
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/admin/grants">
                    Grants
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/admin/awards">
                    Awards
                  </NavLink>
                </li>
                <li className="nav-item">
                  <LogoutButton />
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/">
                    Home
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to="/dashboard">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <LogoutButton />
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
