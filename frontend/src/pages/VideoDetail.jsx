import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import { LoadingList } from '../components/States';

export default function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get(`/content/videos/${id}`).then(d => setVideo(d.video));
    api.get(`/saved/check?item_type=video&item_id=${id}`).then(d => setSaved(d.saved));
  }, [id]);

  const toggleSave = async () => {
    if (saved) { await api.delete('/saved', { item_type: 'video', item_id: id }); setSaved(false); }
    else { await api.post('/saved', { item_type: 'video', item_id: id }); setSaved(true); }
  };

  if (!video) return (
    <div className="app-shell"><TopBar title="Video" back /><div className="page-container"><LoadingList count={2} /></div></div>
  );

  return (
    <div className="app-shell">
      <TopBar
        title="Video Lecture"
        back
        right={<button onClick={toggleSave} style={{ background: 'none', border: 'none' }} aria-label="Save"><Icon name={saved ? 'bookmark' : 'bookmark_border'} style={{ color: saved ? 'var(--secondary)' : 'var(--outline)' }} /></button>}
      />
      <div
        style={{ height: 220, background: video.thumbnail_color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="play_arrow" size={32} style={{ color: '#fff' }} />
        </div>
      </div>
      <div className="page-container">
        <span className="badge badge-neutral mb-sm">{video.subject_name}</span>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>{video.title}</h2>
        <p className="text-sm text-muted mt-md" style={{ marginTop: 6 }}>Taught by {video.instructor}</p>
        <div className="flex gap-sm mt-md mb-lg">
          <span className="badge badge-neutral"><Icon name="schedule" size={14} /> {video.duration_min} min</span>
          <span className="badge badge-neutral"><Icon name="visibility" size={14} /> {video.views.toLocaleString('en-IN')} views</span>
        </div>
        <p className="text-sm" style={{ lineHeight: '22px' }}>{video.description}</p>
      </div>
    </div>
  );
}
