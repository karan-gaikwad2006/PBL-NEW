import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getDashboardForRole } from '../../context/AuthContext';

export default function Dashboard() {
  const { user, isAuthenticated, loading, isProfileLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    if (isProfileLoaded && user) {
      const target = getDashboardForRole(user.role);
      if (target) {
        navigate(target, { replace: true });
      }
    }
  }, [loading, isAuthenticated, isProfileLoaded, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-[#E8E8E2]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#304355]"></div>
          <p className="text-sm font-medium text-[#304355]">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isProfileLoaded || !user) {
    return <Navigate to="/login" replace />;
  }

  const target = getDashboardForRole(user.role);
  if (target) {
    return <Navigate to={target} replace />;
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-[#E8E8E2] p-6">
      <div className="bg-white rounded-2xl shadow-md border border-[#304355]/10 max-w-md w-full p-8 text-center">
        <h2 className="text-xl font-extrabold text-[#304355] mb-2">Account role not recognized</h2>
        <p className="text-sm text-[#64707A] mb-4">
          Your account role ({user.role || 'none'}) is not valid. Please contact support or create a new account.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#304355] text-white text-sm font-semibold px-6 py-2 rounded-md hover:bg-[#243342] transition-colors"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}
