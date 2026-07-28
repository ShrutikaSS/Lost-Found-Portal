import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Settings, Users, FileSpreadsheet, FileText, UserX, UserCheck, Plus, Download } from 'lucide-react';

export default function AdminDashboard({ initialTab = 'analytics' }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Stats State
  const [stats, setStats] = useState(null);

  // User Directory State
  const [users, setUsers] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  // Dropdowns CRUD State
  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCode, setNewZoneCode] = useState('');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchDropdowns();
    fetchAuditLogs();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setStats(await res.json());
    } catch (e) {}
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userQuery) params.append('q', userQuery);
      if (userRoleFilter) params.append('role', userRoleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch (e) {}
  };

  const fetchDropdowns = async () => {
    try {
      const [catRes, zoneRes] = await Promise.all([
        fetch('/api/items/categories'),
        fetch('/api/items/zones')
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (zoneRes.ok) setZones(await zoneRes.json());
    } catch (e) {}
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setAuditLogs(await res.json());
    } catch (e) {}
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        showToast('User status updated.', 'success');
        fetchUsers();
      }
    } catch (e) {}
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        showToast(`User role updated to ${newRole}.`, 'success');
        fetchUsers();
      }
    } catch (e) {}
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newCatName, description: newCatDesc })
      });
      if (res.ok) {
        showToast('Category created.', 'success');
        setNewCatName('');
        setNewCatDesc('');
        fetchDropdowns();
      }
    } catch (e) {}
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
    if (!newZoneName) return;
    try {
      const res = await fetch('/api/admin/zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newZoneName, building_code: newZoneCode })
      });
      if (res.ok) {
        showToast('Campus zone created.', 'success');
        setNewZoneName('');
        setNewZoneCode('');
        fetchDropdowns();
      }
    } catch (e) {}
  };

  const handleDownloadPdf = () => {
    window.open('/api/admin/reports/pdf', '_blank');
  };

  const handleDownloadExcel = () => {
    window.open('/api/admin/reports/excel', '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#ffffff' }}>
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1px' }}>
            <Settings size={16} /> TRACKNFIND ADMINISTRATION HUB
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>User & System Administration</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Manage registered user RBAC directory, enable/disable accounts, category & zone dropdown lists, and official reports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleDownloadPdf}>
            <FileText size={15} /> Export PDF Report
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleDownloadExcel}>
            <FileSpreadsheet size={15} /> Export CSV / Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button className={`btn ${activeTab === 'user-management' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('user-management')}>
          <Users size={15} /> User Directory RBAC ({users.length})
        </button>
        <button className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('analytics')}>
          Global Analytics
        </button>
        <button className={`btn ${activeTab === 'dropdowns' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('dropdowns')}>
          Categories & Zones CRUD
        </button>
        <button className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('reports')}>
          Report Exporters
        </button>
        <button className={`btn ${activeTab === 'audit-logs' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('audit-logs')}>
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: User Directory Management */}
      {activeTab === 'user-management' && (
        <div>
          {/* Sub-Section Navigation: 2 Dedicated Sections (Officer and Admin) */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <button 
              className={`btn ${userRoleFilter !== 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setUserRoleFilter('officer')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, padding: '0.6rem 1.25rem' }}
            >
              👮 Officer Section ({users.filter(u => u.role === 'officer').length})
            </button>
            <button 
              className={`btn ${userRoleFilter === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setUserRoleFilter('admin')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, padding: '0.6rem 1.25rem' }}
            >
              ⚙️ Admin Section ({users.filter(u => u.role === 'admin').length})
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem', background: '#ffffff' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, minWidth: '280px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={`Search ${userRoleFilter === 'admin' ? 'Admins' : 'Officers'} by name or email...`} 
                  value={userQuery} 
                  onChange={e => setUserQuery(e.target.value)} 
                />
                <button className="btn btn-primary btn-sm" onClick={fetchUsers}>
                  Search
                </button>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', background: '#eff6ff', padding: '0.4rem 0.8rem', borderRadius: '6px' }}>
                Managing: {userRoleFilter === 'admin' ? '⚙️ Administrator Directory' : '👮 Officer Directory'}
              </div>
            </div>
          </div>

          <div className="table-responsive glass-panel">
            <table className="table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Institutional Email</th>
                  <th>Current Role</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(u => {
                    const targetRole = userRoleFilter === 'admin' ? 'admin' : 'officer';
                    const matchesRole = u.role === targetRole;
                    const matchesQuery = !userQuery || u.name.toLowerCase().includes(userQuery.toLowerCase()) || u.email.toLowerCase().includes(userQuery.toLowerCase());
                    return matchesRole && matchesQuery;
                  })
                  .map(u => (
                    <tr key={u.id}>
                      <td><strong>#USR-{u.id}</strong></td>
                      <td><strong>{u.name}</strong></td>
                      <td><code>{u.email}</code></td>
                      <td>
                        <select 
                          className="form-control" 
                          value={u.role} 
                          onChange={e => handleChangeRole(u.id, e.target.value)}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.825rem', fontWeight: 600, background: '#f8fafc' }}
                        >
                          <option value="officer">Officer</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${u.is_active ? 'badge-verified' : 'badge-rejected'}`}>
                          {u.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`btn ${u.is_active ? 'btn-danger' : 'btn-success'} btn-sm`}
                          onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                        >
                          {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                          {u.is_active ? ' Disable Account' : ' Enable Account'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Global Analytics */}
      {activeTab === 'analytics' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem', background: '#ffffff' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#2563eb' }}>{stats.totalLost}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Lost Items Reported</div>
            </div>

            <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem', background: '#ffffff' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0284c7' }}>{stats.totalFound}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Found Items Turn-Ins</div>
            </div>

            <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem', background: '#ffffff' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981' }}>{stats.totalReturned}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Property Returned / Claimed</div>
            </div>

            <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem', background: '#ffffff' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#d97706' }}>{stats.pendingClaims}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Pending Officer Claims</div>
            </div>

            <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem', background: '#ffffff' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#3b82f6' }}>{stats.approvalRate}%</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Claim Approval Rate</div>
            </div>

            <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem', background: '#ffffff' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalUsers}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Registered Users</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Categories & Campus Zones CRUD */}
      {activeTab === 'dropdowns' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Categories Management */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Categories List CRUD</h3>
            
            <form onSubmit={handleAddCategory} style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="New Category Name..." value={newCatName} onChange={e => setNewCatName(e.target.value)} required />
              </div>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Description..." value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                <Plus size={14} /> Add Category
              </button>
            </form>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {categories.map(c => (
                <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #e2e8f0' }}>
                  <span><strong>{c.name}</strong></span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID #{c.id}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Campus Zones Management */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Campus Zones List CRUD</h3>

            <form onSubmit={handleAddZone} style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Zone Name (e.g. Science Complex)..." value={newZoneName} onChange={e => setNewZoneName(e.target.value)} required />
              </div>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Building Code (e.g. SCI-B)..." value={newZoneCode} onChange={e => setNewZoneCode(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                <Plus size={14} /> Add Campus Zone
              </button>
            </form>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {zones.map(z => (
                <li key={z.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #e2e8f0' }}>
                  <span><strong>{z.name}</strong> ({z.building_code})</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID #{z.id}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 4: Report Exporters */}
      {activeTab === 'reports' && (
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto', width: '100%', background: '#ffffff' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>Generate Institutional Reports</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Export operational lost & found summaries, claim approval ratios, and complete item inventories for administrative reporting.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={handleDownloadPdf}>
              <Download size={18} /> Download Official PDF Report
            </button>
            <button className="btn btn-secondary" onClick={handleDownloadExcel}>
              <Download size={18} /> Download Excel / CSV Table
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Logs */}
      {activeTab === 'audit-logs' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>System Action Audit Trail</h2>

          <div className="table-responsive glass-panel">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action Code</th>
                  <th>Target Type</th>
                  <th>Target ID</th>
                  <th>Remarks / Audit Notes</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td><strong>{log.actor_name}</strong></td>
                    <td><code>{log.action}</code></td>
                    <td>{log.target_type || '-'}</td>
                    <td>{log.target_id || '-'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{log.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
