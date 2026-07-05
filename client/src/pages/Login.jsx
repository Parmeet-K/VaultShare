import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LockKeyhole } from 'lucide-react';
import { login } from '../store/slices/authSlice.js';

export function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '', totp: '' });

  async function submit(e) {
    e.preventDefault();
    try {
      await dispatch(login(form)).unwrap();
      navigate('/dashboard');
    } catch {
      // The Redux slice renders the API error below.
    }
  }

  return <main className="auth-page"><form className="auth-card glass-panel" onSubmit={submit}>
    <div className="brand"><span className="brand-mark"><LockKeyhole size={18} /></span><span>VaultShare</span></div>
    <h1>Welcome back</h1>
    <input required placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
    <input required placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
    <input placeholder="2FA code if enabled" value={form.totp} onChange={(e) => setForm({ ...form, totp: e.target.value })} />
    {error && <div className="form-error">{error}</div>}
    <button className="button primary" disabled={status === 'loading'}>{status === 'loading' ? 'Unlocking...' : 'Unlock vault'}</button>
    <p>No vault yet? <Link to="/register">Create one</Link></p>
  </form></main>;
}