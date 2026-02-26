import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { useState } from "react"
import { DynamicFieldInput } from "./DynamicFieldInput"
import type {
  CurrencyFieldConfig,
  DynamicFieldConfig,
  TextFieldConfig,
} from "../../types"

const currencyField: CurrencyFieldConfig = {
  type: "currency",
  label: "Funding Amount",
  min: 100,
  max: 50000,
  required: true,
}

const optionalCurrencyField: CurrencyFieldConfig = {
  ...currencyField,
  required: false,
}

const requiredTextField: TextFieldConfig = {
  type: "text",
  label: "Project Summary",
  maxLength: 500,
  required: true,
}

const optionalTextField: TextFieldConfig = {
  ...requiredTextField,
  required: false,
}

function renderField(field: DynamicFieldConfig) {
  return render(
    <DynamicFieldInput field={field} index={0} value="" onChange={vi.fn()} />,
  )
}

function Wrapper({ field }: { field: DynamicFieldConfig }) {
  const [value, setValue] = useState("")
  return (
    <DynamicFieldInput
      field={field}
      index={0}
      value={value}
      onChange={setValue}
    />
  )
}

describe("DynamicFieldInput", () => {
  describe("FieldLabel rendering", () => {
    it("shows red * when required is true", () => {
      renderField(currencyField)
      const asterisk = screen.getByText("*")
      expect(asterisk).toBeInTheDocument()
      expect(asterisk).toHaveClass("text-danger")
    })

    it("shows (Optional) when required is false", () => {
      renderField(optionalCurrencyField)
      expect(screen.getByText("(Optional)")).toBeInTheDocument()
      expect(screen.queryByText("*")).not.toBeInTheDocument()
    })
  })

  describe("Currency field", () => {
    it("renders € prefix, range text, and placeholder", () => {
      renderField(currencyField)
      expect(screen.getByText("€")).toBeInTheDocument()
      expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument()
      expect(screen.getByText(/Range: €100 – €50000/)).toBeInTheDocument()
    })

    it("shows required error on blur when empty and required", () => {
      renderField(currencyField)
      fireEvent.blur(screen.getByPlaceholderText("0.00"))
      expect(screen.getByText("This field is required")).toBeInTheDocument()
    })

    it("does not show error on blur when empty and optional", () => {
      renderField(optionalCurrencyField)
      fireEvent.blur(screen.getByPlaceholderText("0.00"))
      expect(
        screen.queryByText("This field is required"),
      ).not.toBeInTheDocument()
    })

    it("shows error when value is below min", () => {
      render(<Wrapper field={currencyField} />)
      const input = screen.getByPlaceholderText("0.00")
      fireEvent.change(input, { target: { value: "50" } })
      fireEvent.blur(input)
      expect(
        screen.getByText("Amount must be at least €100"),
      ).toBeInTheDocument()
    })

    it("shows error when value is above max", () => {
      render(<Wrapper field={currencyField} />)
      const input = screen.getByPlaceholderText("0.00")
      fireEvent.change(input, { target: { value: "99999" } })
      fireEvent.blur(input)
      expect(
        screen.getByText("Amount must be at most €50000"),
      ).toBeInTheDocument()
    })

    it("shows no error when value is within valid range", () => {
      render(<Wrapper field={currencyField} />)
      const input = screen.getByPlaceholderText("0.00")
      fireEvent.change(input, { target: { value: "500" } })
      fireEvent.blur(input)
      expect(screen.queryByText(/Amount must be/)).not.toBeInTheDocument()
      expect(
        screen.queryByText("This field is required"),
      ).not.toBeInTheDocument()
    })
  })

  describe("Text field", () => {
    it("shows required error on blur when empty and required", () => {
      renderField(requiredTextField)
      fireEvent.blur(screen.getByRole("textbox"))
      expect(screen.getByText("This field is required")).toBeInTheDocument()
    })

    it("does not show error on blur when empty and optional", () => {
      renderField(optionalTextField)
      fireEvent.blur(screen.getByRole("textbox"))
      expect(
        screen.queryByText("This field is required"),
      ).not.toBeInTheDocument()
    })
  })
})
