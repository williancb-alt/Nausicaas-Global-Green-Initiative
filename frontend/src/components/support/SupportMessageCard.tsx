import { JSX } from "react"
import type { SupportMessage } from "../../services/api/support"
import {
  MessageMeta,
  MessageContent,
  AdminResponseHistory,
  ReplyForm,
} from "./SupportMessageDetails"

/**
 * Individual support message card with reply and history functionality.
 */
export function SupportMessageCard({
  msg,
  replyingTo,
  setReplyingTo,
  viewingHistory,
  setViewingHistory,
  replyContent,
  setReplyContent,
  onSendReply,
  isSending,
}: {
  msg: SupportMessage
  replyingTo: number | null
  setReplyingTo: (id: number | null) => void
  viewingHistory: number | null
  setViewingHistory: (id: number | null) => void
  replyContent: string
  setReplyContent: (c: string) => void
  onSendReply: (id: number) => Promise<void>
  isSending: boolean
}): JSX.Element {
  return (
    <div
      className="card border-0 shadow-sm mb-4 support-card overflow-hidden"
      style={{
        borderRadius: "16px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        borderLeft:
          msg.status === "Replied" ? "6px solid #10b981" : "6px solid #3b82f6",
      }}
    >
      <MessageMeta msg={msg} />

      <div className="card-body p-4 pt-0">
        <MessageContent msg={msg} />

        <AdminResponseHistory
          msg={msg}
          viewingHistory={viewingHistory}
          setViewingHistory={setViewingHistory}
        />

        <ReplyForm
          msg={msg}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          onSendReply={onSendReply}
          isSending={isSending}
        />
      </div>
    </div>
  )
}
