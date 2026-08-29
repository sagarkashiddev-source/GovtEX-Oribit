import React from 'react';
import Icon from './Icon';

export function Skeleton({ height = 80, style }) {
  return <div className="skeleton" style={{ height, width: '100%', ...style }} />;
}

export function LoadingList({ count = 3, height = 90 }) {
  return (
    <div className="flex-col gap-md">
      {Array.from({ length: count }).map((_, i) => <Skeleton key={i} height={height} />)}
    </div>
  );
}

export function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="empty-state">
      <Icon name={icon} />
      <h3 style={{ marginBottom: 6 }}>{title}</h3>
      {description && <p className="text-sm text-muted" style={{ maxWidth: 280 }}>{description}</p>}
      {action && <div className="mt-md">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="badge badge-error" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', marginBottom: 16 }}>
      <Icon name="error" size={16} /> {message}
    </div>
  );
}
