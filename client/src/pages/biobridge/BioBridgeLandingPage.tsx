import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Dna,
  BookOpen,
  GraduationCap,
  Sparkles,
  Accessibility,
  ArrowRight,
  Activity,
  Cpu,
  Brain,
  Layers,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { SafetyDisclaimer } from '../../components/biobridge/SafetyDisclaimer';

export const BioBridgeLandingPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated background graphic (DNA helices & neural net nodes)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = 480);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = 480;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes for neural net & DNA strands
    const nodes: Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string }> = [];
    for (let i = 0; i < 45; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 1,
        color: i % 2 === 0 ? '#38bdf8' : '#c084fc'
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw DNA double helix lattice across background center
      ctx.lineWidth = 1;
      const points = 30;
      const amplitude = 35;
      const startX = width * 0.1;
      const endX = width * 0.9;
      const step = (endX - startX) / points;
      const centerY = height / 2;

      for (let i = 0; i <= points; i++) {
        const x = startX + i * step;
        const y1 = centerY + Math.sin(angle + i * 0.3) * amplitude;
        const y2 = centerY - Math.sin(angle + i * 0.3) * amplitude;

        // Connecting rung
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 + Math.sin(angle + i * 0.3) * 0.1})`;
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();

        // Helix 1 node
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(x, y1, 3, 0, Math.PI * 2);
        ctx.fill();

        // Helix 2 node
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(x, y2, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      angle += 0.02;

      // Draw neural network floating nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
          if (dist < 100) {
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.2 * (1 - dist / 100)})`;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-cyan-500/20 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
        
        {/* Canvas Animation Overlay */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold tracking-wide uppercase backdrop-blur-md shadow-lg shadow-cyan-500/10">
              <Dna className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Biotechnology + AI + Research + Biosensors + Accessibility</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-300 to-purple-400">
                APD EQUILEARN
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
              Empowering Diverse Learners Through Accessible Biotechnology Education and Innovation. Transforming complex biotechnology research into understandable knowledge and converting student interests into research-oriented biotechnology project ideas.
            </p>

            {/* Main User Journey Banner */}
            <div className="py-3 px-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-xl max-w-xl mx-auto">
              <p className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-2">The APD EQUILEARN Journey</p>
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200">
                <span className="text-cyan-300">LEARN</span>
                <span className="text-slate-500">→</span>
                <span className="text-blue-300">UNDERSTAND</span>
                <span className="text-slate-500">→</span>
                <span className="text-indigo-300">EXPLORE</span>
                <span className="text-slate-500">→</span>
                <span className="text-purple-300">MEASURE</span>
                <span className="text-slate-500">→</span>
                <span className="text-pink-300">INNOVATE</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/biobridge/dashboard"
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold shadow-xl shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <span>Explore APD EQUILEARN</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/biobridge/research"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-semibold hover:bg-slate-800 hover:text-white transition-all shadow-md"
              >
                <span>Start Learning</span>
                <BookOpen className="w-4 h-4 text-cyan-400" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Safety Disclaimer Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <SafetyDisclaimer />
      </section>

      {/* Main Feature Cards Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Four Core Ecosystem Pillars</h2>
          <p className="text-slate-400 mt-2 text-sm">Empowering biotechnology students with AI-assisted research analysis, examination practice, biomarker measurement, and accessible learning modes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Research */}
          <div className="group rounded-2xl bg-slate-900/80 border border-cyan-500/20 p-6 hover:border-cyan-400/60 transition-all duration-300 backdrop-blur-md hover:shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Research</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                AI-powered biotechnology research exploration. Multi-level paper simplifications (Beginner, Intermediate, Advanced), interactive structure visualizers, and paper-scoped AI chat.
              </p>
            </div>
            <Link
              to="/biobridge/research"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 group-hover:translate-x-1 transition-transform"
            >
              Explore Research <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Competitive */}
          <div className="group rounded-2xl bg-slate-900/80 border border-blue-500/20 p-6 hover:border-blue-400/60 transition-all duration-300 backdrop-blur-md hover:shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Competitive</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Concept-based biotechnology examination preparation for GATE and entrance exams. AI Concept Detection breaks down missed questions into core biological principles.
              </p>
            </div>
            <Link
              to="/biobridge/competitive"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 group-hover:translate-x-1 transition-transform"
            >
              Practice Exams <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Innovate */}
          <div className="group rounded-2xl bg-slate-900/80 border border-purple-500/20 p-6 hover:border-purple-400/60 transition-all duration-300 backdrop-blur-md hover:shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Innovate</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Convert biological interests into complete biotechnology project ideas. Generates 10-step biological workflows, methodology proposals, and biosensor transducer setups.
              </p>
            </div>
            <Link
              to="/biobridge/innovate"
              className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 group-hover:translate-x-1 transition-transform"
            >
              Generate Projects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 4: Accessibility */}
          <div className="group rounded-2xl bg-slate-900/80 border border-pink-500/20 p-6 hover:border-pink-400/60 transition-all duration-300 backdrop-blur-md hover:shadow-xl hover:shadow-pink-500/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-pink-950 border border-pink-500/40 flex items-center justify-center text-pink-400 mb-5 group-hover:scale-110 transition-transform">
                <Accessibility className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Accessibility</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Learn through multi-modal formats: adjustable font sizes, dyslexia-friendly fonts, high contrast, text-to-speech audio synthesis, visual summaries, and sign language placeholders.
              </p>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-sm font-semibold text-pink-400 hover:text-pink-300 group-hover:translate-x-1 transition-transform"
            >
              Adjust Preferences <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* Prominent USP Banner */}
      <section className="py-12 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/60 border-y border-cyan-500/20">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
            Core Value Proposition
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-100 leading-snug">
            “APD EQUILEARN transforms complex biotechnology research into understandable knowledge and converts student interests into research-oriented biotechnology project ideas, while integrating biosensor-based measurement concepts and inclusive learning technologies for diverse learners.”
          </h3>
        </div>
      </section>

      {/* Presenter Credit Bar */}
      <div className="w-full py-3 border-t border-slate-800/60 bg-slate-950/80 text-center">
        <p className="text-xs text-slate-500 tracking-wide">
          presented by{' '}
          <span className="text-slate-400 font-medium">K.S PRANAVI PREETHA</span>
          {', '}
          <span className="text-slate-400 font-medium">DARSHIKA.J</span>
          {', '}
          <span className="text-slate-400 font-medium">AASHAYA MARY PHILIP</span>
        </p>
      </div>

    </div>
  );
};
