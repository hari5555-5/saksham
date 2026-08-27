import React, { useEffect, useState, useRef } from 'react';
import {
  FlaskConical,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  Activity,
  Cpu,
  CheckCircle2,
  BookOpen,
  Search,
  ArrowRight,
  Zap,
  Volume2
} from 'lucide-react';
import { biobridgeApi } from '../../services/biobridgeApi';
import { BiotechExperiment } from '../../types/biobridge';
import { SafetyDisclaimer } from '../../components/biobridge/SafetyDisclaimer';
import { SignLanguageVideoPlayer } from '../../components/biobridge/SignLanguageVideoPlayer';

export const BioBridgeExperimentsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<BiotechExperiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeExp, setActiveExp] = useState<BiotechExperiment | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [explanationMode, setExplanationMode] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [searchQuery, setSearchQuery] = useState('');

  // Sign Language Modal state
  const [signModalOpen, setSignModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchExperiments = async () => {
    setLoading(true);
    try {
      const data = await biobridgeApi.getExperiments({ search: searchQuery || undefined });
      setExperiments(data);
      if (data.length > 0 && !activeExp) {
        setActiveExp(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  // Animated Experiment Simulation Canvas (Pipetting, Gel Band Migration, Electrochemical Signals)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const expTitle = activeExp?.title || '';

      if (expTitle.includes('PCR') || expTitle.includes('Electrophoresis')) {
        // Render Agarose Gel Electrophoresis Simulation
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(40, 20, canvas.width - 80, canvas.height - 40);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(40, 20, canvas.width - 80, canvas.height - 40);

        // Gel Lanes
        const lanes = [90, 170, 250, 330, 410];
        lanes.forEach((x, idx) => {
          // Well box
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x - 15, 30, 30, 15);
          ctx.strokeStyle = '#64748b';
          ctx.strokeRect(x - 15, 30, 30, 15);

          // Fluorescent DNA bands migrating
          const migration1 = 30 + ((t * 1.5 + idx * 10) % 180);
          const migration2 = 30 + ((t * 2.2 + idx * 15) % 160);

          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(x - 12, migration1, 24, 6);

          ctx.shadowColor = '#c084fc';
          ctx.fillStyle = '#c084fc';
          ctx.fillRect(x - 12, migration2, 24, 6);
          ctx.shadowBlur = 0;
        });

        // Direction arrow
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText('Negative Anode (-)', 50, 15);
        ctx.fillText('Positive Cathode (+) → Gel Band Migration', 250, 15);

      } else if (expTitle.includes('Glucose') || expTitle.includes('Biosensor')) {
        // Render Electrochemical Biosensor Transduction Current Simulation
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 25) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        // Draw Biosensor Electrode
        ctx.fillStyle = '#334155';
        ctx.fillRect(50, 180, 120, 40);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(170, 190, 80, 20); // Ag/AgCl Reference

        // Enzyme drop-cast layer
        ctx.fillStyle = 'rgba(192, 132, 252, 0.7)';
        ctx.beginPath();
        ctx.arc(110, 180, 25, Math.PI, Math.PI * 2);
        ctx.fill();

        // Target molecules binding & electron pulses
        ctx.fillStyle = '#38bdf8';
        for (let i = 0; i < 8; i++) {
          const px = 110 + Math.sin(t + i) * 35;
          const py = 150 + Math.cos(t * 1.5 + i) * 20;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Real-time Current Waveform (mA vs time)
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 270; x < canvas.width - 20; x += 5) {
          const y = 130 - Math.sin((x + t * 40) * 0.05) * 25 - (x - 270) * 0.15;
          if (x === 270) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#c084fc';
        ctx.font = '11px sans-serif';
        ctx.fillText('Amperometric Current Signal (uA)', 280, 40);
      } else {
        // Generic Pipetting & Reaction Simulation
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(180, 80, 140, 120);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(180, 80, 140, 120);

        ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
        const fluidH = 30 + Math.sin(t * 2) * 8;
        ctx.fillRect(182, 200 - fluidH, 136, fluidH);

        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(250, 40 + Math.sin(t * 3) * 15, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      if (isSimulating) {
        t += 0.04;
      }
      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [activeExp, isSimulating]);

  const biosensorData = activeExp?.biosensor_biomarker_data || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-cyan-500/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-xs font-semibold mb-2">
            <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
            <span>Virtual Biotech Lab & Experiments</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Biotechnology Experiments & Biosensor Workstation
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Explore step-by-step laboratory protocols, materials, animated simulations, real-time biosensor curves, and simplified scientific breakdowns.
          </p>
        </div>

        <button
          onClick={() => setSignModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold text-xs shadow-lg hover:scale-105 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Sign Language Video Player</span>
        </button>
      </div>

      <SafetyDisclaimer compact />

      {/* Main Experiment Selector Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <span className="text-xs text-slate-400 font-bold shrink-0 uppercase">Select Experiment:</span>
          {experiments.map((exp) => (
            <button
              key={exp.id}
              onClick={() => {
                setActiveExp(exp);
                setActiveStepIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeExp?.id === exp.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {exp.title}
            </button>
          ))}
        </div>
      </div>

      {activeExp && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* 1. AIM SECTION */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Experiment AIM & Objective</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-100">{activeExp.title}</h2>
            <p className="text-base text-cyan-200 font-medium leading-relaxed bg-slate-950/70 p-4 rounded-2xl border border-cyan-500/20">
              <strong className="text-white font-bold">AIM: </strong>{activeExp.aim}
            </p>
          </div>

          {/* 2. MATERIALS REQUIRED SECTION */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" /> Material & Reagents Required
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {activeExp.materials.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                  <span className="w-6 h-6 rounded-full bg-purple-950 text-purple-300 font-bold flex items-center justify-center shrink-0 border border-purple-500/30">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. ANIMATED VIDEO & STEP-BY-STEP PROCEDURE SIMULATOR */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
                  <Play className="w-5 h-5 text-cyan-400" /> Animated Video & Lab Procedure Simulator
                </h3>
                <p className="text-xs text-slate-400">Step-by-step visual animation of laboratory execution</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
                >
                  {isSimulating ? 'Pause Animation' : 'Resume Animation'}
                </button>
              </div>
            </div>

            {/* Canvas Visual Simulator */}
            <div className="flex flex-col items-center justify-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <canvas
                ref={canvasRef}
                width={520}
                height={260}
                className="rounded-2xl border border-cyan-500/30 shadow-lg w-full max-w-[520px] bg-slate-950"
              />
            </div>

            {/* Step-by-step Procedure Carousel */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Procedure Steps:</span>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {activeExp.procedure_steps.map((stepObj) => (
                  <div
                    key={stepObj.step}
                    onClick={() => setActiveStepIndex(stepObj.step - 1)}
                    className={`cursor-pointer p-3.5 rounded-2xl border text-xs transition-all space-y-1 ${
                      activeStepIndex === stepObj.step - 1
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-cyan-400 block text-[10px]">Step {stepObj.step}</span>
                    <h4 className="font-bold text-slate-100 text-xs line-clamp-1">{stepObj.title}</h4>
                    <p className="text-[11px] line-clamp-3 text-slate-300">{stepObj.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. DATA CONNECTED TO BIOSENSOR AND BIOMARKER */}
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30 text-xs font-semibold mb-1">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                <span>Live Biosensor & Biomarker Data Curve</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-100">Quantified Biosensor Measurements</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {Object.entries(biosensorData).map(([key, val]) => (
                <div key={key} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">{key.replace(/_/g, ' ')}</span>
                  <p className="text-sm font-black text-cyan-300">{String(val)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 5. HOW TO SIMPLIFY SECTION */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" /> How to Simplify — Multi-Level Scientific Breakdown
                </h3>
                <p className="text-xs text-slate-400">Toggle explanation mode tailored for different learning levels</p>
              </div>

              {/* Toggles */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setExplanationMode('beginner')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    explanationMode === 'beginner' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Beginner
                </button>
                <button
                  onClick={() => setExplanationMode('intermediate')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    explanationMode === 'intermediate' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Intermediate
                </button>
                <button
                  onClick={() => setExplanationMode('advanced')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    explanationMode === 'advanced' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Advanced
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-200 leading-relaxed font-medium">
              {explanationMode === 'beginner' && activeExp.simplified_beginner}
              {explanationMode === 'intermediate' && activeExp.simplified_intermediate}
              {explanationMode === 'advanced' && activeExp.simplified_advanced}
            </div>
          </div>

        </div>
      )}

      {/* Universal Sign Language Modal */}
      <SignLanguageVideoPlayer
        isOpen={signModalOpen}
        onClose={() => setSignModalOpen(false)}
        initialTopic="PCR"
      />

    </div>
  );
};
