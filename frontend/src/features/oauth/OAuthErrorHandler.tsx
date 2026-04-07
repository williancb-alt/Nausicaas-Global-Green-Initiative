import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { getMonitoring } from "../../services/monitoring"

export function OAuthErrorHandler() {
  const [searchParams, setSearchParams] = useSearchParams()
  const oauthError = searchParams.get("oauth_error")

  useEffect(() => {
    if (!oauthError) return

    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev)
        next.delete("oauth_error")
        return next
      },
      { replace: true },
    )

    getMonitoring().captureMessage(`OAuth login failed: ${oauthError}`, "error")

    const message = "Login failed. Please try again."
    alert(message)
  }, [oauthError, setSearchParams])

  return null
}
