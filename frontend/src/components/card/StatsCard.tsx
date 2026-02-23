interface StatCardProps {
  label: string
  value: number
  subtext: string
  accentColor: string
  valueColor?: string
}

export function StatCard({
  label,
  value,
  subtext,
  accentColor,
  valueColor = "#2f6f44",
}: StatCardProps) {
  return (
    <div className="col-12 col-md-6 col-lg-3">
      <div
        className="card h-100"
        style={{ borderTop: `4px solid ${accentColor}`, borderRadius: "8px" }}
      >
        <div className="card-body">
          <p className="text-muted mb-2">{label}</p>
          <h2
            className="fw-bold"
            style={{ color: valueColor, fontSize: "2.5rem" }}
          >
            {value}
          </h2>
          <small className="text-muted">{subtext}</small>
        </div>
      </div>
    </div>
  )
}
