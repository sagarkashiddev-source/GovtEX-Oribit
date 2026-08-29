import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function RequireAuth() {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!profile) return <Navigate to="/login" state={{ from: location }} replace />;

  const step = profile.user.onboarding_step;
  const onOnboardingPage = location.pathname.startsWith('/onboarding');
  if (step && step !== 'done' && !onOnboardingPage) {
    return <Navigate to={`/onboarding/${step === 'basic' ? 'basic' : step}`} replace />;
  }
  return <Outlet />;
}

export function RedirectIfAuthed({ children }) {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (profile) return <Navigate to="/dashboard" replace />;
  return children;
}
