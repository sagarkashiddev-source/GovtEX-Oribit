import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const ITEMS = [
  { to: '/dashboard', icon: 'home', label: 'Home' },
  { to: '/exams', icon: 'travel_explore', label: 'Explore' },
  { to: '/eligibility', icon: 'fact_check', label: 'Eligibility' },
  { to: '/tracker', icon: 'assignment', label: 'Tracker' },
  { to: '/library', icon: 'menu_book', label: 'Library' },
  { to: '/profile', icon: 'person', label: 'Profile' }
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {ITEMS.map(item => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'active' : ''}>
          <Icon name={item.icon} size={22} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
