import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "./Card"

describe("Card Components", () => {
    it("should render card structure", () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Title</CardTitle>
                    <CardDescription>Description</CardDescription>
                </CardHeader>
                <CardContent>Content</CardContent>
                <CardFooter>Footer</CardFooter>
            </Card>
        )

        expect(screen.getByText("Title")).toBeDefined()
        expect(screen.getByText("Description")).toBeDefined()
        expect(screen.getByText("Content")).toBeDefined()
        expect(screen.getByText("Footer")).toBeDefined()
    })

    it("should apply custom classNames", () => {
        const { container } = render(<Card className="custom-card" />)
        expect(container.firstChild).toHaveClass("custom-card")
    })
})
