interface ChartCardProps {
  title: string
  children: React.ReactNode
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div
      className="card"
      style={{ borderRadius: "8px", borderTop: "4px solid #3b7a57" }}
    >
      <div
        className="card-header"
        style={{
          backgroundColor: "#eef7ee",
          borderBottom: "1px solid #e6f4e8",
        }}
      >
        <h5
          className="card-title mb-0"
          style={{ color: "#2f6f44", fontWeight: "600" }}
        >
          {title}
        </h5>
      </div>
      <div className="card-body">{children}</div>
    </div>
  )
}
