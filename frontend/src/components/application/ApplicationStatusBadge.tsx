import { JSX } from "react"
import { Button } from "../button/Button"
import { STATUS_CONFIG } from "./statusConfig"
import type { ApplicationStatus } from "../../types"

export function ApplicationStatusBadge({
  status,
}: {
  status: ApplicationStatus | undefined
}): JSX.Element | null {
  if (!status) return null
  const { headerBadgeClass, headerLabel } = STATUS_CONFIG[status]
  return <span className={headerBadgeClass}>{headerLabel}</span>
}

export function ApplicationStatusButton({
  status,
}: {
  status: ApplicationStatus | undefined
}): JSX.Element | null {
  if (!status) return null
  const { buttonVariant, buttonLabel } = STATUS_CONFIG[status]
  return (
    <Button variant={buttonVariant} disabled>
      {buttonLabel}
    </Button>
  )
}
