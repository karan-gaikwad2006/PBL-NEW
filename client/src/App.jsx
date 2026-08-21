import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RequirementSubmit from './pages/public/RequirementSubmit';

// Public pages
import LandingPage from './pages/public/LandingPage';
import ExploreMap from './pages/public/ExploreMap';
import DistrictInsights from './pages/public/DistrictInsights';
import RequirementsCatalog from './pages/public/RequirementsCatalog';
import RequirementDetails from './pages/public/RequirementDetails';
import FoodMatching from './pages/public/FoodMatching';
import SendSupportOffer from './pages/public/SendSupportOffer';
import SupportOfferSuccess from './pages/public/SupportOfferSuccess';
import ConfirmSupportCompletion from './pages/public/ConfirmSupportCompletion';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import LoginRequired from './pages/auth/LoginRequired';
import AuthPage from './pages/auth/AuthPage'; // legacy, keep for compatibility

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Phase 2H — Donor Dashboard + Support Details
import DonorDashboard from './pages/dashboard/DonorDashboard';
import SupportDetails from './pages/dashboard/SupportDetails';

// Phase 2I — Requester Dashboard + Requirement Management + Status
import RequesterDashboard from './pages/dashboard/RequesterDashboard';
import RequirementManagement from './pages/dashboard/RequirementManagement';
import RequirementStatus from './pages/dashboard/RequirementStatus';

// Phase 2J — Institution Profile
import InstitutionProfile from './pages/dashboard/InstitutionProfile';

// Phase 2K — Notification Center
import NotificationCenter from './pages/dashboard/NotificationCenter';

// Phase 2L — Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReview from './pages/admin/AdminReview';

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-[#E8E8E2] text-[#1F2933] flex flex-col justify-between font-sans">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/explore" element={<ExploreMap />} />
              <Route path="/browse" element={<ExploreMap />} />
              <Route path="/districts/:districtId" element={<DistrictInsights />} />
              <Route path="/requirements" element={<RequirementsCatalog />} />
              <Route path="/requirements/:id" element={<RequirementDetails />} />
              <Route path="/food-match" element={<FoodMatching />} />
              <Route
                path="/submit-need"
                element={
                  <ProtectedRoute
                    element={<RequirementSubmit />}
                    context="submit a requirement"
                    preserveAs="/submit-need"
                  />
                }
              />
              <Route
                path="/submit-requirement"
                element={
                  <ProtectedRoute
                    element={<RequirementSubmit />}
                    context="submit a requirement"
                    preserveAs="/submit-need"
                  />
                }
              />
              <Route path="/requirements/:id/support" element={<SendSupportOffer />} />
              <Route path="/requirements/:id/support-success" element={<SupportOfferSuccess />} />
              <Route path="/confirm-completion/:id" element={<ConfirmSupportCompletion />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/create-account" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/login-required" element={<LoginRequired />} />
            <Route path="/auth" element={<AuthPage />} />  {/* legacy */}

            {/* Dashboard (legacy generic) */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Phase 2H — Donor */}
            <Route
              path="/donor/dashboard"
              element={
                <ProtectedRoute
                  element={<DonorDashboard />}
                  allowedRoles={['donor', 'admin']}
                />
              }
            />
            <Route
              path="/donor/supports/:supportId"
              element={
                <ProtectedRoute
                  element={<SupportDetails />}
                  allowedRoles={['donor', 'admin']}
                />
              }
            />

            {/* Phase 2I — Requester */}
            <Route
              path="/requester/dashboard"
              element={
                <ProtectedRoute
                  element={<RequesterDashboard />}
                  allowedRoles={['requester', 'admin']}
                />
              }
            />
            <Route
              path="/requester/requirements/:id"
              element={
                <ProtectedRoute
                  element={<RequirementManagement />}
                  allowedRoles={['requester', 'admin']}
                />
              }
            />
            <Route
              path="/requester/requirements/:id/status"
              element={
                <ProtectedRoute
                  element={<RequirementStatus />}
                  allowedRoles={['requester', 'admin']}
                />
              }
            />

            {/* Phase 2J — Institution Profile */}
            <Route
              path="/institution-profile"
              element={
                <ProtectedRoute
                  element={<InstitutionProfile />}
                  allowedRoles={['institution', 'admin']}
                />
              }
            />

            {/* Phase 2K — Notifications */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute
                  element={<NotificationCenter />}
                />
              }
            />

            {/* Phase 2L — Admin */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute
                  element={<AdminDashboard />}
                  allowedRoles={['admin']}
                />
              }
            />
            <Route
              path="/admin/review/:id"
              element={
                <ProtectedRoute
                  element={<AdminReview />}
                  allowedRoles={['admin']}
                />
              }
            />
            <Route
              path="/admin/institution-review/:id"
              element={
                <ProtectedRoute
                  element={<AdminReview />}
                  allowedRoles={['admin']}
                />
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
    </AuthProvider>
  );
}
