import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tab"

describe("Tabs Components", () => {
  it("should render tabs and content", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Trigger 1</TabsTrigger>
          <TabsTrigger value="tab2">Trigger 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    )

    expect(screen.getByText("Trigger 1")).toBeDefined()
    expect(screen.getByText("Content 1")).toBeDefined()
    expect(screen.queryByText("Content 2")).toBeNull()
  })
})
