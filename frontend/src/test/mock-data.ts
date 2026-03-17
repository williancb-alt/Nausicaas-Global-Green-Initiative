import { Application } from "../types"
import { Grant } from "../services/api/client"

export const EMPTY_PAGINATED_RESPONSE = {
  items: [],
  has_next: false,
  has_prev: false,
  page: 1,
  total_pages: 1,
  total_items: 0,
  items_per_page: 10,
  links: { self: "", first: "", last: "" },
}

export const mockApplication: Application = {
  id: 1,
  status: "pending_review",
  applicant: { email: "user@test.com", public_id: "user-1" },
  grant: { name: "Test Grant", description: "Test Desc" },
  submitted_at: "2026-03-16T00:00:00Z",
  submitted_date: "2026-03-16",
  field_values: { field_0: "Value 0" },
}

export const mockGrant: Grant = {
  name: "Test Grant",
  description: "Test Desc",
  deadline: "2026-12-31",
  deadline_passed: false,
  time_remaining: "1 year",
}

export const mockUser = {
  email: "user@test.com",
  admin: false,
  public_id: "user-1",
}

export const mockAdminUser = {
  email: "admin@test.com",
  admin: true,
  public_id: "admin-1",
}

export const mockMutationResult = {
  mutate: () => {},
  isPending: false,
  isError: false,
  error: null,
  reset: () => {},
  isSuccess: false,
  status: "idle",
  data: undefined,
}

export const mockAward = {
  name: "Green Award",
  deadline: "2026-12-31",
  deadline_passed: false,
  time_remaining: "1 year",
}
