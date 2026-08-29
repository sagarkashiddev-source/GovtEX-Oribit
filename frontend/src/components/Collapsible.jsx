import React, { useState } from 'react';
import Icon from './Icon';

export default function Collapsible({ title, icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card mb-sm" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: 'none', border: 'none', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}
      >
        {icon && <Icon name={icon} style={{ color: 'var(--secondary)' }} />}
        <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{title}</span>
        <Icon name={open ? 'expand_less' : 'expand_more'} style={{ color: 'var(--outline)' }} />
      </button>
      {open && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </div>
  );
}
