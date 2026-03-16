import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { AlertError } from "./AlertError"

describe("AlertError", () => {
    it("should render error message if provided as an Error object", () => {
        render(<AlertError error={new Error("Custom Error Message")} />)
        expect(screen.getByText("Custom Error Message")).toBeDefined()
    })

    it("should render fallback message if error is truthy but NOT an Error object", () => {
        render(<AlertError error="String Error" fallback="Something went wrong" />)
        expect(screen.getByText("Something went wrong")).toBeDefined()
    })

    it("should use default fallback message if error is a generic truthy value", () => {
        render(<AlertError error={true} />)
        expect(screen.getByText("An error occurred")).toBeDefined()
    })

    it("should return null if error is null or undefined", () => {
        const { container } = render(<AlertError error={null} />)
        expect(container.firstChild).toBeNull()
    })
})
