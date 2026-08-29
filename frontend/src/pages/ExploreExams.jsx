import React, { useEffect, useState } from 'react';
import { api } from '../api';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import { ExamCard } from '../components/Widgets';
import { LoadingList, EmptyState } from '../components/States';

export default function ExploreExams() {
  const [exams, setExams] = useState(null);
  const [eligMap, setEligMap] = useState({});
  const [savedSet, setSavedSet] = useState(new Set());
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    api.get('/exams/categories').then(d => setCategories(d.categories));
    api.get('/eligibility').then(d => {
      const map = {};
      d.results.forEach(r => { map[r.exam.id] = r.overall; });
      setEligMap(map);
    });
    api.get('/saved?type=exam').then(d => setSavedSet(new Set(d.items.map(i => i.item_id))));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (q) params.set('q', q);
    api.get(`/exams?${params.toString()}`).then(d => setExams(d.exams));
  }, [category, q]);

  const toggleSave = async (examId) => {
    if (savedSet.has(examId)) {
      await api.delete('/saved', { item_type: 'exam', item_id: examId });
      setSavedSet(s => { const n = new Set(s); n.delete(examId); return n; });
    } else {
      await api.post('/saved', { item_type: 'exam', item_id: examId });
      setSavedSet(s => new Set(s).add(examId));
    }
  };

  return (
    <div className="app-shell with-desktop-nav">
      <BottomNav />
      <TopBar title="Explore Exams" />
      <div className="page-container">
        <div className="field" style={{ marginBottom: 12 }}>
          <div style={{ position: 'relative' }}>
            <Icon name="search" style={{ position: 'absolute', left: 14, top: 14, color: 'var(--outline)' }} />
            <input style={{ paddingLeft: 40 }} value={q} onChange={e => setQ(e.target.value)} placeholder="Search exams by name…" />
          </div>
        </div>
        <div className="chip-group mb-md">
          <button className={`chip ${category === '' ? 'active' : ''}`} onClick={() => setCategory('')}>All</button>
          {categories.map(c => (
            <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>

        {exams === null ? <LoadingList count={4} /> : exams.length === 0 ? (
          <EmptyState icon="search_off" title="No exams found" description="Try a different search term or category." />
        ) : (
          <div className="flex-col gap-sm">
            {exams.map(exam => (
              <ExamCard key={exam.id} exam={exam} eligibility={eligMap[exam.id]} onSave={toggleSave} saved={savedSet.has(exam.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
