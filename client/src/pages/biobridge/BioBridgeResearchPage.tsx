import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Search,
  Upload,
  Plus,
  Dna,
  Filter,
  Sparkles,
  Layers,
  Bot,
  Send,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Users,
  ChevronRight,
  Microscope,
  FileText
} from 'lucide-react';
import { biobridgeApi } from '../../services/biobridgeApi';
import { ResearchPaper, PaperAnalysis } from '../../types/biobridge';
import { SafetyDisclaimer } from '../../components/biobridge/SafetyDisclaimer';
import { PrintableTactileFlashcard } from '../../components/biobridge/PrintableTactileFlashcard';

export const BioBridgeResearchPage: React.FC = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showTransgenderPathway, setShowTransgenderPathway] = useState<boolean>(false);
  const [showAutismPathway, setShowAutismPathway] = useState<boolean>(false);

  // Upload Paper Modal state
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    abstract: '',
    authors: '',
    category: 'Biotechnology',
    topic: '',
    methodology: '',
    biomarkers: ''
  });

  // AI Processing Analysis View Modal
  const [activePaper, setActivePaper] = useState<ResearchPaper | null>(null);
  const [paperAnalysis, setPaperAnalysis] = useState<PaperAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [explanationLevel, setExplanationLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  // "Ask the Paper" Chatbot state
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const categories = [
    'All',
    'Genetics',
    'Genomics',
    'Molecular Biology',
    'Biotechnology',
    'Cancer Biology',
    'Neurobiology',
    'Biosensors',
    'Metabolomics',
    'Microbiology',
    'Biomedical Engineering',
    'Neurodevelopment',
    'Gender-Affirming Healthcare Research'
  ];

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const data = await biobridgeApi.getResearchPapers({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        transgender_pathway: showTransgenderPathway,
        autism_pathway: showAutismPathway
      });
      setPapers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [selectedCategory, showTransgenderPathway, showAutismPathway]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPapers();
  };

  const handleOpenPaperAnalysis = async (paper: ResearchPaper) => {
    setActivePaper(paper);
    setAnalysisLoading(true);
    setPaperAnalysis(null);
    setChatHistory([
      {
        sender: 'ai',
        text: `I am ready to answer questions about **"${paper.title}"**. Ask me to explain the methodology, biomarkers, or key findings!`
      }
    ]);

    try {
      const res = await biobridgeApi.analyzePaper(paper.id, paper);
      setPaperAnalysis(res.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleAskPaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuestion.trim() || !activePaper || chatLoading) return;

    const q = chatQuestion;
    setChatQuestion('');
    setChatHistory(prev => [...prev, { sender: 'user', text: q }]);
    setChatLoading(true);

    try {
      const ans = await biobridgeApi.askPaper(activePaper, q);
      setChatHistory(prev => [...prev, { sender: 'ai', text: ans }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: 'ai', text: 'Error fetching paper answer.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.title || !uploadData.abstract) return;

    try {
      await biobridgeApi.uploadResearchPaper(uploadData);
      setShowUploadModal(false);
      setUploadData({
        title: '',
        abstract: '',
        authors: '',
        category: 'Biotechnology',
        topic: '',
        methodology: '',
        biomarkers: ''
      });
      fetchPapers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-cyan-500/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inclusive Biotechnology Library</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Research — Biotechnology Research Simplified
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Discover, upload, and break down complex research papers into multi-level summaries, visual workflows, and paper-scoped AI chat.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all text-sm shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Paper</span>
        </button>
      </div>

      {/* Safety Disclaimer */}
      <SafetyDisclaimer compact />

      {/* Discovery Pathways Toggle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Transgender Health Research Pathway */}
        <div
          onClick={() => {
            setShowTransgenderPathway(!showTransgenderPathway);
            if (!showTransgenderPathway) setShowAutismPathway(false);
          }}
          className={`cursor-pointer p-5 rounded-2xl border transition-all ${
            showTransgenderPathway
              ? 'bg-purple-950/40 border-purple-400 shadow-lg shadow-purple-500/10'
              : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-950 text-purple-300 border border-purple-500/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">Transgender Health Research Pathway</h3>
                <p className="text-xs text-slate-400">Gender-affirming hormone therapy metabolomics & biomarker shifts (Authored by Trans Researchers)</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${showTransgenderPathway ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
              {showTransgenderPathway ? 'Active' : 'Explore'}
            </div>
          </div>
        </div>

        {/* Autism & Neurodevelopment Pathway */}
        <div
          onClick={() => {
            setShowAutismPathway(!showAutismPathway);
            if (!showAutismPathway) setShowTransgenderPathway(false);
          }}
          className={`cursor-pointer p-5 rounded-2xl border transition-all ${
            showAutismPathway
              ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/10'
              : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                <Microscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">Autism & Neurodevelopment Pathway</h3>
                <p className="text-xs text-slate-400">Genomics, gut microbiome signaling & BDNF neuro-metabolic mechanisms</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${showAutismPathway ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
              {showAutismPathway ? 'Active' : 'Explore'}
            </div>
          </div>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, paper title, author, or biomarker (e.g. Estradiol, MicroRNA, BDNF)..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-sm text-slate-100 outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-400 hover:bg-slate-800 text-sm font-semibold transition-colors"
          >
            Search
          </button>
        </form>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setShowTransgenderPathway(false);
                setShowAutismPathway(false);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat && !showTransgenderPathway && !showAutismPathway
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Research Paper List Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading biotechnology research papers...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-200">No research papers found</h3>
          <p className="text-slate-400 text-xs mt-1">Try adjusting your search criteria or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {papers.map((paper) => (
            <div
              key={paper.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 transition-all backdrop-blur-md flex flex-col justify-between space-y-4 group hover:shadow-xl shadow-cyan-950/20"
            >
              <div className="space-y-3">
                
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    {paper.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300">
                    {paper.publication_year}
                  </span>
                  {paper.is_transgender_pathway === 1 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-950 text-purple-300 border border-purple-500/30">
                      Transgender Health Pathway
                    </span>
                  )}
                  {paper.is_autism_pathway === 1 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-950 text-blue-300 border border-blue-500/30">
                      Autism Pathway
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-100 leading-snug group-hover:text-cyan-300 transition-colors">
                  {paper.title}
                </h3>

                <p className="text-xs text-cyan-400/90 font-medium">
                  Authors: <span className="text-slate-300">{paper.authors}</span>
                </p>

                <p className="text-slate-300 text-xs line-clamp-3 leading-relaxed">
                  {paper.abstract}
                </p>

                {paper.biomarkers && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                    <span className="text-cyan-400 font-semibold">Key Biomarkers: </span>
                    <span className="text-slate-300">{paper.biomarkers}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400">{paper.source || 'Peer-Reviewed Journal'}</span>
                <button
                  onClick={() => handleOpenPaperAnalysis(paper)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold shadow-md hover:scale-105 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Paper Breakdown</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6-STEP AI PAPER ANALYSIS MODAL */}
      {activePaper && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-cyan-500/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-100 line-clamp-1">{activePaper.title}</h2>
                  <p className="text-xs text-cyan-300">AI Research Processing & Breakdown</p>
                </div>
              </div>
              <button
                onClick={() => setActivePaper(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-8">
              
              {analysisLoading ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-slate-300 font-medium text-sm">APD EQUILEARN is extracting methodology, biomarkers, and simplified summaries...</p>
                </div>
              ) : paperAnalysis ? (
                <>
                  {/* STEP 1 — Simplified Summary */}
                  <div className="space-y-4 bg-slate-950/70 border border-cyan-500/20 rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 text-xs flex items-center justify-center font-black">1</span>
                        Step 1 — Simplified Explanation Mode
                      </h3>

                      {/* Mode Toggles */}
                      <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                        <button
                          onClick={() => setExplanationLevel('beginner')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            explanationLevel === 'beginner' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Beginner
                        </button>
                        <button
                          onClick={() => setExplanationLevel('intermediate')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            explanationLevel === 'intermediate' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Intermediate
                        </button>
                        <button
                          onClick={() => setExplanationLevel('advanced')}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            explanationLevel === 'advanced' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Advanced
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 text-sm text-slate-200 leading-relaxed border border-slate-800">
                      {explanationLevel === 'beginner' && paperAnalysis.beginner_summary}
                      {explanationLevel === 'intermediate' && paperAnalysis.intermediate_summary}
                      {explanationLevel === 'advanced' && paperAnalysis.advanced_summary}
                    </div>
                  </div>

                  {/* STEP 2 — Research Structure Workflow */}
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-black">2</span>
                      Step 2 — Research Structure Workflow
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-cyan-400 font-bold uppercase text-[10px]">Research Question</span>
                        <p className="text-slate-200">{paperAnalysis.structure.question}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-blue-400 font-bold uppercase text-[10px]">Sample / Participants</span>
                        <p className="text-slate-200">{paperAnalysis.structure.sample}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-indigo-400 font-bold uppercase text-[10px]">Biomarkers / Targets</span>
                        <p className="text-slate-200">{paperAnalysis.structure.biomarkers}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-purple-400 font-bold uppercase text-[10px]">Methodology</span>
                        <p className="text-slate-200">{paperAnalysis.structure.methodology}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-pink-400 font-bold uppercase text-[10px]">Results</span>
                        <p className="text-slate-200">{paperAnalysis.structure.results}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-emerald-400 font-bold uppercase text-[10px]">Biological Meaning</span>
                        <p className="text-slate-200">{paperAnalysis.structure.biological_meaning}</p>
                      </div>
                    </div>
                  </div>

                  {/* STEP 3 — Methodology Simplification */}
                  <div className="space-y-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-black">3</span>
                      Step 3 — Detailed Methodology Breakdown
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium">Study Design:</span>
                        <p className="text-slate-200 font-semibold">{paperAnalysis.methodology_breakdown.study_design}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Lab Methods:</span>
                        <p className="text-slate-200 font-semibold">{paperAnalysis.methodology_breakdown.lab_methods}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Technologies Used:</span>
                        <p className="text-slate-200 font-semibold">{paperAnalysis.methodology_breakdown.technologies}</p>
                      </div>
                    </div>
                  </div>

                  {/* STEP 4 — Results Cards */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-black">4</span>
                      Step 4 — Visual Results Summaries
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {paperAnalysis.results_cards.map((res, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20 space-y-1">
                          <h4 className="font-bold text-cyan-300 text-sm">{res.title}</h4>
                          <p className="text-xs text-slate-300">{res.description}</p>
                          <span className="inline-block text-[10px] text-cyan-400 font-medium bg-cyan-950 px-2 py-0.5 rounded-full mt-1">
                            {res.significance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* STEP 5 — Ask the Paper Chatbot */}
                  <div className="space-y-4 bg-slate-950 border border-cyan-500/30 rounded-2xl p-5">
                    <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 text-xs flex items-center justify-center font-black">5</span>
                      Step 5 — Ask the Paper Chatbot
                    </h3>

                    {/* Chat History */}
                    <div className="h-44 overflow-y-auto space-y-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                      {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] px-3.5 py-2.5 rounded-xl ${msg.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-200 border border-slate-800'}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <p className="text-cyan-400 text-xs animate-pulse">BioBridge AI reading paper context...</p>
                      )}
                    </div>

                    <form onSubmit={handleAskPaperSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={chatQuestion}
                        onChange={(e) => setChatQuestion(e.target.value)}
                        placeholder='Ask e.g. "Explain this methodology simply", "What was the main biomarker?"'
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 outline-none focus:border-cyan-400"
                      />
                      <button
                        type="submit"
                        disabled={chatLoading || !chatQuestion.trim()}
                        className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-semibold text-xs hover:bg-cyan-500 transition-colors disabled:opacity-50"
                      >
                        Ask
                      </button>
                    </form>
                  </div>

                  {/* STEP 6 — Related Research */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs flex items-center justify-center font-black">6</span>
                      Step 6 — Related Research & Concepts
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {paperAnalysis.related_research.map((rel, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                          <p className="font-bold text-slate-200">{rel.title}</p>
                          <p className="text-slate-400">Concept: <span className="text-cyan-400 font-semibold">{rel.concept}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ACCESSIBLE TACTILE FLASHCARD FOR PRINT & BLIND LEARNERS */}
                  <div className="pt-4 border-t border-slate-800">
                    <PrintableTactileFlashcard
                      title={activePaper.title}
                      categoryOrExam={activePaper.category}
                      summaryOrQuestion={paperAnalysis.beginner_summary}
                      keyPointsOrExplanation={[
                        `Methodology: ${activePaper.methodology}`,
                        `Biomarkers: ${activePaper.biomarkers || 'Specified target molecular markers'}`,
                        `Biological Meaning: ${activePaper.biological_meaning || 'Structural cellular insights'}`
                      ]}
                      biomarkerOrConcept={activePaper.biomarkers || activePaper.topic}
                      simplifiedTakeaway={paperAnalysis.intermediate_summary}
                    />
                  </div>
                </>
              ) : null}

            </div>
          </div>
        </div>
      )}

      {/* UPLOAD PAPER MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 flex items-center justify-center">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100">Upload / Add Research Paper</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Paper Title *</label>
                <input
                  type="text"
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 outline-none"
                  placeholder="e.g. MicroRNA biomarkers in Breast Exosomes..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Authors</label>
                <input
                  type="text"
                  value={uploadData.authors}
                  onChange={(e) => setUploadData({ ...uploadData, authors: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 outline-none"
                  placeholder="e.g. Dr. Alex Ramsey, PhD..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Abstract *</label>
                <textarea
                  rows={4}
                  required
                  value={uploadData.abstract}
                  onChange={(e) => setUploadData({ ...uploadData, abstract: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 outline-none"
                  placeholder="Paste abstract or paper content..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Biomarkers (optional)</label>
                <input
                  type="text"
                  value={uploadData.biomarkers}
                  onChange={(e) => setUploadData({ ...uploadData, biomarkers: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 outline-none"
                  placeholder="e.g. Estradiol, MicroRNA-21..."
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-semibold shadow-md"
                >
                  Save & Analyze
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
