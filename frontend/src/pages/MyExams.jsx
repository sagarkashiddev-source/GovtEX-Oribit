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
  const parsed = new Date(d);
  if (isNaN(parsed)) return d; // some real dates are text like "postponed"
  return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function ApplicationsTab() {
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
  const remove = async (app) => { await api.delete(`/applications/${app.id}`); load(); };

  if (!apps) return <LoadingList count={3} height={90} />;
  if (apps.length === 0) return (
    <EmptyState icon="assignment" title="No applications tracked" description="Add an exam from its detail page to follow it here." action={<Link to="/exams" className="btn btn-primary">Explore Exams</Link>} />
  );

  return (
    <div className="flex-col gap-sm">
      {apps.map(app => {
        const stageIdx = STAGES.findIndex(s => s.key === app.status);
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
              {next && <button className="btn btn-sm btn-primary" onClick={() => advance(app)}>Mark as {next.label}</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const TYPE_ICON = { exam: 'travel_explore', note: 'picture_as_pdf', video: 'play_circle' };
const TYPE_LABEL = { exam: 'Exam', note: 'Study Note', video: 'Video Lecture' };
function itemLink(item) {
  if (item.item_type === 'exam') return `/exams/${item.item_id}`;
  if (item.item_type === 'note') return `/library/notes/${item.item_id}`;
  return `/library/videos/${item.item_id}`;
}
function itemTitle(item) {
  return item.detail?.short_name || item.detail?.name || item.detail?.title || 'Untitled';
}

function SavedTab() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('all');
  const load = () => api.get('/saved').then(d => setItems(d.items));
  useEffect(() => { load(); }, []);

  const remove = async (item, e) => {
    e.preventDefault();
    await api.delete('/saved', { item_type: item.item_type, item_id: item.item_id });
    load();
  };

  const filtered = items ? (filter === 'all' ? items : items.filter(i => i.item_type === filter)) : null;

  return (
    <>
      <div className="chip-group mb-md">
        <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`chip ${filter === 'exam' ? 'active' : ''}`} onClick={() => setFilter('exam')}>Exams</button>
        <button className={`chip ${filter === 'note' ? 'active' : ''}`} onClick={() => setFilter('note')}>Notes</button>
        <button className={`chip ${filter === 'video' ? 'active' : ''}`} onClick={() => setFilter('video')}>Videos</button>
      </div>
      {!filtered ? <LoadingList count={3} height={70} /> : filtered.length === 0 ? (
        <EmptyState icon="bookmark_border" title="Nothing saved yet" description="Tap the bookmark icon on any exam, note or video to save it here." />
      ) : (
        <div className="flex-col gap-sm">
          {filtered.map(item => (
            <Link key={item.id} to={itemLink(item)} className="card flex items-center gap-sm">
              <Icon name={TYPE_ICON[item.item_type]} style={{ color: 'var(--secondary)' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 15 }}>{itemTitle(item)}</p>
                <p className="text-xs text-muted mt-md" style={{ marginTop: 2 }}>{TYPE_LABEL[item.item_type]}</p>
              </div>
              <button onClick={(e) => remove(item, e)} style={{ background: 'none', border: 'none' }} aria-label="Remove">
                <Icon name="close" style={{ color: 'var(--outline)' }} />
              </button>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default function MyExams() {
  const [tab, setTab] = useState('applications');
  return (
    <div className="app-shell with-desktop-nav">
      <BottomNav />
      <TopBar title="My Exams" />
      <div className="page-container">
        <div className="chip-group mb-md">
          <button className={`chip ${tab === 'applications' ? 'active' : ''}`} onClick={() => setTab('applications')}>Applications</button>
          <button className={`chip ${tab === 'saved' ? 'active' : ''}`} onClick={() => setTab('saved')}>Saved</button>
        </div>
        {tab === 'applications' ? <ApplicationsTab /> : <SavedTab />}
      </div>
    </div>
  );
}
