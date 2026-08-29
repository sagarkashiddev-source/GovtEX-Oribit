import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';
import BottomNav from '../components/BottomNav';
import Icon from '../components/Icon';
import { StatCard, EligibilityBadge, ProgressBar } from '../components/Widgets';
import { LoadingList, EmptyState } from '../components/States';

function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_LABEL = { draft: 'Draft', applied: 'Applied', admit_card: 'Admit Card', exam_taken: 'Exam Taken', result: 'Result Out' };

export default function Dashboard() {
  const { profile } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then(setData).catch(() => setData(null));
  }, []);

  const name = profile?.user?.name?.split(' ')[0] || 'there';

  return (
    <div className="app-shell with-desktop-nav">
      <BottomNav />
      <div className="page-container" style={{ paddingTop: 24 }}>
        <div className="flex items-center gap-sm mb-md">
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: profile?.user?.avatar_color || '#1E3A8A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
            {name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-muted">Welcome back,</p>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>{name}</h1>
          </div>
        </div>

        {!data ? <LoadingList count={2} height={100} /> : (
          <>
            {data.stats.profileCompletion < 100 && (
              <Link to="/profile" className="card mb-md" style={{ display: 'block', background: 'var(--surface-container-low)', border: 'none' }}>
                <div className="flex justify-between items-center mb-sm">
                  <span className="text-sm" style={{ fontWeight: 600 }}>Complete your profile</span>
                  <span className="text-sm" style={{ fontWeight: 600, color: 'var(--secondary)' }}>{data.stats.profileCompletion}%</span>
                </div>
                <ProgressBar value={data.stats.profileCompletion} />
                <p className="text-xs text-muted mt-md" style={{ marginTop: 8 }}>Add missing details for accurate eligibility results.</p>
              </Link>
            )}

            <div className="grid-2 mb-md">
              <StatCard icon="fact_check" value={data.stats.eligibleCount} label="Exams You're Eligible For" color="#10b981" />
              <StatCard icon="travel_explore" value={data.stats.totalExams} label="Exams Tracked in Orbit" />
              <StatCard icon="assignment" value={data.stats.applicationsInProgress} label="Applications In Progress" color="#d97706" />
              <StatCard icon="bookmark" value={data.stats.savedCount} label="Saved Items" />
            </div>

            <div className="flex justify-between items-center mb-sm mt-lg">
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Upcoming Deadlines</h3>
              <Link to="/exams" className="text-sm" style={{ color: 'var(--secondary)', fontWeight: 600 }}>See all</Link>
            </div>
            {data.upcomingDeadlines.length === 0 ? (
              <EmptyState icon="event_available" title="No upcoming deadlines" description="You're all caught up. Explore exams to find new opportunities." />
            ) : (
              <div className="flex-col gap-sm">
                {data.upcomingDeadlines.map(d => (
                  <Link key={d.exam.id} to={`/exams/${d.exam.id}`} className="card" style={{ borderLeft: `4px solid ${d.exam.accent_color}`, display: 'block' }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 15 }}>{d.exam.short_name}</p>
                        <p className="text-xs text-muted mt-md" style={{ marginTop: 2 }}>Apply by {fmtDate(d.exam.application_end)}</p>
                      </div>
                      <EligibilityBadge status={d.overall} />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center mb-sm mt-lg">
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Your Applications</h3>
              <Link to="/tracker" className="text-sm" style={{ color: 'var(--secondary)', fontWeight: 600 }}>Open tracker</Link>
            </div>
            {data.recentApplications.length === 0 ? (
              <EmptyState icon="assignment" title="Nothing tracked yet" description="Start tracking an exam application from the Explore tab." action={<Link to="/exams" className="btn btn-primary">Explore Exams</Link>} />
            ) : (
              <div className="flex-col gap-sm">
                {data.recentApplications.map(a => (
                  <div key={a.id} className="card flex justify-between items-center" style={{ borderLeft: `4px solid ${a.accent_color}` }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{a.exam_short_name}</span>
                    <span className="badge badge-neutral">{STATUS_LABEL[a.status]}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
