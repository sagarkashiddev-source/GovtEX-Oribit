import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';
import BottomNav from '../components/BottomNav';
import Icon from '../components/Icon';
import { LoadingList } from '../components/States';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function fmtDate(d) {
  const parsed = new Date(d);
  if (isNaN(parsed)) return d;
  return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then(setData).catch(() => setData(null));
  }, []);

  const name = profile?.user?.name?.split(' ')[0] || 'there';

  if (!data) {
    return (
      <div className="app-shell with-desktop-nav">
        <BottomNav />
        <div className="page-container" style={{ paddingTop: 24 }}>
          <LoadingList count={3} height={100} />
        </div>
      </div>
    );
  }

  const { bestMatch, stats, upcomingDeadlines } = data;

  return (
    <div className="app-shell with-desktop-nav">
      <BottomNav />
      <div className="page-container" style={{ paddingTop: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>{greeting()}, {name} 👋</h1>
        <p className="text-sm text-muted mt-md" style={{ marginTop: 4, marginBottom: 20 }}>
          Ready for your next exam?
        </p>

        {/* One-line summary instead of a stat grid */}
        <p className="text-sm mb-lg" style={{ marginBottom: 20 }}>
          <strong>{stats.eligibleCount} exams</strong> match your profile
          {stats.deadlinesThisWeek > 0 && <> · <strong style={{ color: 'var(--error)' }}>{stats.deadlinesThisWeek} deadline{stats.deadlinesThisWeek > 1 ? 's' : ''} this week</strong></>}
        </p>

        {/* Hero: best match */}
        {bestMatch ? (
          <Link to={`/exams/${bestMatch.exam.id}`} className="card mb-lg" style={{ display: 'block', border: 'none', background: 'var(--primary)', color: '#fff' }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs" style={{ opacity: 0.7, marginBottom: 4 }}>TOP MATCH FOR YOU</p>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>{bestMatch.exam.short_name}</h2>
              </div>
              {bestMatch.matchPercent != null && (
                <span style={{ fontSize: 22, fontWeight: 700, color: '#8fa7fe' }}>{bestMatch.matchPercent}%</span>
              )}
            </div>
            <p className="text-sm mt-md" style={{ marginTop: 10, opacity: 0.85 }}>
              {bestMatch.daysLeft != null && bestMatch.daysLeft >= 0
                ? `Application closes in ${bestMatch.daysLeft} day${bestMatch.daysLeft === 1 ? '' : 's'}`
                : 'Check application window'}
            </p>
            <div className="flex items-center gap-xs mt-md" style={{ marginTop: 14, color: '#8fa7fe', fontWeight: 600, fontSize: 14 }}>
              View details <Icon name="arrow_forward" size={16} />
            </div>
          </Link>
        ) : (
          <div className="card mb-lg" style={{ textAlign: 'center' }}>
            <Icon name="explore" style={{ color: 'var(--outline)' }} />
            <p className="text-sm text-muted mt-md" style={{ marginTop: 8 }}>
              Complete your profile to see which exams you match.
            </p>
            <Link to="/profile" className="btn btn-primary btn-sm mt-md" style={{ marginTop: 12 }}>Complete profile</Link>
          </div>
        )}

        {/* Compact upcoming deadlines — only if there's more than just the hero exam */}
        {upcomingDeadlines.filter(d => d.exam.id !== bestMatch?.exam.id).length > 0 && (
          <>
            <div className="flex justify-between items-center mb-sm">
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Also worth a look</h3>
              <Link to="/eligibility" className="text-sm" style={{ color: 'var(--secondary)', fontWeight: 600 }}>See all</Link>
            </div>
            <div className="flex-col gap-sm mb-lg">
              {upcomingDeadlines.filter(d => d.exam.id !== bestMatch?.exam.id).slice(0, 3).map(d => (
                <Link key={d.exam.id} to={`/exams/${d.exam.id}`} className="card flex justify-between items-center" style={{ padding: '12px 16px' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{d.exam.short_name}</span>
                  <span className="text-xs text-muted">
                    {d.matchPercent != null ? `${d.matchPercent}% match · ` : ''}
                    {d.daysLeft != null && d.daysLeft >= 0 ? `${d.daysLeft}d left` : 'Check dates'}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}

        {stats.profileCompletion < 100 && (
          <Link to="/profile" className="card flex items-center gap-sm" style={{ background: 'var(--surface-container-low)', border: 'none' }}>
            <Icon name="person_add" style={{ color: 'var(--secondary)' }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Your profile is {stats.profileCompletion}% complete</p>
              <p className="text-xs text-muted">Add missing details for more accurate matches</p>
            </div>
            <Icon name="chevron_right" style={{ color: 'var(--outline)' }} />
          </Link>
        )}
      </div>
    </div>
  );
}
