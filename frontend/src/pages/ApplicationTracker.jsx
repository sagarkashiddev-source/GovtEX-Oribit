import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import { LoadingList, EmptyState } from '../components/States';

const STAGES = [
  { key: 'draft', label: 'Draft', icon: 'edit_note' },
  { key: 'applied', label: 'Applied', icon: 'send' },
  { key: 'admit_card', label: 'Admit Card', icon: 'badge' },
  { key: 'exam_taken', label: 'Exam Taken', icon: 'edit_calendar' },
  { key: 'result', label: 'Result Out', icon: 'emoji_events' }
];

function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function ApplicationTracker() {
  const [apps, setApps] = useState(null);

  const load = () => api.get('/applications').then(d => setApps(d.applications));
  useEffect(() => { load(); }, []);

  const advance = async (app) => {
    const idx = STAGES.findIndex(s => s.key === app.status);
    const next = STAGES[idx + 1];
    if (!next) return;
    await api.put(`/applications/${app.id}`, { status: next.key });
    load();
  };

  const remove = async (app) => {
    await api.delete(`/applications/${app.id}`);
    load();
  };

  return (
    <div className="app-shell with-desktop-nav">
      <BottomNav />
      <TopBar title="Application Tracker" />
      <div className="page-container">
        {!apps ? <LoadingList count={3} height={90} /> : apps.length === 0 ? (
          <EmptyState icon="assignment" title="No applications tracked" description="Add an exam to your tracker from its detail page to follow it here." action={<Link to="/exams" className="btn btn-primary">Explore Exams</Link>} />
        ) : (
          <div className="flex-col gap-sm">
            {apps.map(app => {
              const stageIdx = STAGES.findIndex(s => s.key === app.status);
              const stage = STAGES[stageIdx];
              const next = STAGES[stageIdx + 1];
              return (
                <div key={app.id} className="card" style={{ borderLeft: `4px solid ${app.accent_color}` }}>
                  <div className="flex justify-between items-center mb-sm">
                    <Link to={`/exams/${app.exam_id}`} style={{ fontWeight: 700, fontSize: 15 }}>{app.exam_short_name}</Link>
                    <button onClick={() => remove(app)} style={{ background: 'none', border: 'none' }} aria-label="Remove"><Icon name="delete_outline" style={{ color: 'var(--outline)' }} /></button>
                  </div>
                  <div className="flex items-center gap-xs" style={{ flexWrap: 'wrap', marginBottom: 10 }}>
                    {STAGES.map((s, i) => (
                      <React.Fragment key={s.key}>
                        <span className={`badge ${i <= stageIdx ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: 11 }}>
                          <Icon name={s.icon} size={12} /> {s.label}
                        </span>
                        {i < STAGES.length - 1 && <span style={{ color: 'var(--outline)' }}>›</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted">Exam date: {fmtDate(app.exam_date)}</span>
                    {next && (
                      <button className="btn btn-sm btn-primary" onClick={() => advance(app)}>
                        Mark as {next.label}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
