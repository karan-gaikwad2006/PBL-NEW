import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public pages
import LandingPage from './pages/public/LandingPage';
import ExploreMap from './pages/public/ExploreMap';
import DistrictInsights from './pages/public/DistrictInsights';
import RequirementsCatalog from './pages/public/RequirementsCatalog';
import RequirementDetails from './pages/public/RequirementDetails';
import FoodMatching from './pages/public/FoodMatching';
import RequirementSubmit from './pages/public/RequirementSubmit';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import LoginRequired from './pages/auth/LoginRequired';
import AuthPage from './pages/auth/AuthPage'; // legacy, keep for compatibility

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

export default function App() {
  return (
    <Router>
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
            <Route path="/submit-need" element={<RequirementSubmit />} />
            <Route path="/submit-requirement" element={<RequirementSubmit />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/create-account" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/login-required" element={<LoginRequired />} />
            <Route path="/auth" element={<AuthPage />} />  {/* legacy */}

            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
