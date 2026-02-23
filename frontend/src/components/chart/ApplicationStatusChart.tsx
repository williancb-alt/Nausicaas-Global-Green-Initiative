import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { ChartCard } from "../card/ChartCard"

interface StatusData {
  name: string
  value: number
  color: string
}

interface ApplicationStatusChartProps {
  data: StatusData[]
}

export function ApplicationStatusChart({ data }: ApplicationStatusChartProps) {
  const visibleData = data.filter(d => d.value > 0)

  const renderCustomLabel = ({
    name,
    percent,
  }: {
    name?: string
    percent?: number
  } = {}) => {
    return `${name || "N/A"}: ${((percent || 0) * 100).toFixed(0)}%`
  }

  return (
    <div className="col-12 col-lg-6">
      <ChartCard title="Application Status Distribution">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={visibleData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {visibleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
