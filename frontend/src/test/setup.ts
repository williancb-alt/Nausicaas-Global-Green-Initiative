import "@testing-library/jest-dom"
import { vi } from "vitest"

vi.stubEnv("VITE_API_BASE_URL", "http://localhost:4000/v1")
