import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import OnboardingLayout from '../../components/OnboardingLayout';
import { ErrorBanner } from '../../components/States';

const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const STATES = ['Maharashtra', 'Uttar Pradesh', 'Bihar', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Rajasthan', 'Gujarat', 'Madhya Pradesh', 'Other'];

export default function OnboardingBasic() {
  const { profile, refresh } = useAuth();
  const navigate = useNavigate();
  const u = profile?.user || {};
  const [form, setForm] = useState({
    phone: u.phone || '', dob: u.dob || '', gender: u.gender || '', category: u.category || 'General', state: u.state || ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await api.put('/profile/basic', form);
      await refresh();
      navigate('/onboarding/education');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const skip = async () => {
    await api.put('/profile/skip-onboarding', {});
    await refresh();
    navigate('/dashboard');
  };

  return (
    <OnboardingLayout step={1} total={3} title="Tell us about yourself" subtitle="This helps us check your age and category eligibility accurately." onSkip={skip}>
      <ErrorBanner message={error} />
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="phone">Phone number</label>
          <input id="phone" required value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="98765 43210" />
        </div>
        <div className="field">
          <label htmlFor="dob">Date of birth</label>
          <input id="dob" type="date" required value={form.dob} onChange={e => set('dob', e.target.value)} />
        </div>
        <div className="field">
          <label>Gender</label>
          <div className="chip-group">
            {['Male', 'Female', 'Other'].map(g => (
              <button type="button" key={g} className={`chip ${form.gender === g ? 'active' : ''}`} onClick={() => set('gender', g)}>{g}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Category</label>
          <div className="chip-group">
            {CATEGORIES.map(c => (
              <button type="button" key={c} className={`chip ${form.category === c ? 'active' : ''}`} onClick={() => set('category', c)}>{c}</button>
            ))}
          </div>
          <p className="field-hint">Used to apply age relaxation rules correctly.</p>
        </div>
        <div className="field">
          <label htmlFor="state">Home state</label>
          <select id="state" required value={form.state} onChange={e => set('state', e.target.value)}>
            <option value="" disabled>Select your state</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Saving…' : 'Continue'}</button>
      </form>
    </OnboardingLayout>
  );
}
