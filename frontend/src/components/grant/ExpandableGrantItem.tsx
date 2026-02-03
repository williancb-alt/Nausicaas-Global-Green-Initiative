import React, { JSX } from "react"
import { Button } from "../button/Button"
import type { Grant } from "../../services/api/client"

interface ExpandableGrantItemProps {
  grant: Grant
  isExpanded: boolean
  onToggle: () => void
  onDelete?: (name: string) => void
  onEdit?: (grant: Grant) => void
  isDeleting?: boolean
}

export function ExpandableGrantItem({
  grant,
  isExpanded,
  onToggle,
  onDelete,
  onEdit,
  isDeleting,
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
        <div>
          <div className="fw-semibold">{grant.name}</div>
          {grant.deadline && (
            <div className="text-muted small">Deadline: {grant.deadline}</div>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          {onEdit && (
            <Button variant="secondary" size="sm" onClick={handleEdit}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "..." : "Delete"}
            </Button>
          )}
          <span className="ms-2">{isExpanded ? "\u25B2" : "\u25BC"}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 pt-0 border-top bg-light">
          {grant.description && (
            <div className="mb-2">
              <strong>Description:</strong>
              <p className="mb-1">{grant.description}</p>
            </div>
          )}

          {grant.custom_fields &&
            grant.custom_fields.configs &&
            grant.custom_fields.configs.length > 0 && (
              <>
                <hr />
                <h6>Custom Fields</h6>
                {grant.custom_fields.configs.map((field, index) => (
                  <div key={index} className="mb-2">
                    <strong>{field.label}:</strong>
                    <span className="ms-2">
                      {grant.custom_fields?.values[`field_${index}`] || "N/A"}
                    </span>
                  </div>
                ))}
              </>
            )}

          {!grant.description &&
            (!grant.custom_fields || !grant.custom_fields.configs?.length) && (
              <div className="text-muted">
                <em>No additional field data available for this grant.</em>
              </div>
            )}
        </div>
      )}
    </li>
  )
}
