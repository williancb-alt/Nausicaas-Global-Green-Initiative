interface PasswordRequirementsProps {
  password: string
}

const requirements = [
  { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  { label: "1 uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "1 number", test: (pw: string) => /[0-9]/.test(pw) },
]

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  return (
    <ul className="list-unstyled small mt-1 mb-2">
      {requirements.map(req => {
        const met = password.length > 0 && req.test(password)
        return (
          <li key={req.label} style={{ color: met ? "#198754" : "#6c757d" }}>
            {met ? "\u2713" : "\u2022"} {req.label}
          </li>
        )
      })}
    </ul>
  )
}
