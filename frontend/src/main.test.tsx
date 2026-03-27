import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock dependencies
const mockRender = vi.fn()
const mockCreateRoot = vi.fn(() => ({ render: mockRender }))

vi.mock("react-dom/client", () => ({
  createRoot: mockCreateRoot,
}))

vi.mock("./App.tsx", () => ({
  default: () => <div>App</div>,
}))

vi.mock("bootstrap/dist/css/bootstrap.min.css", () => ({}))
vi.mock("bootstrap/dist/js/bootstrap.bundle.min.js", () => ({}))
vi.mock("./styles/theme.css", () => ({}))

describe("main", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ""
  })

  it("renders the app into the root element", async () => {
    // Get the root element in the DOM and append it to the document body
    const root = document.createElement("div")
    root.id = "root"
    document.body.appendChild(root)

    await import("./main")

    // Validate that createRoot was called with the root element and render was called to render the App component
    expect(mockCreateRoot).toHaveBeenCalledWith(root)
    expect(mockRender).toHaveBeenCalled()
  })

  it("throws when root element is missing", async () => {
    // No #root element in DOM
    vi.resetModules()

    // Re-mock dependencies after resetModules
    vi.doMock("react-dom/client", () => ({
      createRoot: mockCreateRoot,
    }))
    vi.doMock("./App.tsx", () => ({ default: () => null }))
    vi.doMock("bootstrap/dist/css/bootstrap.min.css", () => ({}))
    vi.doMock("bootstrap/dist/js/bootstrap.bundle.min.js", () => ({}))
    vi.doMock("./styles/theme.css", () => ({}))

    // Contrived example but just validating that error would be thrown if root could
    // not be found to load the app into
    await expect(import("./main")).rejects.toThrow("Root element not found")
  })
})
