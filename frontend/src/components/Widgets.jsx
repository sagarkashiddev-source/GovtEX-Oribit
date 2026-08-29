import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

const STATUS_TEXT = {
  eligible: { text: 'Eligible', color: 'var(--success-text)', icon: 'check_circle' },
  not_eligible: { text: 'Not eligible', color: 'var(--error-text)', icon: 'cancel' },
  incomplete: { text: 'Check profile', color: 'var(--warning-text)', icon: 'info' }
};

export function EligibilityBadge({ status }) {
  const m = STATUS_TEXT[status] || STATUS_TEXT.incomplete;
  return (
    <span className="text-sm" style={{ color: m.color, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Icon name={m.icon} size={15} /> {m.text}
    </span>
  );
}

export function ProgressBar({ value }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function daysLeft(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const diff = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function ExamCard({ exam, eligibility, matchPercent, onSave, saved }) {
  const navigate = useNavigate();
  const dl = daysLeft(exam.application_end);
  return (
    <div
      className="card card-hover"
      style={{ borderLeft: `4px solid ${exam.accent_color || '#1E3A8A'}`, cursor: 'pointer' }}
      onClick={() => navigate(`/exams/${exam.id}`)}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>{exam.short_name || exam.name}</h3>
          <p className="text-sm text-muted mt-md" style={{ marginTop: 4 }}>{exam.conducting_body}</p>
        </div>
        {onSave && (
          <button
            className="btn-ghost"
            style={{ background: 'none', border: 'none' }}
            onClick={(e) => { e.stopPropagation(); onSave(exam.id); }}
            aria-label="Save exam"
          >
            <Icon name={saved ? 'bookmark' : 'bookmark_border'} style={{ color: saved ? '#1E3A8A' : '#75777d' }} />
          </button>
        )}
      </div>
      <div className="flex items-center gap-xs mt-md text-sm" style={{ flexWrap: 'wrap', marginTop: 8 }}>
        {matchPercent != null && <strong>{matchPercent}% match</strong>}
        {matchPercent != null && eligibility && <span style={{ color: 'var(--outline)' }}>·</span>}
        {eligibility && <EligibilityBadge status={eligibility} />}
        {dl != null && (
          <>
            <span style={{ color: 'var(--outline)' }}>·</span>
            <span className="text-muted">{dl >= 0 ? `${dl}d left to apply` : 'Applications closed'}</span>
          </>
        )}
      </div>
    </div>
  );
}

export function StatCard({ icon, value, label, color = 'var(--secondary)' }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <Icon name={icon} size={22} style={{ color }} />
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
