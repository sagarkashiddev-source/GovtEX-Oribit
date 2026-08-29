import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

export default function TopBar({ title, back, right }) {
  const navigate = useNavigate();
  return (
    <div className="topbar">
      {back && (
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <Icon name="arrow_back" />
        </button>
      )}
      <h1 style={{ flex: 1 }}>{title}</h1>
      {right}
    </div>
  );
}
