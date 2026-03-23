import { JSX } from "react"
import { AlertCircle } from "lucide-react"

// Sub-components
import { SupportPageHeader } from "../components/support/SupportPageHeader"
import { SupportStatsCards } from "../components/support/SupportStatsCards"
import { SupportFilterBar } from "../components/support/SupportFilterBar"
import { SupportMessageCard } from "../components/support/SupportMessageCard"

// Hooks
import { useSupportManagement } from "../hooks/useSupportManagement"

export function SupportMessagesPage(): JSX.Element {
  const {
    filteredMessages,
    loading,
    error,
    setError,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    replyingTo,
    setReplyingTo,
    viewingHistory,
    setViewingHistory,
    replyContent,
    setReplyContent,
    isSending,
    handleSendReply,
    stats,
  } = useSupportManagement()

  if (loading) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "60vh" }}
      >
        <div
          className="spinner-border text-success mb-3"
          style={{ width: "3rem", height: "3rem" }}
          role="status"
        ></div>
        <p className="text-muted fw-medium font-monospace">
          Gathering communication records...
        </p>
      </div>
    )
  }

  return (
    <div
      className="min-vh-100 py-5 px-3 px-sm-4 px-md-5"
      style={{
        backgroundColor: "#f8fafc",
        backgroundImage:
          "radial-gradient(#e2e8f0 0.5px, transparent 0.5px), radial-gradient(#e2e8f0 0.5px, #f8fafc 0.5px)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0,10px 10px",
      }}
    >
      <div className="container-xl" style={{ maxWidth: "1000px" }}>
        <SupportPageHeader />

        <SupportStatsCards pending={stats.pending} replied={stats.replied} />

        <SupportFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          stats={stats}
        />

        {error && (
          <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center gap-2">
            <AlertCircle size={20} />
            <div className="fw-medium">{error}</div>
            <button
              className="btn-close ms-auto"
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        <div className="support-feed">
          {filteredMessages.length > 0 ? (
            filteredMessages.map(msg => (
              <SupportMessageCard
                key={msg.id}
                msg={msg}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                viewingHistory={viewingHistory}
                setViewingHistory={setViewingHistory}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                onSendReply={handleSendReply}
                isSending={isSending}
              />
            ))
          ) : (
            <div className="card border-0 shadow-sm text-center p-5 rounded-4 bg-white">
              <div className="display-4 text-muted mb-3">📭</div>
              <h4 className="fw-bold text-dark mb-1">No messages found</h4>
              <p className="text-muted mb-0">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
                .support-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05) !important;
                }
                .transition-all {
                    transition: all 0.2s ease-in-out;
                }
            `}</style>
    </div>
  )
}

export default SupportMessagesPage
