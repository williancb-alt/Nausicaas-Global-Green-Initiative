import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { ChartCard } from "../card/ChartCard"

interface GrantData {
  name: string
  applications: number
}

interface GrantDistributionChartProps {
  data: GrantData[]
}

export function GrantDistributionChart({ data }: GrantDistributionChartProps) {
  return (
    <div className="col-12 col-lg-6">
      <ChartCard title="Applications by Grant">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6f4e8" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="applications" fill="#3b7a57" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
