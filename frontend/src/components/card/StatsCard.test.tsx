import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { StatCard } from "./StatsCard"

describe("StatCard", () => {
    it("should render stat details correctly", () => {
        render(
            <StatCard
                label="Total Grants"
                value={12}
                subtext="+2 this month"
                accentColor="#3b7a57"
            />
        )
        expect(screen.getByText("Total Grants")).toBeDefined()
        expect(screen.getByText("12")).toBeDefined()
        expect(screen.getByText("+2 this month")).toBeDefined()
    })
})
