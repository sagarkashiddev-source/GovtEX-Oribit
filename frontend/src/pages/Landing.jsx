import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

const FEATURES = [
  { icon: 'fact_check', title: 'Instant Eligibility Checks', desc: 'See exactly which government exams you qualify for, based on your age, education and category.' },
  { icon: 'assignment', title: 'Application Tracker', desc: 'Track every exam from draft to result in one organized board.' },
  { icon: 'menu_book', title: 'Study Library', desc: 'Subject-wise notes and video lectures built for competitive exam prep.' }
];

export default function Landing() {
  return (
    <div className="app-shell" style={{ paddingBottom: 0 }}>
      <div style={{ background: 'var(--primary)', color: '#fff', padding: '48px 24px 64px' }}>
        <div className="flex items-center gap-xs mb-md">
          <Icon name="public" style={{ color: '#8fa7fe' }} />
          <span style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>GovtEx Orbit</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, lineHeight: '40px', letterSpacing: '-0.01em' }}>
          Find every government exam you're eligible for.
        </h1>
        <p style={{ marginTop: 12, color: '#bac7e1', fontSize: 16, lineHeight: '24px' }}>
          One profile. Every SSC, Banking, Railways, Defence and State exam checked automatically against your details.
        </p>
        <div className="flex gap-sm mt-lg">
          <Link to="/signup" className="btn btn-primary" style={{ background: '#1E3A8A' }}>Get Started</Link>
          <Link to="/login" className="btn btn-secondary" style={{ borderColor: '#8fa7fe', color: '#fff' }}>Log In</Link>
        </div>
      </div>

      <div className="page-container" style={{ marginTop: -32 }}>
        {FEATURES.map((f, i) => (
          <div key={i} className="card mb-md" style={{ boxShadow: 'var(--shadow-1)' }}>
            <div className="flex gap-sm items-center">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={f.icon} style={{ color: 'var(--secondary)' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{f.title}</h3>
                <p className="text-sm text-muted" style={{ marginTop: 2 }}>{f.desc}</p>
              </div>
            </div>
          </div>
        ))}
        <p className="text-xs text-muted" style={{ textAlign: 'center', marginTop: 24 }}>
          Built for students preparing for SSC, Banking, Railways, Defence, Police and Teaching exams across India.
        </p>
      </div>
    </div>
  );
}
