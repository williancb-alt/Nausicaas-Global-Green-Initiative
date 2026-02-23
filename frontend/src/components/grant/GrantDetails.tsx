import { JSX } from "react"
import { Grant } from "../../services/api"

export function GrantDetails({ grant }: { grant: Grant }): JSX.Element | null {
  const hasCustomFields =
    grant.custom_fields &&
    grant.custom_fields.configs &&
    grant.custom_fields.configs.length > 0

  if (!grant.description && !hasCustomFields) {
    return (
      <div className="text-muted">
        <em>No additional field data available for this grant.</em>
      </div>
    )
  }

  return (
    <>
      {grant.description && (
        <div className="mb-2">
          <strong>Description:</strong>
          <p className="mb-1">{grant.description}</p>
        </div>
      )}

      {hasCustomFields && (
        <>
          <hr />
          <h6>Custom Fields</h6>
          {grant.custom_fields!.configs.map((field, index) => (
            <div key={index} className="mb-2">
              <strong>{field.label}:</strong>
              <span className="ms-2">
                {grant.custom_fields!.values[`field_${index}`] || "N/A"}
              </span>
            </div>
          ))}
        </>
      )}
    </>
  )
}
