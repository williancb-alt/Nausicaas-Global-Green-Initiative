import { useState, useMemo } from 'react';
import { FileText, Search } from 'lucide-react';
import { useUser } from '../hooks/useAuthHooks'; 
import { Application } from '../types/index';

// --- HELPER FUNCTIONS (Kept outside for accessibility) ---

const getStatusBadgeStyle = (status: Application['status'] | 'opened') => {
  if (status === 'approved') return { backgroundColor: '#eef7ee', color: '#2f6f44' };
  if (status === 'denied') return { backgroundColor: '#fee2e2', color: '#dc2626' };
  if (status === 'pending_review' || status === 'in_review' || status === 'opened') {
    return { backgroundColor: '#fff4e6', color: '#d97706' };
  }
  return { backgroundColor: '#f3f4f6', color: '#6b7280' };
};

const getStatusText = (status: Application['status'] | 'opened') => {
  if (status === 'approved') return 'Approved';
  if (status === 'denied') return 'Denied';
  if (status === 'pending_review') return 'Pending Review';
  if (status === 'in_review') return 'In Review';
  if (status === 'opened') return 'Open - Apply Now';
  return status;
};

// --- MAIN COMPONENT ---

export function UserDashboard({
  // We remove 'user' and 'applications' from props because we will fetch them here
  availableGrants = [],
  onLogout,
  onNewApplication,
  onViewApplication,
}: any) { 
  
  // 2. Fetch the logged-in user directly inside the component
  const { data: user, isLoading, isError } = useUser();
  
  // 3. Temporary placeholder for applications (You can add a useApplications hook here later)
  const applications: Application[] = []; 

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Application['status'] | 'opened'>('all');

  // 4. Handle Loading State (Stops the blank page)
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#eef7ee" }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  // 5. Handle Error/No User State
  if (isError || !user) {
    return (
      <div className="container py-5 text-center">
        <h3>Session Expired</h3>
        <p>Please log in again to view your dashboard.</p>
        <button onClick={onLogout} className="btn btn-success">Back to Login</button>
      </div>
    );
  }

  // --- YOUR EXISTING LOGIC (Now using the fetched 'user') ---

  const stats = useMemo(() => {
    const total = applications.length;
    const approved = applications.filter(app => app.status === 'approved').length;
    const rejected = applications.filter(app => app.status === 'denied').length;
    const pending = applications.filter(app => app.status === 'pending_review' || app.status === 'in_review').length;

    return { total, approved, rejected, pending };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = searchTerm === '' ||
        String(app.id).includes(searchTerm) ||
        app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.grant.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const tableData = useMemo(() => {
    const userApps = filteredApplications.map(app => ({
      id: app.id,
      title: app.grant.name,
      status: app.status as Application['status'] | 'opened',
      isUserApp: true,
      applicant: app.applicant.email,
      submitted: app.submitted_date || 'N/A',
      amount: 'N/A',
      deadline: 'N/A'
    }));

    const openGrants = availableGrants.map((grant: any) => ({
      id: grant.id,
      title: grant.name,
      status: 'opened' as const,
      isUserApp: false,
      applicant: '',
      submitted: '',
      amount: 'N/A',
      deadline: 'N/A'
    }));

    return [...userApps, ...openGrants];
  }, [filteredApplications, availableGrants]);

  return (
    <div style={{ backgroundColor: "#eef7ee", minHeight: "100vh" }}>
      <header style={{ backgroundColor: "#2f6f44", color: "white" }} className="border-bottom">
        <div className="container-fluid py-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0 fw-bold">User Dashboard</h1>
              {/* Now 'user' is guaranteed to exist because of the check on line 66 */}
              <p className="mb-0 mt-2" style={{ opacity: 0.9 }}>Welcome back, {user.email}</p>
            </div>
            <div className="d-flex gap-3">
              <button onClick={onNewApplication} className="btn" style={{ backgroundColor: "white", color: "#3b7a57", fontWeight: "500" }}>
                + New Application
              </button>
              <button onClick={onLogout} className="btn btn-outline-light">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-fluid py-5">
        <div className="row mb-5 g-4">
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card h-100" style={{ borderTop: "4px solid #3b82f6", borderRadius: "8px" }}>
              <div className="card-body">
                <p className="text-muted mb-2">Total Applications</p>
                <h2 className="fw-bold" style={{ color: "#2f6f44", fontSize: "2.5rem" }}>{stats.total}</h2>
              </div>
            </div>
          </div>
          {/* ... Rest of your cards ... */}
        </div>

        <div className="card" style={{ borderRadius: "8px", borderTop: "4px solid #3b7a57" }}>
          <div className="card-header" style={{ backgroundColor: "#eef7ee", borderBottom: "1px solid #e6f4e8" }}>
            <h5 className="card-title mb-0" style={{ color: "#2f6f44", fontWeight: "600" }}>Available Grants</h5>
          </div>
          <div className="card-body">
            <div className="row mb-4 g-3">
              <div className="col-auto">
                <div className="btn-group" role="group">
                  <button type="button" className={`btn ${statusFilter === 'all' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setStatusFilter('all')}>All</button>
                  <button type="button" className={`btn ${statusFilter === 'opened' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => setStatusFilter('opened')}>Open</button>
                  <button type="button" className={`btn ${statusFilter === 'approved' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setStatusFilter('approved')}>Approved</button>
                </div>
              </div>
              <div className="col">
                <div className="input-group">
                  <span className="input-group-text" style={{ backgroundColor: "#eef7ee" }}><Search size={18} style={{ color: "#3b7a57" }} /></span>
                  <input type="text" className="form-control" placeholder="Search grants..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
            </div>
            <UserGrantsTable data={tableData} onViewApplication={onViewApplication} onNewApplication={onNewApplication} />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT (UserGrantsTable stays exactly as you had it) ---
function UserGrantsTable({ data, onViewApplication, onNewApplication }: { data: any[]; onViewApplication: (id: number) => void; onNewApplication: () => void; }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-5">
        <FileText size={48} className="text-muted mb-3" />
        <p className="text-muted">No grants available</p>
        <button onClick={onNewApplication} className="btn btn-success">Browse Grants</button>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th style={{ color: "#2f6f44", fontWeight: 600 }}>Grant Title</th>
            <th style={{ color: "#2f6f44", fontWeight: 600 }}>Amount</th>
            <th style={{ color: "#2f6f44", fontWeight: 600 }}>Deadline</th>
            <th style={{ color: "#2f6f44", fontWeight: 600 }}>Status</th>
            <th style={{ color: "#2f6f44", fontWeight: 600 }}>Applicant</th>
            <th style={{ color: "#2f6f44", fontWeight: 600 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id || row.title || `row-${index}`}>
              <td style={{ fontWeight: 500 }}>{row.title}</td>
              <td><strong>${row.amount}</strong></td>
              <td>{row.deadline}</td>
              <td>
                <span className="badge fs-6 px-3 py-2" style={{ ...getStatusBadgeStyle(row.status), fontWeight: 500, minWidth: '100px' }}>
                  {getStatusText(row.status)}
                </span>
              </td>
              <td>{row.applicant || <span className="text-muted">—</span>}</td>
              <td>
                {row.isUserApp ? (
                  <button onClick={() => onViewApplication(row.id)} className="btn btn-outline-success btn-sm">View</button>
                ) : (
                  <button onClick={onNewApplication} className="btn btn-success btn-sm">Apply Now</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}