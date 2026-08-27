import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Activity,
  Cpu,
  Accessibility,
  TrendingUp,
  Award,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  BarChart3,
  PieChart,
  Dna,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { biobridgeApi } from '../../services/biobridgeApi';

export const BioBridgeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    papersExplored: 4,
    questionsPracticed: 18,
    projectsGenerated: 3,
    savedBiomarkers: 5,
    weeklyHours: 8.5
  });

  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    biobridgeApi.getCompetitiveAnalytics().then(setAnalytics).catch(() => {});
  }, []);

  const userName = user?.name || 'Biotech Innovator';

  // Topic distribution data
  const topicDistribution = [
    { topic: 'Genetics & Genomics', percentage: 35, color: 'bg-cyan-500' },
    { topic: 'Biosensors & Microfluidics', percentage: 25, color: 'bg-blue-500' },
    { topic: 'Metabolomics & Endocrine', percentage: 20, color: 'bg-purple-500' },
    { topic: 'Neurobiology', percentage: 12, color: 'bg-indigo-500' },
    { topic: 'Cell Biology', percentage: 8, color: 'bg-pink-500' }
  ];

  // Weekly activity bar graph data (mon - sun)
  const weeklyData = [
    { day: 'Mon', hours: 1.2 },
    { day: 'Tue', hours: 2.0 },
    { day: 'Wed', hours: 1.8 },
    { day: 'Thu', hours: 2.5 },
    { day: 'Fri', hours: 1.0 },
    { day: 'Sat', hours: 0.0 },
    { day: 'Sun', hours: 0.0 }
  ];

  const maxHours = Math.max(...weeklyData.map(d => d.hours), 3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Welcome Section */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/60 to-purple-950/60 border border-cyan-500/30 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Dna className="w-64 h-64 text-cyan-400" />
        </div>
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>APD EQUILEARN Biotechnology Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">{userName}</span>!
          </h1>
          <p className="text-slate-300 text-base">
            Ready to explore biotechnology research, measure biomarkers, and convert interests into project innovations today?
          </p>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="text-xs text-slate-400 font-medium">Papers Explored</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-100">{stats.papersExplored}</p>
          <span className="text-[11px] text-cyan-400 font-medium mt-1">+2 this week</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-400 mb-2">
            <span className="text-xs text-slate-400 font-medium">MCQs Practiced</span>
            <GraduationCap className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-100">{analytics?.totalQuestionsAnswered || stats.questionsPracticed}</p>
          <span className="text-[11px] text-blue-400 font-medium mt-1">{analytics?.accuracy || 82}% accuracy</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <span className="text-xs text-slate-400 font-medium">Projects Generated</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-100">{stats.projectsGenerated}</p>
          <span className="text-[11px] text-purple-400 font-medium mt-1">10-step workflows</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-pink-400 mb-2">
            <span className="text-xs text-slate-400 font-medium">Saved Biomarkers</span>
            <Activity className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-100">{stats.savedBiomarkers}</p>
          <span className="text-[11px] text-pink-400 font-medium mt-1">Biosensor mapped</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs text-slate-400 font-medium">Weekly Activity</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-100">{stats.weeklyHours} hrs</p>
          <span className="text-[11px] text-amber-400 font-medium mt-1">Active streak: 4 days</span>
        </div>

      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" /> Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <Link
            to="/biobridge/research"
            className="group p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/20 hover:border-cyan-400 transition-all flex items-center justify-between shadow-sm hover:shadow-cyan-500/10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-cyan-950 text-cyan-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Explore Research</h3>
                <p className="text-xs text-slate-400">Search biotech papers & AI summaries</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/biobridge/competitive"
            className="group p-5 rounded-2xl bg-slate-900/90 border border-blue-500/20 hover:border-blue-400 transition-all flex items-center justify-between shadow-sm hover:shadow-blue-500/10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-950 text-blue-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Practice GATE Questions</h3>
                <p className="text-xs text-slate-400">MCQs & AI Concept Detection</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/biobridge/innovate"
            className="group p-5 rounded-2xl bg-slate-900/90 border border-purple-500/20 hover:border-purple-400 transition-all flex items-center justify-between shadow-sm hover:shadow-purple-500/10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-950 text-purple-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Generate Project Ideas</h3>
                <p className="text-xs text-slate-400">From student interest to proposal</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/biobridge/biomarkers"
            className="group p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/20 hover:border-indigo-400 transition-all flex items-center justify-between shadow-sm hover:shadow-indigo-500/10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-950 text-indigo-400 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Explore Biomarkers</h3>
                <p className="text-xs text-slate-400">Interactive 7-step visual workflow</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/biobridge/biosensors"
            className="group p-5 rounded-2xl bg-slate-900/90 border border-pink-500/20 hover:border-pink-400 transition-all flex items-center justify-between shadow-sm hover:shadow-pink-500/10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-pink-950 text-pink-400 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Design a Biosensor</h3>
                <p className="text-xs text-slate-400">Analyte → Bioreceptor → Transducer</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/profile"
            className="group p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/20 hover:border-emerald-400 transition-all flex items-center justify-between shadow-sm hover:shadow-emerald-500/10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-950 text-emerald-400 group-hover:scale-110 transition-transform">
                <Accessibility className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Accessibility Modes</h3>
                <p className="text-xs text-slate-400">Adjust fonts, audio TTS & contrast</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </Link>

        </div>
      </div>

      {/* Dashboard Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Activity Bar Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" /> Weekly Learning Activity
            </h3>
            <span className="text-xs text-slate-400">Hours spent studying</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-800 pb-2">
            {weeklyData.map((d, idx) => {
              const heightPercent = Math.round((d.hours / maxHours) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-cyan-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.hours}h
                  </span>
                  <div
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                    className="w-full max-w-[28px] bg-gradient-to-t from-cyan-600 to-blue-400 rounded-t-md group-hover:from-cyan-400 group-hover:to-purple-400 transition-all duration-300 shadow-sm shadow-cyan-500/20"
                  />
                  <span className="text-xs text-slate-400 font-medium">{d.day}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 text-center">Peak productivity observed on Thursday (2.5 hours active research exploration).</p>
        </div>

        {/* Topic Interest Distribution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" /> Topic Interest Distribution
            </h3>
            <span className="text-xs text-slate-400">AI Profile Mapping</span>
          </div>

          <div className="space-y-3 pt-2">
            {topicDistribution.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">{item.topic}</span>
                  <span className="text-slate-400">{item.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
