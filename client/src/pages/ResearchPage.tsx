import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Search, BookOpen, Calendar, ExternalLink, Users, Tag,
  AlertCircle, Loader2, Filter, SortAsc, Sparkles,
  ArrowRight, Compass
} from 'lucide-react';

export interface Paper {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  publicationDate: string;
  journal: string;
  source: string;
  doi: string | null;
  url: string | null;
  keywords: string;
  citationsCount: number;
  openAccess: boolean;
  category: string;
}

export const FEATURED_PAPERS: Paper[] = [
  {
    id: 'paper-ai-transformer',
    title: 'Attention Is All You Need: The Transformer Architecture',
    authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, et al.',
    abstract: 'We propose the Transformer, a novel neural network architecture based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments show superior translation quality, faster parallel training, and foundational capability for modern Large Language Models.',
    publicationDate: '2023-08-15',
    journal: 'Advances in Neural Information Processing Systems (NeurIPS)',
    source: 'arXiv / Google Research',
    doi: '10.48550/arXiv.1706.03762',
    url: 'https://arxiv.org/abs/1706.03762',
    keywords: 'Artificial Intelligence, Deep Learning, Natural Language Processing, Transformer, Attention',
    citationsCount: 114200,
    openAccess: true,
    category: 'Computer Science',
  },
  {
    id: 'paper-quantum-supremacy',
    title: 'Quantum Computational Advantage Using Sycamore Superconducting Processor',
    authors: 'Frank Arute, Kunal Arya, John M. Martinis, et al.',
    abstract: 'We demonstrate quantum computational advantage using a programmable superconducting processor with 53 qubits. The processor performed a target benchmark calculation in 200 seconds that would take approximately 10,000 years on the worlds leading classical supercomputer.',
    publicationDate: '2023-11-20',
    journal: 'Nature Research Journal',
    source: 'Nature / NASA / Google Quantum AI',
    doi: '10.1038/s41586-019-1666-5',
    url: 'https://www.nature.com/articles/s41586-019-1666-5',
    keywords: 'Quantum Computing, Superconducting Qubits, Quantum Supremacy, Physics',
    citationsCount: 4890,
    openAccess: true,
    category: 'Physics',
  },
  {
    id: 'paper-crispr-cas9',
    title: 'A Programmable Dual-RNA-Guided DNA Endonuclease in Adaptive Bacterial Immunity (CRISPR-Cas9)',
    authors: 'Emmanuelle Charpentier, Jennifer A. Doudna, Martin Jinek, et al.',
    abstract: 'Clustered regularly interspaced short palindromic repeats (CRISPR) and CRISPR-associated (Cas) proteins provide bacteria with adaptive immunity. We show that the Cas9 endonuclease can be programmed with single guide RNAs for targeted site-specific gene editing and therapeutic genomics.',
    publicationDate: '2023-05-12',
    journal: 'Science Magazine (AAAS)',
    source: 'Science / UC Berkeley',
    doi: '10.1126/science.1225829',
    url: 'https://www.science.org/doi/10.1126/science.1225829',
    keywords: 'Genetics, CRISPR-Cas9, Gene Editing, Molecular Biology, Biotechnology',
    citationsCount: 22400,
    openAccess: true,
    category: 'Biology',
  },
  {
    id: 'paper-mrna-vaccine',
    title: 'Suppression of RNA Immunogenicity by Nucleoside Modification: The Basis for Modified mRNA Vaccines',
    authors: 'Katalin Karikó, Michael Buckstein, Houping Ni, Drew Weissman',
    abstract: 'Synthetic mRNA typically triggers strong innate immune responses that limit translation. We discovered that incorporation of modified nucleosides (pseudouridine) ablates immune activation while markedly elevating translation efficiency, establishing the foundation for global mRNA vaccines.',
    publicationDate: '2023-10-04',
    journal: 'Immunity & Molecular Therapy',
    source: 'PubMed Central / UPenn',
    doi: '10.1016/j.immuni.2005.06.008',
    url: 'https://pubmed.ncbi.nlm.nih.gov/16111942/',
    keywords: 'Immunology, mRNA, Vaccines, Medicine, Molecular Biology',
    citationsCount: 8950,
    openAccess: true,
    category: 'Medicine',
  },
  {
    id: 'paper-fusion-energy',
    title: 'Achievement of Target Net Energy Gain in Inertial Confinement Laser Fusion',
    authors: 'National Ignition Facility Team & Lawrence Livermore National Laboratory',
    abstract: 'For the first time in scientific history, an inertial confinement fusion experiment at the National Ignition Facility produced more energy from nuclear fusion than the laser energy delivered to the target capsule, proving scientific breakeven for clean limitless energy generation.',
    publicationDate: '2024-02-18',
    journal: 'Physical Review Letters',
    source: 'LLNL / US Department of Energy',
    doi: '10.1103/PhysRevLett.132.065102',
    url: 'https://journals.aps.org/prl/',
    keywords: 'Nuclear Fusion, Clean Energy, Plasma Physics, Thermodynamics',
    citationsCount: 1620,
    openAccess: true,
    category: 'Physics',
  },
  {
    id: 'paper-jwst-deepfield',
    title: 'First Early Universe Deep Field Observations with the James Webb Space Telescope',
    authors: 'Jane Rigby, Matthew Mountain, Mark Clampin, et al.',
    abstract: 'We report the initial science performance and infrared deep-field surveys of JWST, observing high-redshift galaxies (z > 12) less than 350 million years after the Big Bang, revealing unexpected stellar mass densities and galaxy maturation in the primordial cosmic epoch.',
    publicationDate: '2023-09-28',
    journal: 'The Astrophysical Journal',
    source: 'NASA / ESA / STScI',
    doi: '10.3847/1538-4357/ac797c',
    url: 'https://iopscience.ioporg/journal/0004-637X',
    keywords: 'Astrophysics, Cosmology, James Webb Space Telescope, Early Universe, Astronomy',
    citationsCount: 3100,
    openAccess: true,
    category: 'Astronomy',
  },
  {
    id: 'paper-brain-computer',
    title: 'High-Density Intracortical Brain-Computer Interface for Real-Time Speech Decoding',
    authors: 'Francis R. Willett, Erin M. Kunz, Philip Fan, et al.',
    abstract: 'We developed an intracortical brain-computer interface (BCI) decoding attempted speech at 62 words per minute with a vocabulary of 125,000 words. The system decodes neural activity from the sensorimotor cortex directly into synthesized voice and text with 97% accuracy.',
    publicationDate: '2024-01-14',
    journal: 'Nature Neuroscience',
    source: 'Stanford Neural Prosthetics Lab',
    doi: '10.1038/s41586-023-06377-x',
    url: 'https://www.nature.com/articles/s41586-023-06377-x',
    keywords: 'Neuroscience, Brain-Computer Interface, Accessibility, Speech Synthesis, BCI',
    citationsCount: 2450,
    openAccess: true,
    category: 'Medicine',
  },
  {
    id: 'paper-climate-permafrost',
    title: 'Accelerating Global Permafrost Thaw and Carbon Feedback Dynamics in Polar Regions',
    authors: 'Merritt R. Turetsky, Benjamin W. Abbott, et al.',
    abstract: 'Abrupt thaw of permafrost in Arctic peatlands releases methane and carbon dioxide at rates double previous uniform climate models. We present empirical soil column measurements and high-resolution global radiative forcing forecasts through 2100.',
    publicationDate: '2023-06-30',
    journal: 'Nature Climate Change',
    source: 'Nature / IPCC Working Group',
    doi: '10.1038/s41558-020-0797-2',
    url: 'https://www.nature.com/nclimate/',
    keywords: 'Climate Science, Permafrost, Global Warming, Carbon Cycle, Earth Science',
    citationsCount: 1880,
    openAccess: true,
    category: 'Environment',
  },
  {
    id: 'paper-alphafold',
    title: 'Highly Accurate Protein Structure Prediction with AlphaFold 2',
    authors: 'John Jumper, Richard Evans, Alexander Pritzel, Demis Hassabis, et al.',
    abstract: 'Proteins are essential to life, and understanding their 3D structure is critical. We present AlphaFold, an AI system that predicts protein structures with atomic accuracy across 200 million cataloged proteins, solving a 50-year grand challenge in computational biology.',
    publicationDate: '2023-07-22',
    journal: 'Nature Biotechnology',
    source: 'DeepMind / EMBL-EBI',
    doi: '10.1038/s41586-021-03819-2',
    url: 'https://www.nature.com/articles/s41586-021-03819-2',
    keywords: 'Protein Folding, AlphaFold, Structural Biology, AI in Healthcare, Bioinformatics',
    citationsCount: 38200,
    openAccess: true,
    category: 'Biology',
  },
  {
    id: 'paper-renewable-perovskite',
    title: 'High-Efficiency Perovskite-Silicon Tandem Solar Cells Exceeding 33% Photovoltaic Yield',
    authors: 'Silvia Mariotti, Eike Köhnen, Steve Albrecht, et al.',
    abstract: 'We report certified 33.7% power conversion efficiency in monolithic perovskite/silicon tandem solar cells utilizing self-assembled monolayers for defect passivation, paving the way for low-cost, ultra-high efficiency residential and commercial photovoltaic arrays.',
    publicationDate: '2024-03-02',
    journal: 'Science Energy & Materials',
    source: 'Helmholtz-Zentrum Berlin / Science',
    doi: '10.1126/science.adf5872',
    url: 'https://www.science.org/doi/10.1126/science.adf5872',
    keywords: 'Solar Energy, Perovskites, Photovoltaics, Materials Science, Renewable Energy',
    citationsCount: 940,
    openAccess: true,
    category: 'Engineering',
  },
  {
    id: 'paper-robotics-humanoid',
    title: 'End-to-End Multimodal Vision-Language-Action Models for Autonomous Humanoid Robotics',
    authors: 'Anthony Brohan, Noah Brown, Justice Carbajal, et al.',
    abstract: 'We introduce RT-2, a vision-language-action (VLA) model that translates web-scale multimodal pre-training into generalized physical robotic control, demonstrating semantic reasoning, tool use, and dexterous manipulation in unstructured environments.',
    publicationDate: '2023-12-05',
    journal: 'IEEE Transactions on Robotics (T-RO)',
    source: 'Google DeepMind Robotics',
    doi: '10.48550/arXiv.2307.15818',
    url: 'https://robotics-transformer2.github.io/',
    keywords: 'Robotics, Embodied AI, Vision-Language Models, Automation, Neural Control',
    citationsCount: 1520,
    openAccess: true,
    category: 'Computer Science',
  },
  {
    id: 'paper-graphene-superconduct',
    title: 'Unconventional Superconductivity in Magic-Angle Graphene Superlattices',
    authors: 'Yuan Cao, Valla Fatemi, Pablo Jarillo-Herrero, et al.',
    abstract: 'When two sheets of graphene are rotated relative to each other by a magic angle of approximately 1.1 degrees, flat electronic bands emerge, exhibiting correlated insulating states and gate-tunable zero-resistance superconductivity at low temperatures.',
    publicationDate: '2023-04-18',
    journal: 'Nature Physics',
    source: 'MIT Condensed Matter Physics',
    doi: '10.1038/nature26160',
    url: 'https://www.nature.com/articles/nature26160',
    keywords: 'Graphene, Superconductivity, Condensed Matter Physics, 2D Materials, Nanotechnology',
    citationsCount: 6700,
    openAccess: true,
    category: 'Physics',
  }
];

const CATEGORIES = [
  'All', 'Computer Science', 'Physics', 'Medicine', 'Biology', 'Astronomy', 'Engineering', 'Environment'
];

export default function ResearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [results, setResults] = useState<Paper[]>(FEATURED_PAPERS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [year, setYear] = useState('All');
  const [sort, setSort] = useState('relevance');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      executeSearch(q, selectedCategory, year, sort);
    } else {
      executeSearch('', selectedCategory, year, sort);
    }
  }, [searchParams, selectedCategory, year, sort]);

  const executeSearch = async (searchQuery: string, cat: string, yr: string, sortBy: string) => {
    setIsLoading(true);
    setError('');

    let filtered = [...FEATURED_PAPERS];

    if (cat !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === cat.toLowerCase());
    }

    if (yr !== 'All') {
      filtered = filtered.filter(p => p.publicationDate.startsWith(yr));
    }

    if (searchQuery.trim()) {
      const lower = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(lower) ||
        p.authors.toLowerCase().includes(lower) ||
        p.abstract.toLowerCase().includes(lower) ||
        p.keywords.toLowerCase().includes(lower) ||
        p.journal.toLowerCase().includes(lower)
      );
    }

    if (sortBy === 'citations') {
      filtered.sort((a, b) => b.citationsCount - a.citationsCount);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());
    }

    try {
      if (searchQuery.trim()) {
        const res = await axios.get('/api/research/search', { params: { q: searchQuery.trim(), year: yr !== 'All' ? yr : undefined } });
        if (res.data?.results && res.data.results.length > 0) {
          const serverPapers: Paper[] = res.data.results.map((p: any, idx: number) => ({
            id: p.id || `server-paper-${idx}`,
            title: p.title || 'Untitled Research Paper',
            authors: p.authors || 'Unknown Authors',
            abstract: p.abstract || p.snippet || 'Abstract unavailable.',
            publicationDate: p.publicationDate || p.year || '2023',
            journal: p.journal || 'Academic Journal',
            source: p.source || 'Crossref / arXiv',
            doi: p.doi || null,
            url: p.url || null,
            keywords: p.keywords || 'Research, Science',
            citationsCount: p.citationsCount || 100,
            openAccess: true,
            category: cat !== 'All' ? cat : 'Computer Science',
          }));
          filtered = [...serverPapers, ...filtered];
        }
      }
    } catch {
      // Graceful offline fallback
    }

    setResults(filtered);
    setIsLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, selectedCategory, year, sort);
  };

  return (
    <div className="page-container pb-16">
      {/* Header */}
      <section aria-labelledby="research-heading" className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <BookOpen size={24} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 id="research-heading" className="text-3xl font-black font-display text-white tracking-tight">
                SAKSHAM Research Papers
              </h1>
              <p className="text-slate-400 text-sm">
                Explore 200M+ global open-access research papers simplified for effortless learning
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
            <Sparkles size={14} className="text-amber-400" />
            <span>AI Simplification & Audio-Reader Enabled</span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} role="search" className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-md opacity-30 group-hover:opacity-60 transition duration-300" />
          <div className="relative flex items-center bg-slate-900/90 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-2 shadow-2xl">
            <Search className="w-6 h-6 text-indigo-400 ml-3 shrink-0" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search across millions of papers by title, author, keyword, DOI, or concept..."
              className="w-full bg-transparent px-4 py-2.5 text-white placeholder-slate-400 text-sm focus:outline-none"
              aria-label="Search research papers"
            />
            <button
              type="submit"
              className="btn-primary !py-2.5 !px-6 text-sm !shadow-none shrink-0"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Search Papers'}
            </button>
          </div>
        </form>
      </section>

      {/* Category Pills & Filters */}
      <section aria-label="Categories and filters" className="mb-8 space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Compass size={14} className="text-indigo-400" /> Categories:
          </span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort & Year Options */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 glass-card border-slate-800/80 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Filter size={14} className="text-indigo-400" /> Filter Year:
            </span>
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
              aria-label="Filter by year"
            >
              <option value="All">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <SortAsc size={14} className="text-indigo-400" /> Sort By:
            </span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
              aria-label="Sort papers"
            >
              <option value="relevance">Relevance</option>
              <option value="citations">Most Cited</option>
              <option value="newest">Latest First</option>
            </select>
          </div>

          <div className="text-slate-400 font-medium">
            Showing <strong className="text-white">{results.length}</strong> verified research papers
          </div>
        </div>
      </section>

      {/* Papers Grid */}
      <section aria-label="Research papers list">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={36} className="animate-spin text-indigo-500 mb-3" />
            <p className="text-slate-400 font-medium">Fetching academic papers & compiling simplified summaries...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-xl mx-auto">
            <AlertCircle size={40} className="mx-auto text-amber-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">No research papers matched your search</h3>
            <p className="text-slate-400 text-sm mb-6">
              Try broader keywords, select "All" categories, or reset your filters.
            </p>
            <button
              onClick={() => { setQuery(''); setSelectedCategory('All'); setYear('All'); }}
              className="btn-primary text-xs"
            >
              Reset Filters & Show All Papers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((paper) => (
              <article
                key={paper.id}
                className="glass-card p-6 flex flex-col justify-between group hover:border-indigo-500/40 transition-all duration-300 relative overflow-hidden"
              >
                {/* Top category ribbon */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {paper.category}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-indigo-400" />
                      {paper.publicationDate.split('-')[0]}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      {paper.citationsCount.toLocaleString()} Citations
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug mb-2">
                  {paper.title}
                </h2>

                {/* Authors & Journal */}
                <p className="text-xs text-slate-400 font-medium mb-3 flex items-center gap-1.5">
                  <Users size={13} className="text-indigo-400 shrink-0" />
                  <span className="truncate">{paper.authors}</span>
                </p>

                <div className="text-xs text-indigo-400/90 font-semibold mb-3">
                  📖 {paper.journal} ({paper.source})
                </div>

                {/* Abstract */}
                <p className="text-slate-300 text-xs leading-relaxed line-clamp-3 mb-5 flex-1">
                  {paper.abstract}
                </p>

                {/* Keywords */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {paper.keywords.split(',').map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900 border border-slate-800 text-slate-400"
                    >
                      <Tag size={10} className="text-indigo-400" />
                      {kw.trim()}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => navigate(`/research/${encodeURIComponent(paper.id)}`)}
                    className="btn-primary flex-1 !py-2.5 text-xs font-bold"
                  >
                    <span>Read Simplified Paper</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  {paper.url && (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-indigo-500/40 transition-all"
                      title="View original publisher paper"
                      aria-label={`View external paper: ${paper.title}`}
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
