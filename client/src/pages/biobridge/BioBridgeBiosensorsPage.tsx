import React, { useState } from 'react';
import {
  Cpu,
  Activity,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  Award,
  Zap
} from 'lucide-react';
import { biobridgeApi } from '../../services/biobridgeApi';
import { BiosensorDesignResult } from '../../types/biobridge';
import { SafetyDisclaimer } from '../../components/biobridge/SafetyDisclaimer';

export const BioBridgeBiosensorsPage: React.FC = () => {
  const [target, setTarget] = useState<string>('Glucose');
  const [bioreceptor, setBioreceptor] = useState<string>('Enzyme (e.g. Glucose Oxidase)');
  const [transducer, setTransducer] = useState<string>('Electrochemical');
  const [measurement, setMeasurement] = useState<string>('Electrical current (Amperometric)');

  const [loading, setLoading] = useState<boolean>(false);
  const [designResult, setDesignResult] = useState<BiosensorDesignResult | null>(null);

  const targets = ['Glucose', 'MicroRNA-21', 'Estradiol (E2)', 'BDNF Protein', 'Lactate', 'Pathogen DNA', 'Troponin I'];
  const bioreceptors = ['Enzyme (e.g. Glucose Oxidase)', 'Antibody', 'Aptamer (Nucleic acid probe)', 'Receptor Protein', 'Cellular Probe'];
  const transducers = ['Electrochemical', 'Optical (SPR / Fluorescence)', 'Piezoelectric (Quartz Crystal Microbalance)', 'Thermal'];
  const measurements = ['Electrical current (Amperometric)', 'Voltage shift (Potentiometric)', 'Optical intensity', 'Fluorescence change', 'Color change'];

  const handleDesignEvaluate = async () => {
    setLoading(true);
    setDesignResult(null);

    try {
      const res = await biobridgeApi.designBiosensor(target, bioreceptor, transducer, measurement);
      setDesignResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Header Banner */}
      <div className="border-b border-cyan-500/20 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950 text-pink-300 border border-pink-500/30 text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5 text-pink-400" />
          <span>Interactive Biosensor Workstation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Biosensor Innovation Module
        </h1>
        <p className="text-slate-400 text-sm max-w-3xl">
          Design custom biosensor transduction setups by selecting target analytes, bioreceptors, transducers, and signal outputs. APD EQUILEARN evaluates sensing feasibility and project potential.
        </p>
      </div>

      <SafetyDisclaimer compact />

      {/* Interactive Flow Visual Banner */}
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <h2 className="text-xs uppercase font-bold tracking-widest text-cyan-400">Core Biosensor Transduction Flow</h2>
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200 overflow-x-auto gap-2 py-2">
          <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 text-center shrink-0">
            <span className="text-cyan-400 block text-[10px]">Target / Analyte</span>
            <span>{target}</span>
          </div>
          <span className="text-slate-500">→</span>
          <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/30 text-center shrink-0">
            <span className="text-blue-400 block text-[10px]">Bioreceptor</span>
            <span>{bioreceptor.split(' ')[0]}</span>
          </div>
          <span className="text-slate-500">→</span>
          <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 text-center shrink-0">
            <span className="text-purple-400 block text-[10px]">Transducer</span>
            <span>{transducer}</span>
          </div>
          <span className="text-slate-500">→</span>
          <div className="p-3 rounded-xl bg-slate-950 border border-pink-500/30 text-center shrink-0">
            <span className="text-pink-400 block text-[10px]">Signal</span>
            <span>{measurement.split(' ')[0]}</span>
          </div>
          <span className="text-slate-500">→</span>
          <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-center shrink-0">
            <span className="text-emerald-400 block text-[10px]">Measurement</span>
            <span>Quantified Output</span>
          </div>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Choice 1: Target */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="block text-xs font-bold text-cyan-400 uppercase">1. Biological Target</label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 outline-none"
          >
            {targets.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Choice 2: Bioreceptor */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="block text-xs font-bold text-blue-400 uppercase">2. Bioreceptor</label>
          <select
            value={bioreceptor}
            onChange={(e) => setBioreceptor(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 outline-none"
          >
            {bioreceptors.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Choice 3: Transducer */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="block text-xs font-bold text-purple-400 uppercase">3. Transducer</label>
          <select
            value={transducer}
            onChange={(e) => setTransducer(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 outline-none"
          >
            {transducers.map((tr) => (
              <option key={tr} value={tr}>{tr}</option>
            ))}
          </select>
        </div>

        {/* Choice 4: Measurement Signal */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="block text-xs font-bold text-pink-400 uppercase">4. Measurement Signal</label>
          <select
            value={measurement}
            onChange={(e) => setMeasurement(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 outline-none"
          >
            {measurements.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

      </div>

      <div className="text-center">
        <button
          onClick={handleDesignEvaluate}
          disabled={loading}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 text-white font-bold text-sm shadow-xl hover:scale-105 transition-all disabled:opacity-50"
        >
          {loading ? 'Evaluating Transduction Feasibility...' : 'Evaluate Biosensor Feasibility & AI Recommendation'}
        </button>
      </div>

      {/* AI Biosensor Recommendation Results Card */}
      {designResult && (
        <div className="bg-slate-900/90 border border-pink-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-pink-950 text-pink-300 border border-pink-500/30 text-xs font-semibold">
                AI Biosensor Recommendation
              </span>
              <h2 className="text-2xl font-extrabold text-slate-100 mt-2">
                {designResult.target} Sensor ({designResult.transducer})
              </h2>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">Feasibility Score</span>
              <span className="text-2xl font-black text-emerald-300">{designResult.feasibility_score} / 100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <h4 className="font-bold text-cyan-400">Sensing Mechanism</h4>
              <p className="text-slate-300 leading-relaxed">{designResult.sensing_mechanism}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <h4 className="font-bold text-purple-400">Recommended Experimental Setup</h4>
              <p className="text-slate-300 leading-relaxed">{designResult.recommended_setup}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <h4 className="font-bold text-pink-400">Measurement Strategy</h4>
            <p className="text-slate-300">{designResult.measurement_strategy}</p>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200">
            <strong className="text-cyan-400">Educational Note: </strong>{designResult.educational_disclaimer}
          </div>
        </div>
      )}

    </div>
  );
};
