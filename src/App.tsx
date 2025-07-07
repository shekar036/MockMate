import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import AuthComponent from './components/AuthComponent';
import InterviewDashboard from './components/InterviewDashboard';
import { useAuth } from './hooks/useAuth';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {user ? <InterviewDashboard /> : <AuthComponent />}
    </div>
  );
}

function App() {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SupabaseProvider>
  );
}

export default App;