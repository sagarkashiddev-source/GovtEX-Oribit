import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import { ErrorBanner } from '../components/States';

const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const QUALIFICATIONS = ['10th', '12th', 'Diploma', 'Graduate', 'Post Graduate'];

function Section({ title, children }) {
  return (
    <div className="card mb-md">
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{title}</h3>
      {children}
    </div>
  );
}

export default function Profile() {
  const { profile, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const u = profile?.user || {};
  const edu = profile?.education || {};
  const phys = profile?.physical || {};

  const [basic, setBasic] = useState({ name: u.name || '', phone: u.phone || '', dob: u.dob || '', gender: u.gender || '', category: u.category || 'General', state: u.state || '' });
  const [education, setEducation] = useState({ highest_qualification: edu.highest_qualification || '', stream: edu.stream || '', board_university: edu.board_university || '', year_of_passing: edu.year_of_passing || '', percentage: edu.percentage ?? '' });
  const [physical, setPhysical] = useState({ height_cm: phys.height_cm ?? '', weight_kg: phys.weight_kg ?? '', chest_cm: phys.chest_cm ?? '', vision: phys.vision || '' });
  const [error, setError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const saveAll = async () => {
    setBusy(true); setError(''); setSavedMsg('');
    try {
      await api.put('/profile/basic', basic);
      await api.put('/profile/education', {
        ...education,
        year_of_passing: education.year_of_passing ? Number(education.year_of_passing) : null,
        percentage: education.percentage !== '' ? Number(education.percentage) : null
      });
      await api.put('/profile/physical', {
        height_cm: physical.height_cm !== '' ? Number(physical.height_cm) : null,
        weight_kg: physical.weight_kg !== '' ? Number(physical.weight_kg) : null,
        chest_cm: physical.chest_cm !== '' ? Number(physical.chest_cm) : null,
        vision: physical.vision
      });
      await refresh();
      setSavedMsg('Profile updated successfully.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const doLogout = () => { logout(); navigate('/'); };

  return (
    <div className="app-shell with-desktop-nav">
      <BottomNav />
      <TopBar title="Profile & Settings" />
      <div className="page-container">
        <div className="flex items-center gap-sm mb-lg">
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: u.avatar_color || '#1E3A8A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>
            {(u.name || '?')[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{u.name}</h2>
            <p className="text-sm text-muted">{u.email}</p>
          </div>
        </div>

        <ErrorBanner message={error} />
        {savedMsg && <div className="badge badge-success" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', marginBottom: 16 }}><Icon name="check_circle" size={16} /> {savedMsg}</div>}

        <Section title="Basic Details">
          <div className="field"><label>Full name</label><input value={basic.name} onChange={e => setBasic(b => ({ ...b, name: e.target.value }))} /></div>
          <div className="field"><label>Phone</label><input value={basic.phone} onChange={e => setBasic(b => ({ ...b, phone: e.target.value }))} /></div>
          <div className="field"><label>Date of birth</label><input type="date" value={basic.dob} onChange={e => setBasic(b => ({ ...b, dob: e.target.value }))} /></div>
          <div className="field">
            <label>Gender</label>
            <div className="chip-group">
              {['Male', 'Female', 'Other'].map(g => <button type="button" key={g} className={`chip ${basic.gender === g ? 'active' : ''}`} onClick={() => setBasic(b => ({ ...b, gender: g }))}>{g}</button>)}
            </div>
          </div>
          <div className="field">
            <label>Category</label>
            <div className="chip-group">
              {CATEGORIES.map(c => <button type="button" key={c} className={`chip ${basic.category === c ? 'active' : ''}`} onClick={() => setBasic(b => ({ ...b, category: c }))}>{c}</button>)}
            </div>
          </div>
          <div className="field"><label>State</label><input value={basic.state} onChange={e => setBasic(b => ({ ...b, state: e.target.value }))} /></div>
        </Section>

        <Section title="Education Details">
          <div className="field">
            <label>Highest qualification</label>
            <div className="chip-group">
              {QUALIFICATIONS.map(q => <button type="button" key={q} className={`chip ${education.highest_qualification === q ? 'active' : ''}`} onClick={() => setEducation(e => ({ ...e, highest_qualification: q }))}>{q}</button>)}
            </div>
          </div>
          <div className="field"><label>Stream</label><input value={education.stream} onChange={e => setEducation(x => ({ ...x, stream: e.target.value }))} /></div>
          <div className="field"><label>Board / University</label><input value={education.board_university} onChange={e => setEducation(x => ({ ...x, board_university: e.target.value }))} /></div>
          <div className="grid-2">
            <div className="field"><label>Year of passing</label><input type="number" value={education.year_of_passing} onChange={e => setEducation(x => ({ ...x, year_of_passing: e.target.value }))} /></div>
            <div className="field"><label>Percentage</label><input type="number" value={education.percentage} onChange={e => setEducation(x => ({ ...x, percentage: e.target.value }))} /></div>
          </div>
        </Section>

        <Section title="Physical Profile">
          <div className="grid-2">
            <div className="field"><label>Height (cm)</label><input type="number" value={physical.height_cm} onChange={e => setPhysical(p => ({ ...p, height_cm: e.target.value }))} /></div>
            <div className="field"><label>Weight (kg)</label><input type="number" value={physical.weight_kg} onChange={e => setPhysical(p => ({ ...p, weight_kg: e.target.value }))} /></div>
          </div>
          <div className="grid-2">
            <div className="field"><label>Chest (cm)</label><input type="number" value={physical.chest_cm} onChange={e => setPhysical(p => ({ ...p, chest_cm: e.target.value }))} /></div>
            <div className="field"><label>Vision</label><input value={physical.vision} onChange={e => setPhysical(p => ({ ...p, vision: e.target.value }))} /></div>
          </div>
        </Section>

        <button className="btn btn-primary btn-block mb-md" disabled={busy} onClick={saveAll}>{busy ? 'Saving…' : 'Save Changes'}</button>
        <button className="btn btn-secondary btn-block" onClick={doLogout}><Icon name="logout" /> Log Out</button>
      </div>
    </div>
  );
}
