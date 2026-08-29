import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

export default function OnboardingLayout({ step, total, title, subtitle, children, onSkip }) {
  const navigate = useNavigate();
  return (
    <div className="app-shell">
      <div className="page-container" style={{ paddingTop: 32 }}>
        <div className="flex items-center justify-between mb-md">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <Icon name="arrow_back" />
          </button>
          {onSkip && <button className="btn-ghost" style={{ background: 'none', border: 'none', fontWeight: 600, fontSize: 14 }} onClick={onSkip}>Skip for now</button>}
        </div>
        <div className="progress-track mb-md">
          <div className="progress-fill" style={{ width: `${(step / total) * 100}%` }} />
        </div>
        <p className="text-xs text-muted mb-sm">Step {step} of {total}</p>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>{title}</h1>
        {subtitle && <p className="text-muted mt-md" style={{ marginBottom: 24 }}>{subtitle}</p>}
        <div className="mt-lg">{children}</div>
      </div>
    </div>
  );
}
