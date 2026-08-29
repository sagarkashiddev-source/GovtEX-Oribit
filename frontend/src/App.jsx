import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth, RedirectIfAuthed } from './auth/RequireAuth';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OnboardingBasic from './pages/onboarding/OnboardingBasic';
import OnboardingEducation from './pages/onboarding/OnboardingEducation';
import OnboardingPreferences from './pages/onboarding/OnboardingPreferences';
import Dashboard from './pages/Dashboard';
import ExploreExams from './pages/ExploreExams';
import ExamDetail from './pages/ExamDetail';
import EligibilityStatus from './pages/EligibilityStatus';
import MyExams from './pages/MyExams';
import SubjectRepository from './pages/SubjectRepository';
import SubjectNotes from './pages/SubjectNotes';
import NoteDetail from './pages/NoteDetail';
import VideoLectures from './pages/VideoLectures';
import VideoDetail from './pages/VideoDetail';
import Profile from './pages/Profile';
import AdminContent from './pages/AdminContent';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RedirectIfAuthed><Landing /></RedirectIfAuthed>} />
          <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
          <Route path="/signup" element={<RedirectIfAuthed><Signup /></RedirectIfAuthed>} />
          <Route path="/admin" element={<AdminContent />} />

          <Route element={<RequireAuth />}>
            <Route path="/onboarding/basic" element={<OnboardingBasic />} />
            <Route path="/onboarding/education" element={<OnboardingEducation />} />
            <Route path="/onboarding/physical" element={<OnboardingPreferences />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exams" element={<ExploreExams />} />
            <Route path="/exams/:id" element={<ExamDetail />} />
            <Route path="/eligibility" element={<EligibilityStatus />} />
            <Route path="/my-exams" element={<MyExams />} />
            <Route path="/library" element={<SubjectRepository />} />
            <Route path="/library/subjects/:id" element={<SubjectNotes />} />
            <Route path="/library/notes/:id" element={<NoteDetail />} />
            <Route path="/library/videos" element={<VideoLectures />} />
            <Route path="/library/videos/:id" element={<VideoDetail />} />
            <Route path="/profile" element={<Profile />} />

            {/* legacy routes redirect to the merged My Exams page */}
            <Route path="/tracker" element={<Navigate to="/my-exams" replace />} />
            <Route path="/saved" element={<Navigate to="/my-exams" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
