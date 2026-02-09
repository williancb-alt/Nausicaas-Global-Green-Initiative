import React, { JSX } from "react"

type Props = {
  label?: string
  error?: any
  children: React.ReactNode
}

export function FormField({ label, error, children }: Props): JSX.Element {
  return (
    <div className="mb-3">
      {label && <label className="form-label">{label}</label>}
      {children}
      {error && <div className="text-danger mt-1">{String(error?.message ?? error)}</div>}
    </div>
  )
}