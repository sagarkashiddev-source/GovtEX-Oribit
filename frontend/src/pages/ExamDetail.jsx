import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import { EligibilityBadge } from '../components/Widgets';
import { LoadingList, ErrorBanner } from '../components/States';

const CRITERIA_ICON = { pass: 'check_circle', fail: 'cancel', incomplete: 'info', unknown: 'help' };
const CRITERIA_COLOR = { pass: '#10b981', fail: '#ba1a1a', incomplete: '#d97706', unknown: '#75777d' };

function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ExamDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [application, setApplication] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.get(`/eligibility/${id}`).then(setData);
    api.get(`/saved/check?item_type=exam&item_id=${id}`).then(d => setSaved(d.saved));
    api.get('/applications').then(d => setApplication(d.applications.find(a => a.exam_id === id) || null));
  };

  useEffect(() => { load(); }, [id]);

  const toggleSave = async () => {
    if (saved) { await api.delete('/saved', { item_type: 'exam', item_id: id }); setSaved(false); }
    else { await api.post('/saved', { item_type: 'exam', item_id: id }); setSaved(true); }
  };

  const track = async (status) => {
    setBusy(true); setError('');
    try {
      if (!application) {
        const res = await api.post('/applications', { exam_id: id, status });
        setApplication(res.application);
      } else {
        const res = await api.put(`/applications/${application.id}`, { status });
        setApplication(res.application);
      }
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  if (!data) return (
    <div className="app-shell">
      <TopBar title="Exam Details" back />
      <div className="page-container"><LoadingList count={3} height={70} /></div>
    </div>
  );

  const { exam, overall, criteria } = data;

  return (
    <div className="app-shell">
      <TopBar
        title={exam.short_name}
        back
        right={<button onClick={toggleSave} style={{ background: 'none', border: 'none' }} aria-label="Save"><Icon name={saved ? 'bookmark' : 'bookmark_border'} style={{ color: saved ? 'var(--secondary)' : 'var(--outline)' }} /></button>}
      />
      <div className="page-container">
        <div style={{ borderLeft: `4px solid ${exam.accent_color}`, paddingLeft: 12, marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{exam.name}</h2>
          <p className="text-sm text-muted mt-md" style={{ marginTop: 4 }}>{exam.conducting_body}</p>
        </div>

        <div className="card mb-md">
          <div className="flex justify-between items-center mb-sm">
            <span style={{ fontWeight: 600 }}>Overall Eligibility</span>
            <EligibilityBadge status={overall} />
          </div>
          <p className="text-sm text-muted">{exam.description}</p>
        </div>

        <div className="grid-2 mb-md">
          <div className="card"><p className="text-xs text-muted">Application Window</p><p style={{ fontWeight: 600, fontSize: 14 }}>{fmtDate(exam.application_start)} – {fmtDate(exam.application_end)}</p></div>
          <div className="card"><p className="text-xs text-muted">Exam Date</p><p style={{ fontWeight: 600, fontSize: 14 }}>{fmtDate(exam.exam_date)}</p></div>
          <div className="card"><p className="text-xs text-muted">Vacancies</p><p style={{ fontWeight: 600, fontSize: 14 }}>{exam.vacancies || '—'}</p></div>
          <div className="card"><p className="text-xs text-muted">Fee (Gen / Reserved)</p><p style={{ fontWeight: 600, fontSize: 14 }}>₹{exam.fee_general} / ₹{exam.fee_reserved}</p></div>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Eligibility Breakdown</h3>
        <div className="flex-col gap-sm mb-lg">
          {criteria.map(c => (
            <div key={c.key} className="card flex gap-sm" style={{ alignItems: 'flex-start' }}>
              <Icon name={CRITERIA_ICON[c.status]} style={{ color: CRITERIA_COLOR[c.status], marginTop: 2 }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{c.label}</p>
                <p className="text-sm text-muted mt-md" style={{ marginTop: 2 }}>{c.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <ErrorBanner message={error} />

        <div className="flex-col gap-sm">
          {!application && (
            <button className="btn btn-primary btn-block" disabled={busy} onClick={() => track('draft')}>
              <Icon name="add_task" /> Add to My Tracker
            </button>
          )}
          {application && application.status !== 'applied' && (
            <button className="btn btn-primary btn-block" disabled={busy} onClick={() => track('applied')}>
              <Icon name="check" /> Mark as Applied
            </button>
          )}
          {application && (
            <p className="text-sm text-muted" style={{ textAlign: 'center' }}>
              Currently tracked as <strong>{application.status.replace('_', ' ')}</strong> — manage in the Tracker tab.
            </p>
          )}
          {exam.official_link && (
            <a href={exam.official_link} target="_blank" rel="noreferrer" className="btn btn-secondary btn-block">
              <Icon name="open_in_new" /> Visit Official Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
