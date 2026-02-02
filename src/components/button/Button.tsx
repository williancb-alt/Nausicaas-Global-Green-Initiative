import React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
  isLoading?: boolean
}

export function Button({ 
  children, 
  variant = "primary", 
  isLoading = false,
  disabled,
  ...props 
}: ButtonProps): React.ReactElement {
  return (
    <button 
      className={`btn btn-${variant}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  )
}