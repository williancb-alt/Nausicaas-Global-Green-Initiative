import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { Textarea } from "./TextArea"

describe("Textarea", () => {
    it("should render textarea with provided props", () => {
        render(<Textarea placeholder="Enter text" defaultValue="hello" />)
        const textarea = screen.getByPlaceholderText<HTMLTextAreaElement>("Enter text")
        expect(textarea).toBeDefined()
        expect(textarea.value).toBe("hello")
    })

    it("should apply custom className", () => {
        const { container } = render(<Textarea className="custom-class" />)
        expect(container.querySelector("textarea")).toHaveClass("custom-class")
    })
})
