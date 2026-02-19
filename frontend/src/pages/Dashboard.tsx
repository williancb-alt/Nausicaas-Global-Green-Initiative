import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

// Types
interface Grant {
  name: string;
  deadline: string;
  deadline_passed: boolean;
  time_remaining: string;
}

interface AppStats {
  count: number;
}

const Dashboard = () => {
  const authStore = useAuthStore();
  const user = authStore.user;
  const [availableGrants, setAvailableGrants] = useState<Grant[]>([]);
  console.log("User in Dashboard 1:", availableGrants);
  const [myApps, setMyApps] = useState<AppStats>({ count: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await api.auth.logout();
    window.location.href = '/login';
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const grantResponse = await api.grants.listGrants(1, 10);
      const grants = grantResponse.items.filter((g: any) => !g.deadline_passed);
      setAvailableGrants(grants);
      setMyApps({ count: 2 });
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }

      console.log("User in Dashboard: 2", availableGrants);
  };

  // Basic Loading Spinner replacement
  if (loading) {
      console.log("User in Dashboard: 3", availableGrants);
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
        <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 2s linear infinite', margin: 'auto' }}></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  // Basic Error Alert replacement
  if (error) {
    return (
      <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', margin: '20px', borderRadius: '4px', border: '1px solid #f5c6cb' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Header Section */}
      <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
        <h1>User Dashboard</h1>
        <p>Welcome, <strong>{user?.email || user?.public_id || 'User'}</strong></p>
        
        <div style={{ backgroundColor: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', color: '#01579b' }}>
          <strong>Available Grants:</strong> {availableGrants.length} | 
          <strong> Your Applications:</strong> {myApps.count}
        </div>

        <button 
          onClick={handleLogout}
          style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </header>

      {/* Grants Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {availableGrants.length > 0 ? (
          availableGrants.map((grant) => (
            <div key={grant.name} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: '0' }}>{grant.name}</h3>
              <p>
                <strong>Deadline:</strong> {grant.deadline}<br/>
                <strong>Time Left:</strong> <span style={{ color: '#28a745' }}>{grant.time_remaining}</span>
              </p>
              <button style={{ width: '100%', backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Apply Now
              </button>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', textAlign: 'center' }}>
            No grants available right now. Check back later!
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;