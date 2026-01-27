import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotesProvider } from './context/NotesContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './pages/Dashboard';
import Bin from './pages/Bin';
import notificationService from './services/notificationService';
import './index.css';

import { DialogProvider } from './context/DialogContext';
import { WallpaperProvider } from './context/WallpaperContext';
import WallpaperBackground from './components/Common/WallpaperBackground';

function App() {
  useEffect(() => {
    // Request notification permission and start checking for reminders
    notificationService.requestPermission().then((granted) => {
      if (granted) {
        notificationService.startChecking();
      }
    });

    // Cleanup on unmount
    return () => {
      notificationService.stopChecking();
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <WallpaperProvider>
          <DialogProvider>
            <NotesProvider>
              <WallpaperBackground />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bin"
                  element={
                    <ProtectedRoute>
                      <Bin />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </NotesProvider>
          </DialogProvider>
        </WallpaperProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
