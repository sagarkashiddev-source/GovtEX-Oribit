import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import { LoadingList, EmptyState } from '../components/States';

export default function SubjectRepository() {
  const [subjects, setSubjects] = useState(null);

  useEffect(() => { api.get('/content/subjects').then(d => setSubjects(d.subjects)); }, []);

  return (
    <div className="app-shell with-desktop-nav">
      <BottomNav />
      <TopBar title="Study Library" />
      <div className="page-container">
        <div className="grid-2 mb-md">
          <Link to="/library/videos" className="card" style={{ textAlign: 'center' }}>
            <Icon name="play_circle" size={28} style={{ color: 'var(--secondary)' }} />
            <p style={{ fontWeight: 600, marginTop: 6, fontSize: 14 }}>Video Lectures</p>
          </Link>
          <Link to="/saved" className="card" style={{ textAlign: 'center' }}>
            <Icon name="bookmark" size={28} style={{ color: 'var(--secondary)' }} />
            <p style={{ fontWeight: 600, marginTop: 6, fontSize: 14 }}>Saved Items</p>
          </Link>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Subjects</h3>
        {!subjects ? <LoadingList count={4} height={70} /> : subjects.length === 0 ? (
          <EmptyState icon="menu_book" title="No subjects yet" />
        ) : (
          <div className="flex-col gap-sm">
            {subjects.map(s => (
              <Link key={s.id} to={`/library/subjects/${s.id}`} className="card flex items-center gap-sm" style={{ borderLeft: `4px solid ${s.color}` }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={s.icon} style={{ color: s.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</p>
                  <p className="text-xs text-muted mt-md" style={{ marginTop: 2 }}>{s.notes_count} notes · {s.videos_count} videos</p>
                </div>
                <Icon name="chevron_right" style={{ color: 'var(--outline)' }} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
