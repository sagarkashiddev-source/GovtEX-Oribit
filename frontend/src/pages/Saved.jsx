import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import { EligibilityBadge } from '../components/Widgets';
import { LoadingList, EmptyState } from '../components/States';

const TYPE_ICON = { exam: 'travel_explore', note: 'picture_as_pdf', video: 'play_circle' };
const TYPE_LABEL = { exam: 'Exam', note: 'Study Note', video: 'Video Lecture' };

function itemLink(item) {
  if (item.item_type === 'exam') return `/exams/${item.item_id}`;
  if (item.item_type === 'note') return `/library/notes/${item.item_id}`;
  return `/library/videos/${item.item_id}`;
}
function itemTitle(item) {
  return item.detail?.short_name || item.detail?.name || item.detail?.title || 'Untitled';
}

export default function Saved() {
  const [items, setItems] = useState(null);
  const [tab, setTab] = useState('all');

  const load = () => api.get('/saved').then(d => setItems(d.items));
  useEffect(() => { load(); }, []);

  const remove = async (item, e) => {
    e.preventDefault();
    await api.delete('/saved', { item_type: item.item_type, item_id: item.item_id });
    load();
  };

  const filtered = items ? (tab === 'all' ? items : items.filter(i => i.item_type === tab)) : null;

  return (
    <div className="app-shell with-desktop-nav">
      <BottomNav />
      <TopBar title="Saved Items" />
      <div className="page-container">
        <div className="chip-group mb-md">
          <button className={`chip ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All</button>
          <button className={`chip ${tab === 'exam' ? 'active' : ''}`} onClick={() => setTab('exam')}>Exams</button>
          <button className={`chip ${tab === 'note' ? 'active' : ''}`} onClick={() => setTab('note')}>Notes</button>
          <button className={`chip ${tab === 'video' ? 'active' : ''}`} onClick={() => setTab('video')}>Videos</button>
        </div>

        {!filtered ? <LoadingList count={4} height={70} /> : filtered.length === 0 ? (
          <EmptyState icon="bookmark_border" title="Nothing saved yet" description="Tap the bookmark icon on any exam, note or video to save it here." />
        ) : (
          <div className="flex-col gap-sm">
            {filtered.map(item => (
              <Link key={item.id} to={itemLink(item)} className="card flex items-center gap-sm">
                <Icon name={TYPE_ICON[item.item_type]} style={{ color: 'var(--secondary)' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{itemTitle(item)}</p>
                  <p className="text-xs text-muted mt-md" style={{ marginTop: 2 }}>{TYPE_LABEL[item.item_type]}</p>
                </div>
                <button onClick={(e) => remove(item, e)} style={{ background: 'none', border: 'none' }} aria-label="Remove">
                  <Icon name="close" style={{ color: 'var(--outline)' }} />
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
