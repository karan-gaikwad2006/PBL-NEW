import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getDashboardForRole } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    const dashboard = getDashboardForRole(user.role);
    return dashboard || '/dashboard';
  };

  return (
    <header className="bg-[#E8E8E2] border-b border-[#304355]/10 shadow-xs sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 md:px-10 py-0 max-w-[1280px] mx-auto w-full">
        {/* Brand — overflow clips the "Bridge of Nutrition" tagline */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center hover:opacity-90 transition group">
            <div className="h-[4.5rem] sm:h-[4.9rem] md:h-[5.5rem] overflow-hidden flex items-start pt-1.5">
              <img 
                src={logo} 
                alt="PoshanSetu — Bridge of Nutrition • Community Care" 
                className="h-[4.5rem] sm:h-[5rem] md:h-[5.75rem] w-auto object-contain object-top transition-transform group-hover:scale-[1.02]" 
              />
            </div>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`font-semibold text-base ${
              isActive('/')
                ? 'text-[#304355] border-b-2 border-[#304355] pb-1'
                : 'text-[#43474C] hover:text-[#304355]'
            }`}
          >
            Home
          </Link>
          <Link
            to="/explore"
            className={`font-medium text-base ${
              isActive('/explore')
                ? 'text-[#304355] border-b-2 border-[#304355] pb-1 font-semibold'
                : 'text-[#43474C] hover:text-[#304355]'
            }`}
          >
            Explore Needs
          </Link>
          <Link
            to="/how-it-works"
            className={`font-medium text-base ${
              isActive('/how-it-works')
                ? 'text-[#304355] border-b-2 border-[#304355] pb-1 font-semibold'
                : 'text-[#43474C] hover:text-[#304355]'
            }`}
          >
            How It Works
          </Link>
          <Link
            to="/submit-requirement"
            className={`font-medium text-base ${
              isActive('/submit-requirement')
                ? 'text-[#304355] border-b-2 border-[#304355] pb-1 font-semibold'
                : 'text-[#43474C] hover:text-[#304355]'
            }`}
          >
            Submit a Requirement
          </Link>
          <Link
            to="/about"
            className={`font-medium text-base ${
              isActive('/about')
                ? 'text-[#304355] border-b-2 border-[#304355] pb-1 font-semibold'
                : 'text-[#43474C] hover:text-[#304355]'
            }`}
          >
            About
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link 
                to={getDashboardPath()} 
                className="text-[#304355] font-bold text-base hover:underline"
              >
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-[#304355] text-white text-base font-semibold px-6 py-2 rounded-md hover:bg-[#243342] transition-colors shadow-xs"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[#304355] font-medium text-base hover:underline">
                Login
              </Link>
              <Link to="/register">
                <button className="bg-[#304355] text-white text-base font-semibold px-6 py-2 rounded-md hover:bg-[#243342] transition-colors shadow-xs">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
