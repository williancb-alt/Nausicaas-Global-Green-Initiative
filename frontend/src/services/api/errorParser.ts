function formatFieldErrors(errors: Record<string, string>): string {
  return Object.entries(errors)
    .map(([field, msg]) => `${field}: ${String(msg)}`)
    .join("; ")
}

function extractMessage(body: unknown, fallback: string): string {
  const errorBody = body as Record<string, unknown> | null
  return (
    (typeof errorBody?.message === "string" && errorBody.message) ||
    (typeof errorBody?.error === "string" && errorBody.error) ||
    fallback
  )
}

export function parseErrorMessage(body: unknown, fallback: string): string {
  const message = extractMessage(body, fallback)
  const errorBody = body as Record<string, unknown> | null
  const fieldErrors = errorBody?.errors
  if (!fieldErrors || typeof fieldErrors !== "object") return message
  const details = formatFieldErrors(fieldErrors as Record<string, string>)
  return details ? `${message} - ${details}` : message
}
