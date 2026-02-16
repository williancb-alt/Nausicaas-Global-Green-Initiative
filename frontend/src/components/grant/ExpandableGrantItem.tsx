import React, { JSX } from "react"
import type { Grant } from "../../services/api/client"
import { GrantHeader } from "./GrantHeader"
import { GrantActions } from "./GrantActions"
import { GrantDetails } from "./GrantDetails"

interface ExpandableGrantItemProps {
  grant: Grant
  isExpanded: boolean
  onToggle: () => void
  onDelete?: (name: string) => void
  onEdit?: (grant: Grant) => void
  isDeleting?: boolean
  hasApplied?: boolean
}

export function ExpandableGrantItem({
  grant,
  isExpanded,
  onToggle,
  onDelete,
  onEdit,
  isDeleting,
  hasApplied = false,
}: ExpandableGrantItemProps): JSX.Element {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (
      onDelete &&
      confirm(`Are you sure you want to delete "${grant.name}"?`)
    ) {
      onDelete(grant.name)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(grant)
    }
  }

  return (
    <li className="list-group-item p-0">
      <div
        className="p-3 d-flex justify-content-between align-items-center"
        onClick={onToggle}
        style={{ cursor: "pointer" }}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === "Enter" && onToggle()}
        aria-expanded={isExpanded}
      >
        <GrantHeader grant={grant} hasApplied={hasApplied} />
        <GrantActions
          isExpanded={isExpanded}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
          onEditClick={handleEdit}
          onDeleteClick={handleDelete}
        />
      </div>

      {isExpanded && (
        <div className="p-3 pt-0 border-top bg-light">
          <GrantDetails grant={grant} />
        </div>
      )}
    </li>
  )
}
