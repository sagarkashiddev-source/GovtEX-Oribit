import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import OnboardingLayout from '../../components/OnboardingLayout';
import { ErrorBanner } from '../../components/States';

const QUALIFICATIONS = ['10th', '12th', 'Diploma', 'Graduate', 'Post Graduate'];

export default function OnboardingEducation() {
  const { profile, refresh } = useAuth();
  const navigate = useNavigate();
  const edu = profile?.education || {};
  const [form, setForm] = useState({
    highest_qualification: edu.highest_qualification || '',
    stream: edu.stream || '',
    board_university: edu.board_university || '',
    year_of_passing: edu.year_of_passing || '',
    percentage: edu.percentage ?? ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await api.put('/profile/education', {
        ...form,
        year_of_passing: form.year_of_passing ? Number(form.year_of_passing) : null,
        percentage: form.percentage !== '' ? Number(form.percentage) : null
      });
      await refresh();
      navigate('/onboarding/preferences');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const skip = async () => {
    await api.put('/profile/skip-onboarding', {});
    await refresh();
    navigate('/dashboard');
  };

  return (
    <OnboardingLayout step={2} total={3} title="Your education details" subtitle="We use this to match you against each exam's minimum qualification." onSkip={skip}>
      <ErrorBanner message={error} />
      <form onSubmit={submit}>
        <div className="field">
          <label>Highest qualification</label>
          <div className="chip-group">
            {QUALIFICATIONS.map(q => (
              <button type="button" key={q} className={`chip ${form.highest_qualification === q ? 'active' : ''}`} onClick={() => set('highest_qualification', q)}>{q}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label htmlFor="stream">Stream / specialization</label>
          <input id="stream" value={form.stream} onChange={e => set('stream', e.target.value)} placeholder="e.g. B.Com, B.Tech, Arts" />
        </div>
        <div className="field">
          <label htmlFor="board">Board / University</label>
          <input id="board" value={form.board_university} onChange={e => set('board_university', e.target.value)} placeholder="e.g. Pune University" />
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="year">Year of passing</label>
            <input id="year" type="number" min="1980" max="2035" value={form.year_of_passing} onChange={e => set('year_of_passing', e.target.value)} placeholder="2024" />
          </div>
          <div className="field">
            <label htmlFor="pct">Percentage / CGPA</label>
            <input id="pct" type="number" min="0" max="100" step="0.01" value={form.percentage} onChange={e => set('percentage', e.target.value)} placeholder="72.5" />
          </div>
        </div>
        <button className="btn btn-primary btn-block" disabled={busy || !form.highest_qualification}>{busy ? 'Saving…' : 'Continue'}</button>
      </form>
    </OnboardingLayout>
  );
}
