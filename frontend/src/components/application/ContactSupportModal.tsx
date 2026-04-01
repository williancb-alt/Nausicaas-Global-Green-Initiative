import { JSX, useEffect } from "react"
import { ContactModalHeader } from "./ContactModalHeader"
import { ContactModalBody } from "./ContactModalBody"

interface ContactSupportModalProps {
  isOpen: boolean
  onClose: () => void
  applicationId: number | string
}

export function ContactSupportModal({
  isOpen,
  onClose,
  applicationId,
}: ContactSupportModalProps): JSX.Element | null {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    document.addEventListener("keydown", handleEscape)
    if (isOpen) document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1050 }}
      />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content border-0 overflow-hidden"
            style={{ borderRadius: "16px" }}
          >
            <ContactModalHeader onClose={onClose} />
            <ContactModalBody onClose={onClose} applicationId={applicationId} />
          </div>
        </div>
      </div>
    </>
  )
}
