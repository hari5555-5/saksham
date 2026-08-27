import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen, FileText, Zap, User, LogOut, Menu, X,
  Home, Settings, ChevronDown, Sparkles, Dna
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/biobridge/home', label: 'BioBridge AI', icon: Dna, isBioBridge: true },
  { to: '/research', label: 'Research Papers', icon: BookOpen },
  { to: '/past-papers', label: 'Past Papers', icon: FileText },
  { to: '/innovate', label: 'innoVate AI', icon: Zap },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Top micro ambient glow line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 to-amber-400 opacity-80" />

      <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl p-1"
            aria-label="APD EQUILEARN Home"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300 group-hover:scale-110" />
              <img
                src="./logo.png"
                alt="APD EQUILEARN Logo"
                className="relative w-10 h-10 object-contain rounded-xl shadow-lg bg-slate-900/90 p-0.5 border border-white/10"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-lg sm:text-xl tracking-wider text-white flex items-center gap-1.5">
                APD EQUILEARN
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Sparkles size={10} className="mr-0.5" /> PRO
                </span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-medium text-cyan-300/90 tracking-wide -mt-0.5 max-w-[280px] sm:max-w-none truncate">
                Empowering Diverse Learners Through Accessible Biotechnology Education and Innovation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon size={16} className="transition-transform group-hover:scale-110" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right side Profile & Quick Actions */}
          <div className="flex items-center gap-3">
            {/* User Profile */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 text-sm font-medium text-slate-200 hover:text-white transition-all shadow-sm"
                aria-haspopup="true"
                aria-expanded={profileOpen}
                aria-label={`Account menu for ${user?.name}`}
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/30 ring-2 ring-indigo-500/40">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                </div>
                <span className="max-w-[120px] truncate font-semibold text-slate-100">{user?.name || 'Account'}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180 text-indigo-400' : ''}`} aria-hidden="true" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 glass-card border border-slate-700/80 shadow-2xl p-1.5 z-50 animate-fade-in">
                  <div className="px-3.5 py-2.5 border-b border-slate-800/80">
                    <p className="text-xs font-medium text-slate-400">Signed in as</p>
                    <p className="text-sm font-bold text-white truncate">{user?.email || 'user@saksham.edu'}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-indigo-600/20 hover:border-indigo-500/30 rounded-lg transition-all"
                    >
                      <User size={16} className="text-indigo-400" aria-hidden="true" />
                      Profile & Accessibility
                    </Link>
                  </div>

                  <div className="border-t border-slate-800/80 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <LogOut size={16} aria-hidden="true" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              className="md:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile slide menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-800/80 py-4 px-2 space-y-2 animate-fade-in bg-slate-950/95 backdrop-blur-2xl rounded-b-2xl">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
            <div className="border-t border-slate-800/80 my-2 pt-2">
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-900 hover:text-white rounded-xl"
              >
                <Settings size={18} className="text-indigo-400" aria-hidden="true" />
                Accessibility & Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-950/30 rounded-xl transition-colors mt-1"
              >
                <LogOut size={18} aria-hidden="true" />
                Log out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Screen Reader Skip */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-2xl"
      >
        Skip to main content
      </a>
    </header>
  );
}

