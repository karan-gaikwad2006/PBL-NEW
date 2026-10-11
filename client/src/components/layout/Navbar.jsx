import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getDashboardForRole } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

const NAVBAR_HEIGHT = '5rem';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { open: openChat, isOpen: isChatOpen } = useChat();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path) =>
    `relative font-medium text-base transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-[#278A3D] ${
      isActive(path)
        ? 'text-[#102C1A] after:w-full'
        : 'text-[#193A25] after:w-0 hover:text-[#102C1A] hover:after:w-full hover:after:transition-all'
    }`;

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
    <header
      className="bg-[#F5F8F0] border-b border-[#31543B]/15 shadow-sm sticky top-0 z-50"
      style={{ '--navbar-height': NAVBAR_HEIGHT }}
    >
      <div
        className="flex justify-between items-center px-6 md:px-10 max-w-[1280px] mx-auto w-full"
        style={{ height: 'var(--navbar-height)' }}
      >
        {/* Brand — overflow clips the "Bridge of Nutrition" tagline */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center hover:opacity-90 transition group">
            <div className="relative h-[var(--navbar-height)] w-[190px] shrink-0 overflow-hidden">
              <img 
                src="/logo.png"
                alt="PoshanSetu — Bridge of Nutrition • Community Care"
                className="absolute w-[170px] h-auto max-w-none object-contain transition-transform"
                style={{ top: '56%', left: '5%', transform: 'translateY(-50%) scale(110%)' }}
              />
            </div>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={navLinkClass('/')}
          >
            Home
          </Link>
          <Link
            to="/explore"
            className={navLinkClass('/explore')}
          >
            Explore Needs
          </Link>
          <Link
            to="/how-it-works"
            className={navLinkClass('/how-it-works')}
          >
            How It Works
          </Link>
          <Link
            to="/submit-requirement"
            className={navLinkClass('/submit-requirement')}
          >
            Submit a Requirement
          </Link>
          <Link
            to="/about"
            className={navLinkClass('/about')}
          >
            About
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Chat icon — secondary entry point that opens the global ChatContext panel */}
              <button
                id="navbar-chat-button"
                onClick={openChat}
                aria-label="Open chat assistant"
                aria-pressed={isChatOpen}
                title="Ask the assistant"
                className={[
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                  isChatOpen
                    ? 'bg-[#DDF1D8] text-[#1D7B37]'
                    : 'text-[#405747] hover:bg-[#E6F0E2] hover:text-[#1D7B37]',
                ].join(' ')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
              <Link 
                to={getDashboardPath()} 
                className="text-[#244A2E] font-bold text-base hover:text-[#1D7B37] hover:underline"
              >
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-[#278A3D] text-white text-base font-semibold px-6 py-2 rounded-md hover:bg-[#1D7331] transition-colors shadow-xs"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[#244A2E] font-medium text-base hover:text-[#1D7B37] hover:underline">
                Login
              </Link>
              <Link to="/register">
                <button className="bg-[#278A3D] text-white text-base font-semibold px-6 py-2 rounded-md hover:bg-[#1D7331] transition-colors shadow-xs">
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
