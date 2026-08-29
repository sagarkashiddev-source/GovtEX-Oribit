import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ErrorBanner } from '../components/States';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signup(name, email, password);
      navigate('/onboarding/basic');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="page-container" style={{ paddingTop: 64 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Create your account</h1>
        <p className="text-muted mt-md" style={{ marginBottom: 24 }}>Start checking your eligibility in minutes.</p>
        <ErrorBanner message={error} />
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Aarav Sharma" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating account…' : 'Create Account'}</button>
        </form>
        <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 20 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--secondary)', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
