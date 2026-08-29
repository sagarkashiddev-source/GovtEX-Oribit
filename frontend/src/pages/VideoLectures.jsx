import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import { LoadingList, EmptyState } from '../components/States';

export default function VideoLectures() {
  const [videos, setVideos] = useState(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    api.get(`/content/videos?${params.toString()}`).then(d => setVideos(d.videos));
  }, [q]);

  return (
    <div className="app-shell">
      <TopBar title="Video Lectures" back />
      <div className="page-container">
        <div className="field" style={{ marginBottom: 12 }}>
          <div style={{ position: 'relative' }}>
            <Icon name="search" style={{ position: 'absolute', left: 14, top: 14, color: 'var(--outline)' }} />
            <input style={{ paddingLeft: 40 }} value={q} onChange={e => setQ(e.target.value)} placeholder="Search video lectures…" />
          </div>
        </div>
        {!videos ? <LoadingList count={4} height={80} /> : videos.length === 0 ? (
          <EmptyState icon="video_library" title="No videos found" />
        ) : (
          <div className="flex-col gap-sm">
            {videos.map(v => (
              <Link key={v.id} to={`/library/videos/${v.id}`} className="card flex items-center gap-sm">
                <div style={{ width: 64, height: 48, borderRadius: 8, background: v.thumbnail_color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="play_arrow" style={{ color: '#fff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{v.title}</p>
                  <p className="text-xs text-muted mt-md" style={{ marginTop: 2 }}>{v.subject_name} · {v.instructor}</p>
                  <p className="text-xs text-muted">{v.duration_min} min · {v.views.toLocaleString('en-IN')} views</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
