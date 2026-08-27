import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Dna,
  Cpu,
  Download,
  BookOpen,
  CheckCircle2,
  Layers,
  ArrowRight,
  RefreshCw,
  FolderPlus
} from 'lucide-react';
import { biobridgeApi } from '../../services/biobridgeApi';
import { ProjectIdea } from '../../types/biobridge';
import { SafetyDisclaimer } from '../../components/biobridge/SafetyDisclaimer';

export const BioBridgeInnovatePage: React.FC = () => {
  const [interestPrompt, setInterestPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<ProjectIdea | null>(null);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);

  const examplePrompts = [
    "I am interested in genetics and cancer",
    "I want to explore glucose and wearable biosensors",
    "Estrogen biomarkers in gender-affirming hormone therapy",
    "Gut microbiome metabolites and autism neurodevelopment"
  ];

  const fetchSavedProjects = async () => {
    try {
      const list = await biobridgeApi.getSavedProjects();
      setSavedProjects(list);
    } catch (err) {}
  };

  useEffect(() => {
    fetchSavedProjects();
  }, []);

  const handleGenerate = async (promptToUse?: string) => {
    const query = promptToUse || interestPrompt;
    if (!query.trim() || loading) return;

    setLoading(true);
    setGeneratedProject(null);

    try {
      const proj = await biobridgeApi.generateProjectIdea(query);
      setGeneratedProject(proj);
      fetchSavedProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportProposal = () => {
    if (!generatedProject) return;
    const text = `APD EQUILEARN PROJECT PROPOSAL\n\nTitle: ${generatedProject.title}\n\nProblem Statement:\n${generatedProject.problem_statement}\n\nResearch Question:\n${generatedProject.research_question}\n\nBiomarker Target: ${generatedProject.biomarker}\nMethodology: ${generatedProject.methodology}\nBiosensor Potential: ${generatedProject.biosensor_possibility}\n\nExported from APD EQUILEARN Platform.`;
    
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${generatedProject.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_proposal.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Header Banner */}
      <div className="border-b border-cyan-500/20 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Biotechnology Innovation Generator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Innovate — From Interest to Biotechnology Project
        </h1>
        <p className="text-slate-400 text-sm max-w-3xl">
          Enter your biological interests, research curiosity, or target health areas. APD EQUILEARN generates complete 10-step project proposals, biomarker targets, and biosensor configurations.
        </p>
      </div>

      <SafetyDisclaimer compact />

      {/* AI Prompt Input Card */}
      <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" /> Enter Your Biotechnology Interest
        </h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={interestPrompt}
            onChange={(e) => setInterestPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder='e.g. "I am interested in genetics and cancer", "Glucose biosensors in sweat"...'
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 focus:border-purple-400 text-sm text-slate-100 outline-none"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={loading || !interestPrompt.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-sm shadow-xl hover:scale-105 transition-all disabled:opacity-40"
          >
            <span>Generate Project</span>
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Example Prompts */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2">
          <span className="text-xs text-slate-400 font-medium shrink-0">Try examples:</span>
          {examplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInterestPrompt(p);
                handleGenerate(p);
              }}
              className="px-3 py-1 rounded-xl bg-slate-950 hover:bg-purple-950 text-slate-300 hover:text-purple-300 border border-slate-800 text-xs font-medium whitespace-nowrap transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Project Result */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-300 font-medium text-sm">APD EQUILEARN is synthesizing biological target, biomarker, and biosensor setup...</p>
        </div>
      ) : generatedProject ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Main Proposal Card */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                  AI Generated Project Proposal
                </span>
                <h2 className="text-2xl font-extrabold text-slate-100 mt-2">{generatedProject.title}</h2>
              </div>

              <button
                onClick={handleExportProposal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-all shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Export Proposal Report</span>
              </button>
            </div>

            {/* 10-STEP BIOLOGICAL WORKFLOW VISUAL */}
            <div className="space-y-3 bg-slate-950/80 border border-cyan-500/20 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <Layers className="w-4 h-4" /> 10-Step Biological Project Development Workflow
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {generatedProject.workflow_steps?.map((w) => (
                  <div key={w.step} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-cyan-400 font-bold">Step {w.step}</span>
                    <p className="text-slate-200 font-semibold text-[11px] line-clamp-1">{w.label}</p>
                    <p className="text-slate-400 text-[10px] line-clamp-2">{w.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Structured Project Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="font-bold text-cyan-400">Problem Statement</h4>
                <p className="text-slate-300 leading-relaxed">{generatedProject.problem_statement}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="font-bold text-blue-400">Research Question</h4>
                <p className="text-slate-300 leading-relaxed">{generatedProject.research_question}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="font-bold text-purple-400">Target Biomarker</h4>
                <p className="text-slate-300 font-semibold">{generatedProject.biomarker}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="font-bold text-pink-400">Biosensor Possibility</h4>
                <p className="text-slate-300 font-semibold">{generatedProject.biosensor_possibility}</p>
              </div>

            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <h4 className="font-bold text-emerald-400">Suggested Methodology & Experimental Approach</h4>
              <p className="text-slate-300 leading-relaxed">{generatedProject.methodology}</p>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-800">
              <span className="text-xs text-slate-400">Want to test transducers for this biomarker?</span>
              <Link
                to="/biobridge/biosensors"
                className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                <span>Design Biosensor Prototype</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
};
