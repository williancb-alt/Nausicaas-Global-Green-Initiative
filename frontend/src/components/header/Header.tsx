import { JSX } from "react"
import { Link } from "react-router-dom"
import NavBar from "../layout/NavBar"
import logo from "../../assets/logo.png"

export function Header(): JSX.Element {
  return (
    <>
      <header
        style={{
          width: "100%",
          backgroundColor: "#eef7ee",
          borderBottom: "2px solid #3b7a57",
        }}
        className="d-flex align-items-center p-4"
      >
        <div className="w-100">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Link
                to="/"
                className="text-decoration-none"
                aria-label="Go to home page"
              >
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden"
                  }}
                >
                  <img
                    src={logo}
                    alt="NG"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain"
                    }}
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <NavBar />
    </>
  )
}
