import { JSX } from "react"
import { Search, Filter } from "lucide-react"
import { FilterStatus, SupportStats } from "./types"

/**
 * Filter and Search bar for the Support Messages Page.
 */
export function SupportFilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  stats,
}: {
  searchQuery: string
  setSearchQuery: (q: string) => void
  statusFilter: FilterStatus
  setStatusFilter: (s: FilterStatus) => void
  stats: SupportStats
}): JSX.Element {
  return (
    <div className="card border-0 shadow-sm mb-4 bg-white overflow-hidden">
      <div className="card-body p-3">
        <div className="row g-3 align-items-center">
          <div className="col-lg-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by subject or user email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="col-lg-8">
            <div className="d-flex align-items-center justify-content-lg-end gap-2 overflow-auto pb-1 pb-md-0">
              <span className="text-muted me-2 d-none d-sm-block">
                <Filter size={18} className="me-1" /> Status:
              </span>
              <button
                className={`btn btn-sm px-3 rounded-pill transition-all ${statusFilter === "all" ? "btn-success" : "btn-light"}`}
                onClick={() => setStatusFilter("all")}
              >
                All ({stats.total})
              </button>
              <button
                className={`btn btn-sm px-3 rounded-pill transition-all ${statusFilter === "pending" ? "btn-success" : "btn-light"}`}
                onClick={() => setStatusFilter("pending")}
              >
                Pending ({stats.pending})
              </button>
              <button
                className={`btn btn-sm px-3 rounded-pill transition-all ${statusFilter === "replied" ? "btn-success" : "btn-light"}`}
                onClick={() => setStatusFilter("replied")}
              >
                Replied ({stats.replied})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
