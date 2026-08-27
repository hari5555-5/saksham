import React, { useEffect, useState } from 'react';
import {
  Activity,
  Search,
  Dna,
  Filter,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle,
  BarChart2
} from 'lucide-react';
import { biobridgeApi } from '../../services/biobridgeApi';
import { Biomarker } from '../../types/biobridge';
import { SafetyDisclaimer } from '../../components/biobridge/SafetyDisclaimer';

export const BioBridgeBiomarkersPage: React.FC = () => {
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeBiomarker, setActiveBiomarker] = useState<Biomarker | null>(null);

  const categories = ['All', 'Proteins', 'Hormones', 'Metabolites', 'Genes', 'RNA', 'Molecular Marker'];

  const fetchBiomarkers = async () => {
    setLoading(true);
    try {
      const data = await biobridgeApi.getBiomarkers({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined
      });
      setBiomarkers(data);
      if (data.length > 0 && !activeBiomarker) {
        setActiveBiomarker(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiomarkers();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Page Header */}
      <div className="border-b border-cyan-500/20 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Molecular Measurement & Biosensing</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Biomarker Exploration Module
        </h1>
        <p className="text-slate-400 text-sm max-w-3xl">
          Explore proteins, hormones, metabolites, genes, and RNA. Trace how cellular targets transition into point-of-care biosensor applications through our 7-step workflow.
        </p>
      </div>

      <SafetyDisclaimer compact />

      {/* 7-STEP VISUAL WORKFLOW BANNER */}
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-cyan-300 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" /> 7-Step Biological Measurement Workflow
          </h2>
          <span className="text-xs text-slate-400 font-medium">Standard APD EQUILEARN Pipeline</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold">1. Question</span>
            <p className="text-[11px] text-slate-400">Biological Query</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-blue-400 font-bold">2. Target</span>
            <p className="text-[11px] text-slate-400">Biomarker Molecule</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-indigo-400 font-bold">3. Detection</span>
            <p className="text-[11px] text-slate-400">Method & Probe</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-purple-400 font-bold">4. Biosensor</span>
            <p className="text-[11px] text-slate-400">Transducer Setup</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-pink-400 font-bold">5. Data</span>
            <p className="text-[11px] text-slate-400">Signal Measurement</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold">6. AI Interpretation</span>
            <p className="text-[11px] text-slate-400">Curve Fitting</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold">7. Project Idea</span>
            <p className="text-[11px] text-slate-400">Biotech Innovation</p>
          </div>
        </div>
      </div>

      {/* Category Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyUp={fetchBiomarkers}
            placeholder="Search biomarker..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 outline-none"
          />
        </div>
      </div>

      {/* Main Grid & Active Focus Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Biomarker List (Left 1 col) */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Select Biomarker</h3>
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-xs">Loading biomarkers...</div>
          ) : biomarkers.map((b) => (
            <div
              key={b.name}
              onClick={() => setActiveBiomarker(b)}
              className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                activeBiomarker?.name === b.name
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-md shadow-cyan-950/40'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-sm">{b.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-cyan-300 font-medium">
                  {b.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{b.function}</p>
            </div>
          ))}
        </div>

        {/* Selected Biomarker Details & Workflow Mapping (Right 2 cols) */}
        <div className="lg:col-span-2">
          {activeBiomarker ? (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-xl">
              
              {/* Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                    {activeBiomarker.type}
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-100 mt-2">{activeBiomarker.name}</h2>
                  <p className="text-xs text-cyan-400 font-medium mt-0.5">Research Area: {activeBiomarker.research_area}</p>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs space-y-1 text-right">
                  <span className="text-slate-400 block font-medium">Biosensor Potential</span>
                  <span className="text-cyan-300 font-bold">{activeBiomarker.biosensor_potential}</span>
                </div>
              </div>

              {/* Functional Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-slate-200">Biological Function</h4>
                  <p className="text-slate-300 leading-relaxed">{activeBiomarker.function}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-slate-200">Why It Is Measured</h4>
                  <p className="text-slate-300 leading-relaxed">{activeBiomarker.why_measured}</p>
                </div>
              </div>

              {/* Detection Methods */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <h4 className="font-bold text-cyan-400">Detection & Assay Methods</h4>
                <p className="text-slate-300">{activeBiomarker.detection_methods}</p>
              </div>

              {/* Applied 7-Step Workflow Mapping for this Biomarker */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-cyan-950/30 to-slate-950 border border-cyan-500/20 space-y-3">
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> Applied Biosensor Pipeline for {activeBiomarker.name}
                </h4>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0">1</span>
                    <p className="text-slate-300"><strong className="text-white">Question:</strong> How to rapidly quantify {activeBiomarker.name} in clinical samples?</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center shrink-0">2</span>
                    <p className="text-slate-300"><strong className="text-white">Target:</strong> {activeBiomarker.name} ({activeBiomarker.type})</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0">3</span>
                    <p className="text-slate-300"><strong className="text-white">Biosensor Transducer:</strong> Immobilized probe on screen-printed electrode</p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-sm">Select a biomarker to inspect details.</div>
          )}
        </div>

      </div>

    </div>
  );
};
