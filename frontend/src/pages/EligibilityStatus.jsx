import React, { useEffect, useState } from 'react';
import { api } from '../api';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import { ExamCard } from '../components/Widgets';
import { LoadingList, EmptyState } from '../components/States';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'eligible', label: 'Eligible' },
  { key: 'not_eligible', label: 'Not Eligible' },
  { key: 'incomplete', label: 'Check Profile' }
];

export default function EligibilityStatus() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { api.get('/eligibility').then(setData); }, []);

  const results = data ? (filter === 'all' ? data.results : data.results.filter(r => r.overall === filter)) : null;

  return (
    <div className="app-shell with-desktop-nav">
      <BottomNav />
      <TopBar title="My Eligibility Status" />
      <div className="page-container">
        {data && (
          <div className="grid-2 mb-md" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>{data.summary.eligible}</div>
              <div className="text-xs text-muted">Eligible</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#ba1a1a' }}>{data.summary.not_eligible}</div>
              <div className="text-xs text-muted">Not Eligible</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#d97706' }}>{data.summary.incomplete}</div>
              <div className="text-xs text-muted">Check Profile</div>
            </div>
          </div>
        )}

        <div className="chip-group mb-md">
          {FILTERS.map(f => (
            <button key={f.key} className={`chip ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>

        {!results ? <LoadingList count={4} /> : results.length === 0 ? (
          <EmptyState icon="fact_check" title="Nothing here yet" description="Try a different filter." />
        ) : (
          <div className="flex-col gap-sm">
            {results.map(r => <ExamCard key={r.exam.id} exam={r.exam} eligibility={r.overall} matchPercent={r.matchPercent} />)}
          </div>
        )}
      </div>
    </div>
  );
}
