import { JSX } from "react"

interface Grant {
  name: string
  deadline: string
  deadline_passed: boolean
  time_remaining: string
}

export function DashboardHeader({
  userEmail,
  grantCount,
  appCount,
  onLogout,
}: {
  userEmail: string
  grantCount: number
  appCount: number
  onLogout: () => void
}): JSX.Element {
  return (
    <header
      style={{
        marginBottom: "30px",
        borderBottom: "1px solid #eee",
        paddingBottom: "20px",
      }}
    >
      <h1>User Dashboard</h1>
      <p>
        Welcome, <strong>{userEmail}</strong>
      </p>

      <div
        style={{
          backgroundColor: "#e1f5fe",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "15px",
          color: "#01579b",
        }}
      >
        <strong>Available Grants:</strong> {grantCount} |
        <strong> Your Applications:</strong> {appCount}
      </div>

      <button
        onClick={onLogout}
        style={{
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </header>
  )
}

export function GrantCard({ grant }: { grant: Grant }): JSX.Element {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ marginTop: "0" }}>{grant.name}</h3>
      <p>
        <strong>Deadline:</strong> {grant.deadline}
        <br />
        <strong>Time Left:</strong>{" "}
        <span style={{ color: "#28a745" }}>{grant.time_remaining}</span>
      </p>
      <button
        style={{
          width: "100%",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          padding: "10px",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Apply Now
      </button>
    </div>
  )
}
