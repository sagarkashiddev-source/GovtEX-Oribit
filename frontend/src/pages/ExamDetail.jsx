import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import Collapsible from '../components/Collapsible';
import { LoadingList, ErrorBanner } from '../components/States';

const CRITERIA_ICON = { pass: 'check_circle', fail: 'cancel', incomplete: 'info', unknown: 'help' };
const CRITERIA_COLOR = { pass: '#10b981', fail: '#ba1a1a', incomplete: '#d97706', unknown: '#75777d' };

function fmtDate(d) {
  if (!d) return '—';
  const parsed = new Date(d);
  if (isNaN(parsed)) return d; // some real dates are text, e.g. "postponed, TBA"
  return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysLeft(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
}

function overallLabel(overall) {
  if (overall === 'eligible') return { text: 'Eligible', color: 'var(--success)', icon: 'check_circle' };
  if (overall === 'not_eligible') return { text: 'Not eligible', color: 'var(--error)', icon: 'cancel' };
  return { text: 'Check your profile', color: 'var(--warning)', icon: 'info' };
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

  const { exam, overall, matchPercent, criteria } = data;
  const status = overallLabel(overall);
  const dl = daysLeft(exam.application_end);
  let stages = [];
  try { stages = JSON.parse(exam.selection_stages || '[]'); } catch (e) { /* noop */ }

  return (
    <div className="app-shell">
      <TopBar
        title={exam.short_name}
        back
        right={<button onClick={toggleSave} style={{ background: 'none', border: 'none' }} aria-label="Save"><Icon name={saved ? 'bookmark' : 'bookmark_border'} style={{ color: saved ? 'var(--secondary)' : 'var(--outline)' }} /></button>}
      />
      <div className="page-container">
        <p className="text-sm text-muted mb-sm">{exam.conducting_body}</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{exam.name}</h2>

        {/* Inline match line instead of a big colored box */}
        <div className="flex items-center gap-xs mb-sm" style={{ fontSize: 14 }}>
          {matchPercent != null && <strong style={{ fontSize: 16 }}>{matchPercent}% match</strong>}
          <span style={{ color: 'var(--outline)' }}>·</span>
          <span style={{ color: status.color, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name={status.icon} size={16} /> {status.text}
          </span>
        </div>

        {dl != null && (
          <p className="text-sm mb-md" style={{ marginBottom: 12 }}>
            {dl >= 0
              ? <>Application closes in <strong>{dl} day{dl === 1 ? '' : 's'}</strong> ({fmtDate(exam.application_end)})</>
              : <span className="text-muted">Application window closed on {fmtDate(exam.application_end)}</span>}
          </p>
        )}

        {exam.data_source === 'verified' ? (
          <div className="flex items-center gap-xs mb-lg" style={{ fontSize: 12, color: 'var(--success-text)' }}>
            <Icon name="verified" size={14} /> Verified from official notification · Last checked {fmtDate(exam.verified_at)}
          </div>
        ) : (
          <div className="flex items-center gap-xs mb-lg" style={{ fontSize: 12, color: 'var(--warning-text)' }}>
            <Icon name="info" size={14} /> Illustrative data — always confirm against the official notification before applying
          </div>
        )}

        <ErrorBanner message={error} />

        {/* Primary action up top, near the decision-relevant info */}
        <div className="flex-col gap-sm mb-lg">
          {!application && (
            <button className="btn btn-primary btn-block" disabled={busy} onClick={() => track('draft')}>
              <Icon name="add_task" /> Track this exam
            </button>
          )}
          {application && application.status !== 'applied' && (
            <button className="btn btn-primary btn-block" disabled={busy} onClick={() => track('applied')}>
              <Icon name="check" /> Mark as Applied
            </button>
          )}
          {application && (
            <p className="text-sm text-muted" style={{ textAlign: 'center' }}>
              Currently tracked as <strong>{application.status.replace('_', ' ')}</strong> — manage in My Exams.
            </p>
          )}
          {exam.official_link && (
            <a href={exam.official_link} target="_blank" rel="noreferrer" className="btn btn-secondary btn-block">
              <Icon name="open_in_new" /> Visit Official Website
            </a>
          )}
        </div>

        {/* Progressive disclosure: only "why eligible" is open by default */}
        <Collapsible title="Why you're eligible" icon="fact_check" defaultOpen>
          <div className="flex-col gap-sm">
            {criteria.map(c => (
              <div key={c.key} className="flex gap-sm" style={{ alignItems: 'flex-start' }}>
                <Icon name={CRITERIA_ICON[c.status]} style={{ color: CRITERIA_COLOR[c.status], marginTop: 2 }} size={18} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{c.label}</p>
                  <p className="text-sm text-muted mt-md" style={{ marginTop: 2 }}>{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Collapsible>

        <Collapsible title="Dates & Fee" icon="event">
          <div className="flex-col gap-sm">
            <Row label="Notification released" value={fmtDate(exam.notification_date)} />
            <Row label="Application window" value={`${fmtDate(exam.application_start)} – ${fmtDate(exam.application_end)}`} />
            {exam.correction_window && <Row label="Correction window" value={exam.correction_window} />}
            <Row label="Exam date" value={fmtDate(exam.exam_date)} />
            {exam.admit_card_date && <Row label="Admit card" value={exam.admit_card_date} />}
            {exam.result_date && <Row label="Result" value={fmtDate(exam.result_date)} />}
            <Row label="Vacancies" value={exam.vacancies || 'Not specified'} />
            <Row label="Fee (General / Reserved)" value={`₹${exam.fee_general} / ₹${exam.fee_reserved}`} />
          </div>
        </Collapsible>

        {stages.length > 0 && (
          <Collapsible title="Selection Process" icon="checklist">
            <div className="flex-col gap-sm">
              {stages.map((s, i) => (
                <div key={i} className="flex items-center gap-sm">
                  <span className="badge badge-neutral" style={{ minWidth: 24, justifyContent: 'center' }}>{i + 1}</span>
                  <span className="text-sm">{s}</span>
                </div>
              ))}
            </div>
          </Collapsible>
        )}

        {exam.notification_url && (
          <Collapsible title="Official Notification" icon="description">
            <a href={exam.notification_url} target="_blank" rel="noreferrer" className="text-sm" style={{ color: 'var(--secondary)', fontWeight: 600 }}>
              {exam.notification_url} <Icon name="open_in_new" size={14} />
            </a>
          </Collapsible>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between" style={{ gap: 12 }}>
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm" style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
