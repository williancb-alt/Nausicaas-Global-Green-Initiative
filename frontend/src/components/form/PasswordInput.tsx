import { useState } from "react"
import { UseFormRegisterReturn } from "react-hook-form"

interface PasswordInputProps {
  registration: UseFormRegisterReturn
  placeholder: string
  autoComplete?: string
}

export function PasswordInput({
  registration,
  placeholder,
  autoComplete = "new-password",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="input-group">
      <input
        type={showPassword ? "text" : "password"}
        {...registration}
        className="form-control"
        autoComplete={autoComplete}
        aria-required="true"
        placeholder={placeholder}
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => setShowPassword(prev => !prev)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? "Hide" : "Show"}
      </button>
    </div>
  )
}
