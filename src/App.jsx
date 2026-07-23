import React, { useState } from 'react';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import { AdminDashboard, OfficerDashboard, StudentDashboard } from './pages/Dashboards';
import './App.css';

export default function App() {
  // Navigation Routing state: 'landing' | 'register' | 'login' | 'admin-dashboard' | 'officer-dashboard' | 'student-dashboard'
  const [currentView, setCurrentView] = useState('landing');
  
  // Current logged in user object: { name, email, role: 'student' | 'officer' | 'admin' }
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <div className="app-container">
      {/* Header bar shared across pages */}
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />

      <main className="main-content">
        {/* TASK 1: Landing Page */}
        {currentView === 'landing' && (
          <LandingPage setCurrentView={setCurrentView} />
        )}

        {/* TASK 2: Registration Page */}
        {currentView === 'register' && (
          <RegisterPage setCurrentView={setCurrentView} />
        )}

        {/* TASK 3: Role-Based Login Page */}
        {currentView === 'login' && (
          <LoginPage 
            setCurrentView={setCurrentView} 
            setCurrentUser={setCurrentUser} 
          />
        )}

        {/* MOCK ROLE DASHBOARDS (FOR END-TO-END DEMONSTRATION) */}
        {currentView === 'admin-dashboard' && (
          <AdminDashboard currentUser={currentUser} setCurrentView={setCurrentView} />
        )}

        {currentView === 'officer-dashboard' && (
          <OfficerDashboard currentUser={currentUser} setCurrentView={setCurrentView} />
        )}

        {currentView === 'student-dashboard' && (
          <StudentDashboard currentUser={currentUser} setCurrentView={setCurrentView} />
        )}
      </main>
    </div>
  );
}
