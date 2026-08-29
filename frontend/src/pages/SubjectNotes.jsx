import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import { LoadingList, EmptyState } from '../components/States';

export default function SubjectNotes() {
  const { id } = useParams();
  const [notes, setNotes] = useState(null);
  const [videos, setVideos] = useState(null);
  const [tab, setTab] = useState('notes');

  useEffect(() => {
    api.get(`/content/subjects/${id}/notes`).then(d => setNotes(d.notes));
    api.get(`/content/subjects/${id}/videos`).then(d => setVideos(d.videos));
  }, [id]);

  return (
    <div className="app-shell">
      <TopBar title="Subject Notes" back />
      <div className="page-container">
        <div className="chip-group mb-md">
          <button className={`chip ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>Study Notes</button>
          <button className={`chip ${tab === 'videos' ? 'active' : ''}`} onClick={() => setTab('videos')}>Video Lectures</button>
        </div>

        {tab === 'notes' && (
          !notes ? <LoadingList count={4} height={70} /> : notes.length === 0 ? (
            <EmptyState icon="description" title="No notes yet" description="Notes for this subject are coming soon." />
          ) : (
            <div className="flex-col gap-sm">
              {notes.map(n => (
                <Link key={n.id} to={`/library/notes/${n.id}`} className="card flex items-center gap-sm">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--error-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="picture_as_pdf" style={{ color: '#ba1a1a' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>{n.title}</p>
                    <p className="text-xs text-muted mt-md" style={{ marginTop: 2 }}>{n.pages} pages · {n.downloads.toLocaleString('en-IN')} downloads</p>
                  </div>
                  <Icon name="chevron_right" style={{ color: 'var(--outline)' }} />
                </Link>
              ))}
            </div>
          )
        )}

        {tab === 'videos' && (
          !videos ? <LoadingList count={4} height={70} /> : videos.length === 0 ? (
            <EmptyState icon="play_circle" title="No videos yet" />
          ) : (
            <div className="flex-col gap-sm">
              {videos.map(v => (
                <Link key={v.id} to={`/library/videos/${v.id}`} className="card flex items-center gap-sm">
                  <div style={{ width: 56, height: 40, borderRadius: 8, background: v.thumbnail_color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="play_arrow" style={{ color: '#fff' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>{v.title}</p>
                    <p className="text-xs text-muted mt-md" style={{ marginTop: 2 }}>{v.instructor} · {v.duration_min} min</p>
                  </div>
                  <Icon name="chevron_right" style={{ color: 'var(--outline)' }} />
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
