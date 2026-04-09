import React, { JSX, useEffect, useRef, useState } from "react"
import { api } from "../../services/api"
import { getMonitoring } from "../../services/monitoring"
import { SuccessMessage } from "./SuccessMessage"
import { SupportForm } from "./SupportForm"

export function ContactModalBody({
  applicationId,
  onClose,
}: {
  applicationId: number | string
  onClose: () => void
}): JSX.Element {
  const [subject, setSubject] = useState(
    `Question regarding Application #${applicationId}`,
  )
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      await api.support.createMessage({
        application_id: applicationId,
        subject,
        message,
      })
      setIsSubmitting(false)
      setIsSuccess(true)
      closeTimerRef.current = setTimeout(onClose, 3000)
    } catch (err: unknown) {
      getMonitoring().captureException(err, {
        context: "support.contactModal",
        applicationId,
      })
      setIsSubmitting(false)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to send message.")
      }
    }
  }

  if (isSuccess) return <SuccessMessage />

  return (
    <SupportForm
      subject={subject}
      setSubject={setSubject}
      message={message}
      setMessage={setMessage}
      isSubmitting={isSubmitting}
      error={error}
      onSubmit={e => void handleSubmit(e)}
      onClose={onClose}
    />
  )
}
