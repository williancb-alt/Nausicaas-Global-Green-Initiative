import { JSX, MouseEvent } from "react"
import { Award } from "../../services/api"
import { Button } from "../button/Button"

interface AwardActionsProps {
  isExpanded: boolean
  onEdit: ((award: Award) => void) | undefined
  onDelete: ((name: string) => void) | undefined
  isDeleting: boolean | undefined
  onEditClick: (e: MouseEvent) => void
  onDeleteClick: (e: MouseEvent) => void
}

export function AwardActions({
  isExpanded,
  onEdit,
  onDelete,
  isDeleting,
  onEditClick,
  onDeleteClick,
}: AwardActionsProps): JSX.Element {
  return (
    <div className="d-flex align-items-center gap-2">
      {onEdit && (
        <Button variant="secondary" size="sm" onClick={onEditClick}>
          Edit
        </Button>
      )}
      {onDelete && (
        <Button
          variant="danger"
          size="sm"
          onClick={onDeleteClick}
          disabled={isDeleting}
        >
          {isDeleting ? "..." : "Delete"}
        </Button>
      )}
      <span className="ms-2">{isExpanded ? "\u25B2" : "\u25BC"}</span>
    </div>
  )
}
