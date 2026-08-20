import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getDashboardForRole } from '../../context/AuthContext';

export default function ProtectedRoute({
  children,
  element,
  context = 'access this page',
  preserveAs,
  allowedRoles = [],
}) {
  const { isAuthenticated, user, loading, isProfileLoaded, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8E8E2]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#304355]"></div>
          <p className="text-sm font-medium text-[#304355]">Verifying access…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const intendedDestination = preserveAs || location.pathname + location.search;
    return (
      <Navigate
        to="/login-required"
        replace
        state={{
          from: intendedDestination,
          context,
        }}
      />
    );
  }

  if (!isProfileLoaded || !user) {
    const handleLogout = async () => {
      await logout().catch(() => {});
      navigate('/login');
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8E8E2] p-6">
        <div className="bg-white rounded-2xl shadow-md border border-[#304355]/10 max-w-md w-full p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 text-amber-600 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-[#304355]">Profile not ready</h2>
          <p className="text-sm text-[#64707A]">
            Your sign-in completed, but your PoshanSetu profile could not be loaded.
            This usually happens if the account was created but the profile sync did not finish.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-[#304355] text-white text-sm font-semibold px-6 py-2.5 rounded-md hover:bg-[#243342] transition-colors"
            >
              Try reloading
            </button>
            <button
              onClick={handleLogout}
              className="bg-white border border-[#304355]/20 text-[#304355] text-sm font-semibold px-6 py-2.5 rounded-md hover:bg-slate-50 transition-colors"
            >
              Sign out and try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const defaultDashboard = getDashboardForRole(user.role);
    if (defaultDashboard) {
      return <Navigate to={defaultDashboard} replace />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8E8E2] p-6">
        <div className="bg-white rounded-2xl shadow-md border border-[#304355]/10 max-w-md w-full p-8 text-center space-y-4">
          <h2 className="text-xl font-extrabold text-[#304355]">Role not recognized</h2>
          <p className="text-sm text-[#64707A]">
            Your account role ({user.role || 'none'}) is not recognized. Please contact support.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#304355] text-white text-sm font-semibold px-6 py-2.5 rounded-md hover:bg-[#243342] transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (element) return element;
  return children ? <>{children}</> : null;
}
