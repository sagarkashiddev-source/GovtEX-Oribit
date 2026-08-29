import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import { LoadingList } from '../components/States';

export default function NoteDetail() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get(`/content/notes/${id}`).then(d => setNote(d.note));
    api.get(`/saved/check?item_type=note&item_id=${id}`).then(d => setSaved(d.saved));
  }, [id]);

  const toggleSave = async () => {
    if (saved) { await api.delete('/saved', { item_type: 'note', item_id: id }); setSaved(false); }
    else { await api.post('/saved', { item_type: 'note', item_id: id }); setSaved(true); }
  };

  if (!note) return (
    <div className="app-shell"><TopBar title="Note" back /><div className="page-container"><LoadingList count={2} /></div></div>
  );

  return (
    <div className="app-shell">
      <TopBar
        title="Study Note"
        back
        right={<button onClick={toggleSave} style={{ background: 'none', border: 'none' }} aria-label="Save"><Icon name={saved ? 'bookmark' : 'bookmark_border'} style={{ color: saved ? 'var(--secondary)' : 'var(--outline)' }} /></button>}
      />
      <div className="page-container">
        <span className="badge badge-neutral mb-sm" style={{ color: note.subject_color }}>{note.subject_name}</span>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>{note.title}</h2>
        <p className="text-sm text-muted mt-md" style={{ marginTop: 6, marginBottom: 16 }}>{note.description}</p>

        <div className="flex gap-sm mb-lg">
          <span className="badge badge-neutral"><Icon name="menu_book" size={14} /> {note.pages} pages</span>
          <span className="badge badge-neutral"><Icon name="download" size={14} /> {note.downloads.toLocaleString('en-IN')} downloads</span>
        </div>

        {note.pdf_url ? (
          <a href={note.pdf_url} download={note.pdf_original_name || undefined} className="btn btn-primary btn-block mb-lg">
            <Icon name="download" /> Download PDF
          </a>
        ) : (
          <div className="card mb-lg" style={{ background: 'var(--surface-container-low)', border: 'none', textAlign: 'center' }}>
            <Icon name="upload_file" style={{ color: 'var(--outline)' }} />
            <p className="text-sm text-muted mt-md" style={{ marginTop: 6 }}>A downloadable PDF hasn't been uploaded for this note yet.</p>
          </div>
        )}

        <div className="card" style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: '22px' }}>
          {note.content}
        </div>
      </div>
    </div>
  );
}
