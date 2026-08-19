import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function ProtectedRoute({
  children,
  element,
  context = 'access this page',
  preserveAs,
}) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

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

  if (element) return element;
  return children ? <>{children}</> : null;
}
