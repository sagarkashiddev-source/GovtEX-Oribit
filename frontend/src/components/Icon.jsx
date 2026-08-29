import React from 'react';

export default function Icon({ name, size, style, className = '' }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: size || 20, ...style }}
    >
      {name}
    </span>
  );
}
