import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import { LoadingList } from '../components/States';

function toYoutubeEmbed(url) {
  try {
    const u = new URL(url);
    let id = u.searchParams.get('v');
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1);
    if (u.pathname.startsWith('/embed/')) return url;
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch (e) {
    return url;
  }
}

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
      {video.youtube_url ? (
        <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
          <iframe
            src={toYoutubeEmbed(video.youtube_url)}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      ) : video.video_url ? (
        <video controls style={{ width: '100%', maxHeight: 260, background: '#000', display: 'block' }} src={video.video_url} />
      ) : (
        <div style={{ height: 220, background: video.thumbnail_color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="play_arrow" size={32} style={{ color: '#fff' }} />
          </div>
        </div>
      )}
      <div className="page-container">
        {!video.youtube_url && !video.video_url && (
          <div className="badge badge-warning mb-md" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px' }}>
            <Icon name="info" size={16} /> No video file has been uploaded for this lecture yet.
          </div>
        )}
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
