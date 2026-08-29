import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ErrorBanner } from '../components/States';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="page-container" style={{ paddingTop: 64 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Welcome back</h1>
        <p className="text-muted mt-md" style={{ marginBottom: 24 }}>Log in to continue tracking your exams.</p>
        <ErrorBanner message={error} />
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Logging in…' : 'Log In'}</button>
        </form>
        <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 20 }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--secondary)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
