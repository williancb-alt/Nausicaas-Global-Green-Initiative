import { JSX } from "react"

export const DashboardLoading = (): JSX.Element => (
  <div
    style={{
      textAlign: "center",
      marginTop: "50px",
      fontFamily: "sans-serif",
    }}
  >
    <div
      className="spinner"
      style={{
        border: "4px solid #f3f3f3",
        borderTop: "4px solid #3498db",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        animation: "spin 2s linear infinite",
        margin: "auto",
      }}
    ></div>
    <p>Loading Dashboard...</p>
  </div>
)

export const DashboardError = ({ error }: { error: string }): JSX.Element => (
  <div
    style={{
      backgroundColor: "#f8d7da",
      color: "#721c24",
      padding: "15px",
      margin: "20px",
      borderRadius: "4px",
      border: "1px solid #f5c6cb",
    }}
  >
    {error}
  </div>
)
