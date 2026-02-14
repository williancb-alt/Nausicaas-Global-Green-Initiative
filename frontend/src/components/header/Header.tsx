import { JSX } from "react"
import { Link } from "react-router-dom"
import NavBar from "../layout/NavBar"

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
                    width: "75px",
                    height: "75px",
                    borderRadius: "50%",
                    backgroundColor: "#3b7a57",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  NG
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
