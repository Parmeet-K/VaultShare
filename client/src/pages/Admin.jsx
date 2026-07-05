import { useEffect, useState } from 'react';
import { AlertTriangle, Database, ShieldAlert, Users } from 'lucide-react';
import { MetricCard } from '../components/ui/MetricCard.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { api } from '../lib/api.js';

export function Admin() {
  const [state, setState] = useState({ stats: null, logs: [], users: [], error: null });
  const [showUsersModal, setShowUsersModal] = useState(false);

  useEffect(() => { 
    api.get('/admin/overview')
      .then((res) => setState({ 
        stats: res.data.stats, 
        logs: res.data.logs, 
        users: res.data.users || [], // Store users array if provided by your backend overview endpoint
        error: null 
      }))
      .catch((error) => setState({ 
        stats: null, 
        logs: [], 
        users: [], 
        error: error.response?.data?.message || 'Admin access required' 
      })); 
  }, []);

  if (state.error) return <div className="page-stack"><div className="page-heading"><div><h2>Admin Panel</h2><p>Only admin users can access system monitoring.</p></div></div><div className="empty glass-panel"><ShieldAlert /><strong>{state.error}</strong><span>Your current account is a normal user.</span></div></div>;

  const stats = state.stats || { users: 0, files: 0, shares: 0, riskEvents: 0 };

  return <div className="page-stack">
    <div className="page-heading">
      <div><h2>Admin Panel</h2><p>Monitor users, files, shares, and system activity.</p></div>
    </div>
    
    <section className="metrics-row">
      {/* Added style pointer and onClick to make it open the people list */}
      <div onClick={() => setShowUsersModal(true)} style={{ cursor: 'pointer' }}>
        <MetricCard label="Users" value={stats.users || 0} detail="Managed users" icon={Users} />
      </div>
      <MetricCard label="Files" value={stats.files || 0} detail="Encrypted files" icon={Database} />
      <MetricCard label="Shares" value={stats.shares || 0} detail="Share links" icon={AlertTriangle} />
      <MetricCard label="Risk events" value={stats.riskEvents || 0} detail="Security alerts" icon={ShieldAlert} />
    </section>
    
    {/* Log Table - Capped strictly to last 6 entries using .slice(0, 6) */}
    <section className="table glass-panel">
      <div className="table-row head">
        <span>Event</span><span>Actor</span><span>Time</span>
      </div>
      {state.logs.slice(0, 6).map((log) => (
        <div className="table-row" key={log._id}>
          <span>{log.action}</span>
          <span>{log.actor?.email || 'system'}</span>
          <span>{new Date(log.createdAt).toLocaleString()}</span>
        </div>
      ))}
      {!state.logs.length && <div className="empty-row"><strong>No system logs yet</strong><p>Admin logs appear after users take actions.</p></div>}
    </section>

    {/* Managed People Modal Window */}
    {showUsersModal && (
      <Modal title="Managed Users" onClose={() => setShowUsersModal(false)}>
        <div className="session-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {state.users.length ? state.users.map((u) => (
            <article className="session-item" key={u._id || u.id} style={{ padding: '12px 6px' }}>
              <div>
                <strong>{u.name || 'Platform User'}</strong>
                <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>{u.email}</p>
                <small style={{ opacity: 0.6 }}>Role: {u.role || 'User'}</small>
              </div>
            </article>
          )) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <strong>Total Count: {stats.users} Users</strong>
              <p className="muted-line" style={{ fontSize: '13px', marginTop: '6px' }}>
                Individual profiles are bundled into backend reporting pipelines.
              </p>
            </div>
          )}
        </div>
      </Modal>
    )}
  </div>;
}