import React from "react"

type Variant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "light"
  | "dark"
  | "link"

type Size = "sm" | "lg" | undefined

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: React.ReactNode
}

export function Button({
  variant = "primary",
  size,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const sizeClass = size ? `btn-${size}` : ""
  const classes = `btn btn-${variant} ${sizeClass} ${className}`.trim()
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
