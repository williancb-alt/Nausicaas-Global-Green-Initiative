import { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, FileText, CheckCircle2, XCircle, Clock, Search, Plus } from 'lucide-react';
import { Card } from '@/components/layout/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/layout/Tab';
import { Application, LoginCredentials } from '@/types/index';

interface AdminDashboardProps {
  user: LoginCredentials;
  applications: Application[];
  grants: Application[];
  onLogout: () => void;
  onViewApplication: (applicationId: string) => void;
  onManageGrants: () => void;
}

export function AdminDashboard({ 
  user, 
  applications, 
  grants,
  onLogout,
  onViewApplication,
  onManageGrants
}: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Application['status']>('all');

  // Calculate statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const approved = applications.filter(app => app.status).length;
    const rejected = applications.filter(app => app.status ).length;
    const pending = applications.filter(app => app.status ).length;

    return { total, approved, rejected, pending };
  }, [applications]);

  // Prepare chart data
  const statusChartData = [
    { name: 'Approved', value: stats.approved, color: '#10b981' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
    { name: 'Pending Review', value: stats.pending, color: '#f59e0b' }
  ];

  // Grant-wise application data
  const grantWiseData = useMemo(() => {
    const grantMap = new Map<string, number>();
    
    applications.forEach(app => {
      grantMap.set(app.grantTitle, (grantMap.get(app.grantTitle) || 0) + 1);
    });

    return Array.from(grantMap.entries()).map(([name, count]) => ({
      name,
      applications: count
    }));
  }, [applications]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = searchTerm === '' || 
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.organization.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600">Welcome back, {user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onManageGrants}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Manage Grants
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600">Total Applications</p>
                <p className="text-slate-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600">Approved</p>
                <p className="text-slate-900 mt-1">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600">Rejected</p>
                <p className="text-slate-900 mt-1">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600">Under Review</p>
                <p className="text-slate-900 mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <Card className="p-6 bg-white">
            <h3 className="text-slate-900 mb-4">Application Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name: string; percent: number }) => {
                    return `${name}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Grant-wise Applications */}
          <Card className="p-6 bg-white">
            <h3 className="text-slate-900 mb-4">Applications by Grant</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={grantWiseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Applications Management */}
        <Card className="p-6 bg-white">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>
                  All Applications
                </TabsTrigger>
                <TabsTrigger value="pending" onClick={() => setStatusFilter('pending' as Application['status'])}>
                  Pending Review
                </TabsTrigger>
                <TabsTrigger value="approved" onClick={() => setStatusFilter('approved' as Application['status'])}>
                  Approved
                </TabsTrigger>
                <TabsTrigger value="rejected" onClick={() => setStatusFilter('rejected' as Application['status'])}>
                  Rejected
                </TabsTrigger>
              </TabsList>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by ID or Organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <TabsContent value="all" className="mt-0">
              <ApplicationsTable 
                applications={filteredApplications} 
                onViewApplication={onViewApplication}
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              <ApplicationsTable 
                applications={filteredApplications} 
                onViewApplication={onViewApplication}
              />
            </TabsContent>

            <TabsContent value="approved" className="mt-0">
              <ApplicationsTable 
                applications={filteredApplications} 
                onViewApplication={onViewApplication}
              />
            </TabsContent>

            <TabsContent value="rejected" className="mt-0">
              <ApplicationsTable 
                applications={filteredApplications} 
                onViewApplication={onViewApplication}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

// Applications Table Component
function ApplicationsTable({ 
  applications, 
  onViewApplication 
}: { 
  applications: Application[]; 
  onViewApplication: (id: string) => void;
}) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">No applications found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 text-slate-700">Application ID</th>
            <th className="text-left py-3 px-4 text-slate-700">Organization</th>
            <th className="text-left py-3 px-4 text-slate-700">Grant</th>
            <th className="text-left py-3 px-4 text-slate-700">Amount</th>
            <th className="text-left py-3 px-4 text-slate-700">Submitted</th>
            <th className="text-left py-3 px-4 text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-4 text-slate-900">{app.id}</td>
              <td className="py-3 px-4 text-slate-900">{app.organization}</td>
              <td className="py-3 px-4 text-slate-600">{app.grantTitle}</td>
              <td className="py-3 px-4 text-slate-900">
                ${app.requestedAmount.toLocaleString()}
              </td>
              <td className="py-3 px-4 text-slate-600">{app.submittedDate}</td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${
                    app.status
                      ? 'bg-emerald-100 text-emerald-700'
                      : app.status 
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {app.status  && <CheckCircle2 className="w-3 h-3" />}
                  {app.status  && <XCircle className="w-3 h-3" />}
                  {app.status && <Clock className="w-3 h-3" />}
                  {app.status}
                </span>
              </td>
              <td className="py-3 px-4">
                <button
                  onClick={() => onViewApplication(app.id)}
                  className="text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}