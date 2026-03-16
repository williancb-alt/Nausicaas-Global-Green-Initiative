import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { GrantApplicationLoadingView } from "./GrantApplicationLoadingView"

describe("GrantApplicationLoadingView", () => {
    it("should render loading state", () => {
        render(<GrantApplicationLoadingView />)
        expect(screen.getAllByText("Loading grant details...")).toHaveLength(2)
    })
})
