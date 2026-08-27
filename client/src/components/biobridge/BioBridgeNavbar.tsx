import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Dna,
  BookOpen,
  GraduationCap,
  Sparkles,
  Activity,
  Cpu,
  LayoutDashboard,
  User,
  Menu,
  X,
  ArrowRightLeft,
  FlaskConical,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SignLanguageVideoPlayer } from './SignLanguageVideoPlayer';

export const BioBridgeNavbar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signModalOpen, setSignModalOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/', icon: Dna },
    { label: 'Research', path: '/research', icon: BookOpen },
    { label: 'Competitive', path: '/competitive', icon: GraduationCap },
    { label: 'Innovate', path: '/innovate', icon: Sparkles },
    { label: 'Biomarkers', path: '/biomarkers', icon: Activity },
    { label: 'Biosensors', path: '/biosensors', icon: Cpu },
    { label: 'Experiments', path: '/experiments', icon: FlaskConical },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/biobridge/home')) return true;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/20 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Portal Branding */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="APD EQUILEARN Logo"
                className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300"
              />
              <div>
                <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-300 to-purple-400">
                  APD EQUILEARN
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/30 rounded-full">
                  PRO
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSignModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-300 bg-purple-950/60 border border-purple-500/40 hover:bg-purple-900/80 transition-all shadow-sm"
              title="Open Sign Language Video Player"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Sign Video</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
            ) : null}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Universal Sign Language Video Player Modal */}
        <SignLanguageVideoPlayer
          isOpen={signModalOpen}
          onClose={() => setSignModalOpen(false)}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-cyan-500/20 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
