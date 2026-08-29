import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

export function EligibilityBadge({ status }) {
  const map = {
    eligible: { cls: 'badge-success', icon: 'check_circle', label: 'Eligible' },
    not_eligible: { cls: 'badge-error', icon: 'cancel', label: 'Not Eligible' },
    incomplete: { cls: 'badge-warning', icon: 'info', label: 'Check Profile' }
  };
  const m = map[status] || map.incomplete;
  return (
    <span className={`badge ${m.cls}`}>
      <Icon name={m.icon} size={14} /> {m.label}
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
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function ExamCard({ exam, eligibility, onSave, saved }) {
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
      <div className="flex items-center gap-xs mt-md" style={{ flexWrap: 'wrap' }}>
        {eligibility && <EligibilityBadge status={eligibility} />}
        {dl != null && (
          <span className="badge badge-neutral">
            <Icon name="schedule" size={14} /> {dl > 0 ? `${dl}d left to apply` : 'Applications closed'}
          </span>
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
