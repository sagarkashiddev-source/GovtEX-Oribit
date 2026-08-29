import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import OnboardingLayout from '../../components/OnboardingLayout';
import { ErrorBanner } from '../../components/States';

const EXAM_CATEGORIES = ['SSC', 'Banking', 'Railways', 'Defence', 'Police', 'Teaching'];

export default function OnboardingPreferences() {
  const { profile, refresh } = useAuth();
  const navigate = useNavigate();
  const phys = profile?.physical || {};
  const prefs = profile?.preferences || { preferred_categories: [] };

  const [physical, setPhysical] = useState({
    height_cm: phys.height_cm ?? '', weight_kg: phys.weight_kg ?? '', chest_cm: phys.chest_cm ?? '', vision: phys.vision || ''
  });
  const [categories, setCategories] = useState(prefs.preferred_categories || []);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const toggleCategory = (c) => {
    setCategories(list => list.includes(c) ? list.filter(x => x !== c) : [...list, c]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await api.put('/profile/physical', {
        height_cm: physical.height_cm !== '' ? Number(physical.height_cm) : null,
        weight_kg: physical.weight_kg !== '' ? Number(physical.weight_kg) : null,
        chest_cm: physical.chest_cm !== '' ? Number(physical.chest_cm) : null,
        vision: physical.vision
      });
      await api.put('/profile/preferences', { preferred_categories: categories, preferred_states: [] });
      await refresh();
      navigate('/dashboard');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const skip = async () => {
    await api.put('/profile/skip-onboarding', {});
    await refresh();
    navigate('/dashboard');
  };

  return (
    <OnboardingLayout step={3} total={3} title="Physical standards & preferences" subtitle="Needed for Police, Defence and other exams with physical criteria. Optional but recommended." onSkip={skip}>
      <ErrorBanner message={error} />
      <form onSubmit={submit}>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="height">Height (cm)</label>
            <input id="height" type="number" value={physical.height_cm} onChange={e => setPhysical(p => ({ ...p, height_cm: e.target.value }))} placeholder="172" />
          </div>
          <div className="field">
            <label htmlFor="weight">Weight (kg)</label>
            <input id="weight" type="number" value={physical.weight_kg} onChange={e => setPhysical(p => ({ ...p, weight_kg: e.target.value }))} placeholder="65" />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="chest">Chest (cm, if applicable)</label>
            <input id="chest" type="number" value={physical.chest_cm} onChange={e => setPhysical(p => ({ ...p, chest_cm: e.target.value }))} placeholder="84" />
          </div>
          <div className="field">
            <label htmlFor="vision">Vision</label>
            <input id="vision" value={physical.vision} onChange={e => setPhysical(p => ({ ...p, vision: e.target.value }))} placeholder="6/6" />
          </div>
        </div>

        <div className="field">
          <label>Which exam categories interest you most?</label>
          <div className="chip-group">
            {EXAM_CATEGORIES.map(c => (
              <button type="button" key={c} className={`chip ${categories.includes(c) ? 'active' : ''}`} onClick={() => toggleCategory(c)}>{c}</button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Finishing…' : 'Finish Setup'}</button>
      </form>
    </OnboardingLayout>
  );
}
