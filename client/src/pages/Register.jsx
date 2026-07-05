import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../store/slices/authSlice.js';

export function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  async function submit(e) {
    e.preventDefault();
    try {
      await dispatch(register(form)).unwrap();
      navigate('/login');
    } catch {
      // The Redux slice renders the API error below.
    }
  }

  return <main className="auth-page"><form className="auth-card glass-panel" onSubmit={submit}>
    <h1>Create VaultShare</h1>
    <input required minLength={2} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
    <input required placeholder="Work email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
    <input required minLength={8} placeholder="Strong password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
    <p className="field-hint">Password needs uppercase, lowercase, number, and symbol. Example: <strong>DemoPass#12345</strong></p>
    {error && <div className="form-error">{error}</div>}
    <button className="button primary" disabled={status === 'loading'}>{status === 'loading' ? 'Creating vault...' : 'Create encrypted workspace'}</button>
    <p>Already registered? <Link to="/login">Sign in</Link></p>
  </form></main>;
}