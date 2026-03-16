import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { ApplicationStatusChart } from "./ApplicationStatusChart"

// Mock recharts to avoid ResponsiveContainer resize issues in jsdom
vi.mock("recharts", async () => {
    const actual = await vi.importActual("recharts")
    return {
        ...actual as any,
        ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
        PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
        Pie: ({ data }: any) => <div data-testid="pie">{data.length} items</div>,
        Tooltip: () => <div />,
        Cell: () => <div />,
    }
})

describe("ApplicationStatusChart", () => {
    const mockData = [
        { name: "Approved", value: 10, color: "green" },
        { name: "Pending", value: 5, color: "orange" },
        { name: "Rejected", value: 0, color: "red" }, // Should be filtered out
    ]

    it("should render chart title and pie chart", () => {
        render(<ApplicationStatusChart data={mockData} />)
        expect(screen.getByText("Application Status Distribution")).toBeDefined()
        expect(screen.getByTestId("pie-chart")).toBeDefined()
    })

    it("should filter out items with zero value", () => {
        render(<ApplicationStatusChart data={mockData} />)
        expect(screen.getByText("2 items")).toBeDefined()
    })
})
