import React, { useEffect, useState } from 'react';
import Icon from '../components/Icon';

const ADMIN_KEY_STORAGE = 'govtex_admin_key';

async function adminFetch(path, options = {}) {
  const key = sessionStorage.getItem(ADMIN_KEY_STORAGE);
  const headers = { ...(options.headers || {}), 'x-admin-key': key };
  const res = await fetch(`/api/admin${path}`, { ...options, headers });
  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }
  if (!res.ok) throw new Error((data && data.error) || 'Request failed.');
  return data;
}

function KeyGate({ onUnlock }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
    try {
      await adminFetch('/notes');
      onUnlock();
    } catch (err) {
      sessionStorage.removeItem(ADMIN_KEY_STORAGE);
      setError('Incorrect admin key.');
    } finally { setBusy(false); }
  };

  return (
    <div className="app-shell">
      <div className="page-container" style={{ paddingTop: 64 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Content Admin</h1>
        <p className="text-muted mt-md" style={{ marginBottom: 20 }}>Enter your admin key to manage study notes and video lectures.</p>
        {error && <div className="badge badge-error mb-md" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px' }}>{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="key">Admin key</label>
            <input id="key" type="password" required value={key} onChange={e => setKey(e.target.value)} placeholder="Set via ADMIN_KEY env variable" />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Checking…' : 'Unlock'}</button>
        </form>
      </div>
    </div>
  );
}

function NoteRow({ note, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true); setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      await adminFetch(`/notes/${note.id}/pdf`, { method: 'POST', body: form });
      onChanged();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true); setError('');
    try { await adminFetch(`/notes/${note.id}/pdf`, { method: 'DELETE' }); onChanged(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="card mb-sm">
      <div className="flex justify-between items-center">
        <div>
          <p style={{ fontWeight: 600, fontSize: 14 }}>{note.title}</p>
          <p className="text-xs text-muted mt-md" style={{ marginTop: 2 }}>{note.subject_name}</p>
        </div>
        {note.pdf_path ? (
          <span className="badge badge-success"><Icon name="check_circle" size={13} /> PDF uploaded</span>
        ) : (
          <span className="badge badge-neutral">No PDF</span>
        )}
      </div>
      {error && <p className="field-error-text">{error}</p>}
      <div className="flex gap-sm mt-md" style={{ marginTop: 10 }}>
        <label className="btn btn-sm btn-secondary" style={{ cursor: 'pointer' }}>
          <Icon name="upload_file" size={16} /> {busy ? 'Uploading…' : note.pdf_path ? 'Replace PDF' : 'Upload PDF'}
          <input type="file" accept="application/pdf" onChange={upload} disabled={busy} style={{ display: 'none' }} />
        </label>
        {note.pdf_path && (
          <button className="btn btn-sm btn-secondary" onClick={remove} disabled={busy} style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
            <Icon name="delete_outline" size={16} /> Remove
          </button>
        )}
      </div>
    </div>
  );
}

function VideoRow({ video, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ytInput, setYtInput] = useState(video.youtube_url || '');

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true); setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      await adminFetch(`/videos/${video.id}/file`, { method: 'POST', body: form });
      onChanged();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const saveYoutube = async () => {
    setBusy(true); setError('');
    try {
      await adminFetch(`/videos/${video.id}/youtube`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ youtube_url: ytInput }) });
      onChanged();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true); setError('');
    try { await adminFetch(`/videos/${video.id}/media`, { method: 'DELETE' }); setYtInput(''); onChanged(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const hasMedia = video.video_path || video.youtube_url;

  return (
    <div className="card mb-sm">
      <div className="flex justify-between items-center mb-sm">
        <div>
          <p style={{ fontWeight: 600, fontSize: 14 }}>{video.title}</p>
          <p className="text-xs text-muted mt-md" style={{ marginTop: 2 }}>{video.subject_name}</p>
        </div>
        {video.video_path ? (
          <span className="badge badge-success"><Icon name="check_circle" size={13} /> File uploaded</span>
        ) : video.youtube_url ? (
          <span className="badge badge-success"><Icon name="check_circle" size={13} /> YouTube linked</span>
        ) : (
          <span className="badge badge-neutral">No media</span>
        )}
      </div>
      {error && <p className="field-error-text">{error}</p>}

      <div className="field" style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 12 }}>YouTube URL</label>
        <div className="flex gap-sm">
          <input value={ytInput} onChange={e => setYtInput(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" style={{ flex: 1 }} />
          <button className="btn btn-sm btn-primary" onClick={saveYoutube} disabled={busy || !ytInput}>Save</button>
        </div>
      </div>

      <div className="flex gap-sm items-center">
        <label className="btn btn-sm btn-secondary" style={{ cursor: 'pointer' }}>
          <Icon name="upload_file" size={16} /> {busy ? 'Uploading…' : 'Upload video file'}
          <input type="file" accept="video/*" onChange={uploadFile} disabled={busy} style={{ display: 'none' }} />
        </label>
        {hasMedia && (
          <button className="btn btn-sm btn-secondary" onClick={remove} disabled={busy} style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
            <Icon name="delete_outline" size={16} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminContent() {
  const [unlocked, setUnlocked] = useState(!!sessionStorage.getItem(ADMIN_KEY_STORAGE));
  const [tab, setTab] = useState('notes');
  const [notes, setNotes] = useState(null);
  const [videos, setVideos] = useState(null);

  const load = () => {
    adminFetch('/notes').then(d => setNotes(d.notes)).catch(() => setUnlocked(false));
    adminFetch('/videos').then(d => setVideos(d.videos)).catch(() => setUnlocked(false));
  };

  useEffect(() => { if (unlocked) load(); }, [unlocked]);

  if (!unlocked) return <KeyGate onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="app-shell">
      <div className="page-container" style={{ paddingTop: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Content Admin</h1>
        <p className="text-sm text-muted mb-md">Upload real PDFs and videos for your study library.</p>
        <div className="chip-group mb-md">
          <button className={`chip ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>Study Notes ({notes?.length ?? '…'})</button>
          <button className={`chip ${tab === 'videos' ? 'active' : ''}`} onClick={() => setTab('videos')}>Video Lectures ({videos?.length ?? '…'})</button>
        </div>

        {tab === 'notes' && (notes ? notes.map(n => <NoteRow key={n.id} note={n} onChanged={load} />) : <p className="text-muted">Loading…</p>)}
        {tab === 'videos' && (videos ? videos.map(v => <VideoRow key={v.id} video={v} onChanged={load} />) : <p className="text-muted">Loading…</p>)}
      </div>
    </div>
  );
}
