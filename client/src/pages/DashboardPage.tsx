import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, FileText, Zap, ArrowRight, Users, Globe, Award,
  Sparkles, Search, Compass, CheckCircle2, ChevronRight,
  BookmarkCheck, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const sections = [
  {
    id: 'research',
    to: '/research',
    icon: BookOpen,
    title: 'SAKSHAM Research Papers',
    subtitle: 'Simplified Academic Discovery',
    description: 'Explore 200M+ global research papers rendered in simple language, audio-assisted reading, and sign-language ready formatting.',
    gradient: 'from-indigo-500 via-purple-500 to-indigo-700',
    glowColor: 'rgba(99, 102, 241, 0.35)',
    badge: 'AI Simplifier',
    badgeClass: 'badge-primary',
    features: ['Instant AI breakdown & summary', 'Paragraph-by-paragraph text to speech', 'Sign language video companion', 'Key concepts & methodology decoder'],
    cta: 'Explore Research',
  },
  {
    id: 'papers',
    to: '/past-papers',
    icon: FileText,
    title: 'SAKSHAM Past Papers',
    subtitle: 'Competitive Exam Mastery',
    description: 'Access official previous-year papers for NEET, JEE & UPSC with timed simulation mode, step-by-step solutions, and instant grading.',
    gradient: 'from-emerald-400 via-teal-500 to-emerald-700',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    badge: 'NEET · JEE · UPSC',
    badgeClass: 'badge-success',
    features: ['Curated 10+ years solved papers', 'Interactive accessible exam mode', 'Detailed rationale & answer keys', 'Performance analytics & weak spot review'],
    cta: 'Practice Papers',
  },
  {
    id: 'innovate',
    to: '/innovate',
    icon: Zap,
    title: 'innoVate AI Tutor',
    subtitle: 'Your 24/7 Accessible Mentor',
    description: 'Ask complex scientific queries, solve textbook problems, and get custom explanations adapted precisely to your learning preferences.',
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    glowColor: 'rgba(249, 115, 22, 0.35)',
    badge: 'Real-time AI',
    badgeClass: 'badge-warning',
    features: ['Voice-enabled natural conversation', 'Multi-level simplification slider', 'Step-by-step problem solver', 'Screen-reader friendly responses'],
    cta: 'Launch innoVate',
  },
];

const stats = [
  { icon: Users, label: 'Active Learners', value: '10,000+', highlight: '+24% this month' },
  { icon: Globe, label: 'Research Papers', value: '200M+', highlight: 'Open Access DB' },
  { icon: Award, label: 'Solved Questions', value: '50,000+', highlight: 'Verified Answers' },
];

const quickPicks = [
  { label: 'Quantum Computing Intro', type: 'Paper', to: '/research/1', icon: BookOpen },
  { label: 'NEET 2023 Full Mock', type: 'Exam', to: '/past-papers/neet-2023/practice', icon: FileText },
  { label: 'Explain Black Holes to me', type: 'AI Query', to: '/innovate', icon: Zap },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/research?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative min-h-screen pb-16 overflow-hidden">
      {/* Dynamic Aurora Ambient Backdrops */}
      <div className="aurora-glow w-[550px] h-[550px] -top-32 -left-32 bg-indigo-600/30" />
      <div className="aurora-glow w-[600px] h-[600px] top-64 -right-40 bg-purple-600/25" style={{ animationDelay: '-4s' }} />
      <div className="aurora-glow w-[500px] h-[500px] bottom-10 left-1/3 bg-pink-600/20" style={{ animationDelay: '-8s' }} />

      <div className="page-container">
        {/* Hero Section */}
        <section className="pt-6 pb-12 text-center relative z-10" aria-labelledby="dashboard-heading">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 backdrop-blur-xl mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)] animate-pulse-glow">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="text-xs font-semibold tracking-wide uppercase text-indigo-300 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" /> SAKSHAM AI Learning Engine Active
            </span>
          </div>

          <h1 id="dashboard-heading" className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white tracking-tight mb-5 leading-tight">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              {user?.name?.split(' ')[0] || 'Scholar'}
            </span>{' '}
            👋
          </h1>

          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-light mb-8">
            Empowering every learner with accessible research papers, solved competitive exams, and interactive AI tutoring.
          </p>

          {/* Interactive Global Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative group mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition duration-300" />
            <div className="relative flex items-center bg-slate-900/90 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-2 shadow-2xl">
              <Search className="w-6 h-6 text-indigo-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across 200M+ research papers, NEET/JEE questions, or ask AI..."
                className="w-full bg-transparent px-4 py-2.5 text-white placeholder-slate-400 text-sm focus:outline-none"
                aria-label="Universal search"
              />
              <button
                type="submit"
                className="btn-primary !py-2.5 !px-5 text-sm !shadow-none shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Jump Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Compass size={14} className="text-indigo-400" /> Quick Jump:
            </span>
            {quickPicks.map((pick) => (
              <Link
                key={pick.label}
                to={pick.to}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500/40 transition-all shadow-sm"
              >
                <pick.icon size={12} className="text-indigo-400" />
                <span>{pick.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-semibold">{pick.type}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Live Metrics / Platform Statistics */}
        <section aria-label="Platform statistics" className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16">
          {stats.map(({ icon: Icon, label, value, highlight }) => (
            <div
              key={label}
              className="glass-card p-5 text-center relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                <Icon size={24} aria-hidden="true" />
              </div>
              <div className="text-3xl font-black font-display text-white tracking-tight">{value}</div>
              <div className="text-sm font-semibold text-slate-300 mt-1">{label}</div>
              <div className="text-[11px] font-medium text-emerald-400 mt-1 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {highlight}
              </div>
            </div>
          ))}
        </section>

        {/* 3 Core Interactive Module Cards */}
        <section aria-labelledby="modules-heading" className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 id="modules-heading" className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight flex items-center gap-2.5">
                <Star className="text-amber-400 fill-amber-400" size={24} /> Learning Pathways
              </h2>
              <p className="text-slate-400 text-sm mt-1">Select a module to begin your accessible learning journey</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <article
                  key={section.id}
                  className="glass-card-interactive p-7 flex flex-col justify-between group border-white/[0.08]"
                  style={{
                    boxShadow: `0 10px 30px -10px rgba(0,0,0,0.5)`,
                  }}
                  aria-labelledby={`section-title-${section.id}`}
                >
                  {/* Top Ambient Glow Line */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${section.gradient} rounded-t-xl -mt-7 -mx-7 mb-6 opacity-80 group-hover:opacity-100 transition-opacity`} />

                  <div>
                    {/* Header: Icon & Badge */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur-sm opacity-0 group-hover:opacity-60 transition duration-300" />
                        <div className="relative w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform duration-300">
                          <Icon size={28} className="text-indigo-400 group-hover:text-white transition-colors" aria-hidden="true" />
                        </div>
                      </div>
                      <span className={section.badgeClass}>{section.badge}</span>
                    </div>

                    {/* Titles */}
                    <h3 id={`section-title-${section.id}`} className="text-xl font-bold text-white mb-1 tracking-tight group-hover:text-indigo-300 transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400/90 mb-3">
                      {section.subtitle}
                    </p>

                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                      {section.description}
                    </p>

                    {/* Feature Points */}
                    <div className="border-t border-slate-800/80 pt-4 mb-6">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Key Highlights</p>
                      <ul className="space-y-2.5" aria-label={`${section.title} features`}>
                        {section.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2 text-xs text-slate-300 leading-snug">
                            <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Link */}
                  <Link
                    to={section.to}
                    className="btn-primary w-full text-sm font-bold shadow-lg"
                    aria-label={`Open ${section.title}`}
                  >
                    <span>{section.cta}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-200" aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        {/* Accessibility & Inclusive Learning Spotlight Card */}
        <section aria-label="Accessibility settings showcase" className="glass-card p-8 relative overflow-hidden border-indigo-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                <BookmarkCheck size={14} /> Universal Accessibility
              </div>
              <h3 className="text-2xl font-black font-display text-white mb-2">
                Tailor SAKSHAM to Your Personal Learning Needs
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Adjust font magnification, high contrast modes, speech synthesis speed, screen reader compatibility, and reduced motion settings directly from your profile.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <Link to="/profile" className="btn-secondary w-full md:w-auto text-sm font-semibold">
                Accessibility Preferences
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

