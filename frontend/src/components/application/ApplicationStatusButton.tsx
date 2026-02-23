import { JSX } from "react"
import { Button } from "../button/Button"
import { STATUS_CONFIG } from "./statusConfig"
import { ApplicationStatus } from "../../types"

interface ApplicationStatusButtonProps {
  status: ApplicationStatus | undefined
}

export function ApplicationStatusButton({
  status,
}: ApplicationStatusButtonProps): JSX.Element | null {
  if (!status) return null
  const { buttonVariant, buttonLabel } = STATUS_CONFIG[status]
  return (
    <Button variant={buttonVariant} disabled>
      {buttonLabel}
    </Button>
  )
}
