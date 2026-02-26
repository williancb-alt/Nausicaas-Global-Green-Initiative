import { type FormEvent } from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { GrantApplicationForm } from "./GrantApplicationForm"
import type { Grant } from "../../services/api/client"
import type { DynamicFieldConfig } from "../../types"

const makeGrant = (configs: DynamicFieldConfig[] = []): Grant => ({
  name: "Test Grant",
  deadline: "2026-12-31",
  deadline_passed: false,
  time_remaining: "300 days",
  hidden: false,
  owner: { email: "admin@test.com", public_id: "1" },
  custom_fields: { configs, values: {} },
})

describe("GrantApplicationForm", () => {
  const defaultProps = {
    onFieldChange: vi.fn(),
    onSubmit: vi.fn(),
    submitError: null,
    isSubmitting: false,
    onCancel: vi.fn(),
  }

  it("blocks submit when required fields are empty and shows alert", () => {
    const grant = makeGrant([
      {
        type: "text",
        label: "Project Summary",
        maxLength: 500,
        required: true,
      },
      {
        type: "currency",
        label: "Funding Amount",
        min: 0,
        max: 100000,
        required: true,
      },
    ])

    render(
      <GrantApplicationForm {...defaultProps} grant={grant} fieldValues={{}} />,
    )

    fireEvent.click(screen.getByRole("button", { name: /submit application/i }))

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please fill in the following required fields: Project Summary, Funding Amount",
    )
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it("allows submit when all required fields are filled", () => {
    const grant = makeGrant([
      {
        type: "text",
        label: "Project Summary",
        maxLength: 500,
        required: true,
      },
    ])

    const onSubmit = vi.fn((e: FormEvent<HTMLFormElement>) =>
      e.preventDefault(),
    )

    render(
      <GrantApplicationForm
        {...defaultProps}
        grant={grant}
        fieldValues={{ field_0: "My project summary" }}
        onSubmit={onSubmit}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /submit application/i }))

    expect(
      screen.queryByText(/please fill in the following/i),
    ).not.toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalled()
  })

  it("allows submit when only optional fields are empty", () => {
    const grant = makeGrant([
      {
        type: "text",
        label: "Project Summary",
        maxLength: 500,
        required: true,
      },
      { type: "text", label: "Extra Notes", maxLength: 200, required: false },
    ])

    const onSubmit = vi.fn((e: FormEvent<HTMLFormElement>) =>
      e.preventDefault(),
    )

    render(
      <GrantApplicationForm
        {...defaultProps}
        grant={grant}
        fieldValues={{ field_0: "Filled required field" }}
        onSubmit={onSubmit}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: /submit application/i }))

    expect(
      screen.queryByText(/please fill in the following/i),
    ).not.toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalled()
  })
})
