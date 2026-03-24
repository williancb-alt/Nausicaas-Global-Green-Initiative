import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { GrantDistributionChart } from "./GrantDistributionChart"

// Mock recharts
vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts")
  return {
    ...(actual as object),
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    BarChart: ({
      children,
      data,
    }: {
      children: React.ReactNode
      data: unknown[]
    }) => (
      <div data-testid="bar-chart">
        {children} {data.length} bars
      </div>
    ),
    Bar: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
  }
})

describe("GrantDistributionChart", () => {
  const mockData = [
    { name: "Grant 1", applications: 10 },
    { name: "Grant 2", applications: 20 },
  ]

  it("should render chart title and bar chart", () => {
    render(<GrantDistributionChart data={mockData} />)
    expect(screen.getByText("Applications by Grant")).toBeDefined()
    expect(screen.getByTestId("bar-chart")).toBeDefined()
    expect(screen.getByText("2 bars")).toBeDefined()
  })
})
