import React from "react";
import { Link, NavLink } from "react-router-dom";


const Navbar: React.FC = () => {

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#3b7a57" }}>
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/admin" style={{ fontSize: "1.1rem" }}>
          Nausicaas Global Green Initiative
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="adminNavbar">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/admin"
              >
                Dashboard
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/admin/applications"
              >
                Applications
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/admin/grants"
              >
                Grants
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;