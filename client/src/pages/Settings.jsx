import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { KeyRound, Laptop, Languages, Shield, Trash2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { Modal } from '../components/ui/Modal.jsx';
import { setLocale } from '../store/slices/themeSlice.js';

export function Settings() {
  const dispatch = useDispatch();
  const locale = useSelector((s) => s.theme.locale);
  const [enabled, setEnabled] = useState(false);
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState('');

  async function openSessions() {
  setError('');
  try { 
    const res = await api.get('/auth/sessions'); 
        const activeOnly = res.data.sessions.filter(s => !s.revokedAt);
    setSessions(activeOnly); 
  }
  catch (err) { 
    setError(err.response?.data?.message || 'Could not load sessions'); 
  }
}
  async function revoke(id) { 
  try {
    await api.delete(`/auth/sessions/${id}`); 
        setSessions((items) => items.filter((s) => s._id !== id && s.id !== id)); 
  } catch (err) {
    setError(err.response?.data?.message || 'Could not revoke session');
  }
}
  return <div className="page-stack"><div className="page-heading"><div><h2>Profile Settings</h2><p>Manage security, sessions, language, and account preferences.</p></div></div>
    {error && <div className="form-error">{error}</div>}
    <div className="settings-grid"><section className="glass-panel panel"><Shield /><h3>Two-factor authentication</h3><p>Add an authenticator code to your login.</p><label className="toggle"><input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /><span /> Enable 2FA</label></section><section className="glass-panel panel"><Laptop /><h3>Active sessions</h3><p>Review devices and revoke sessions you do not recognize.</p><button className="button ghost" onClick={openSessions}>View sessions</button></section><section className="glass-panel panel"><KeyRound /><h3>Access keys</h3><p>Key rotation controls will appear here.</p><button className="button ghost" disabled>Unavailable</button></section><section className="glass-panel panel"><Languages /><h3>Language</h3><p>Change the dashboard navigation language.</p><select value={locale} onChange={(e) => dispatch(setLocale(e.target.value))}><option value="en">English</option><option value="hi">Hindi</option><option value="es">Spanish</option></select></section></div>
    {sessions && <Modal title="Active sessions" onClose={() => setSessions(null)}><div className="session-list">{sessions.map((session) => <article className="session-item" key={session._id}><div><strong>{session.deviceName || 'Browser session'}</strong><p>{session.ip || 'Private IP'} - {new Date(session.lastSeenAt || session.createdAt).toLocaleString()}</p><small>{session.revokedAt ? 'Revoked' : 'Active'}</small></div>{session.revokedAt ? null : <button className="icon-button danger" onClick={() => revoke(session._id)}><Trash2 size={16} /></button>}</article>)}</div></Modal>}
  </div>;
}