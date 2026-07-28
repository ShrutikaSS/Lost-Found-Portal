import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Modal from './components/Modal';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import StudentDashboard from './pages/StudentDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ItemDetailsPage from './pages/ItemDetailsPage';

function AppContent() {
  const [activePage, setActivePage] = useState('landing');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFaqModal, setShowFaqModal] = useState(false);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setActivePage('item-details');
  };

  const handleClaimItem = (item) => {
    setSelectedItem(item);
    setActivePage('item-details');
  };

  return (
    <div className="app-container">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="main-content">
        {activePage === 'landing' && (
          <LandingPage 
            setActivePage={setActivePage} 
            onSelectItem={handleSelectItem} 
            onClaimItem={handleClaimItem} 
          />
        )}

        {activePage === 'login' && (
          <LoginPage setActivePage={setActivePage} />
        )}

        {activePage === 'register' && (
          <RegisterPage setActivePage={setActivePage} />
        )}

        {activePage === 'forgot-password' && (
          <ForgotPassword setActivePage={setActivePage} />
        )}

        {activePage === 'student-dashboard' && (
          <ProtectedRoute allowedRoles={['student_staff', 'officer', 'admin']} onRedirect={setActivePage}>
            <StudentDashboard onSelectItem={handleSelectItem} />
          </ProtectedRoute>
        )}

        {activePage === 'officer-dashboard' && (
          <ProtectedRoute allowedRoles={['officer', 'admin']} onRedirect={setActivePage}>
            <OfficerDashboard onSelectItem={handleSelectItem} />
          </ProtectedRoute>
        )}

        {activePage === 'admin-dashboard' && (
          <ProtectedRoute allowedRoles={['admin']} onRedirect={setActivePage}>
            <AdminDashboard initialTab="analytics" />
          </ProtectedRoute>
        )}

        {activePage === 'admin-user-management' && (
          <ProtectedRoute allowedRoles={['admin']} onRedirect={setActivePage}>
            <AdminDashboard initialTab="user-management" />
          </ProtectedRoute>
        )}

        {activePage === 'item-details' && selectedItem && (
          <ItemDetailsPage 
            item={selectedItem} 
            onBack={() => setActivePage('landing')} 
            onClaimSubmitted={() => setActivePage('student-dashboard')} 
          />
        )}
      </main>

      <Footer onOpenFaq={() => setShowFaqModal(true)} />

      {/* Global FAQ Modal */}
      <Modal isOpen={showFaqModal} onClose={() => setShowFaqModal(false)} title="TrackNFind FAQ & Office Policies">
        <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <strong style={{ color: '#0f172a' }}>1. Physical Chain of Custody & Holding Period:</strong>
            <p style={{ marginTop: '0.25rem' }}>All found items turned into TrackNFind are cataloged with a unique physical storage locker ID. Unclaimed items are held for 90 days before institutional donation or disposal per campus rules.</p>
          </div>
          <div>
            <strong style={{ color: '#0f172a' }}>2. Proof Required for Claim Approval:</strong>
            <p style={{ marginTop: '0.25rem' }}>To recover property, claimants must present a physical student/staff ID card and provide unique visual identifier proof (serial numbers, wallpaper description, contents, or invoice receipt).</p>
          </div>
          <div>
            <strong style={{ color: '#0f172a' }}>3. Office Hours:</strong>
            <p style={{ marginTop: '0.25rem' }}>Central Library Room 102. Mon-Fri: 8:30 AM – 5:00 PM.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
