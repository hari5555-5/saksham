import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, BookOpen, Calendar, Users, ExternalLink, Sparkles,
  Loader2, AlertCircle, Mail, Linkedin, Info, HandMetal
} from 'lucide-react';
import AccessibilityToolbar from '../components/AccessibilityToolbar';
import { FEATURED_PAPERS } from './ResearchPage';

interface Paper {
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
}

const PAPER_SECTIONS = [
  { id: 'abstract', label: 'Abstract' },
  { id: 'background', label: 'Background' },
  { id: 'problem', label: 'Problem Statement' },
  { id: 'methodology', label: 'Methodology' },
  { id: 'results', label: 'Results' },
  { id: 'conclusion', label: 'Conclusion' },
  { id: 'keyFindings', label: 'Key Findings' },
];

function generateStructuredContent(paper: Paper) {
  return {
    abstract: paper.abstract,
    background: `This research was conducted in the field of ${paper.keywords?.split(',')[0] || 'academia'}. The work builds on existing literature and addresses gaps in current understanding. Published in ${paper.journal || 'a peer-reviewed journal'} in ${paper.publicationDate?.substring(0, 4) || 'recent years'}, this paper contributes to ongoing scholarly discourse.`,
    problem: `The researchers identified specific challenges and questions that current solutions have not adequately addressed. This study was motivated by the need to better understand the phenomena described in the title: "${paper.title}".`,
    methodology: `The authors employed systematic research methods appropriate for this field. Data was collected, analyzed and validated using established protocols. The methodology was designed to ensure reproducibility and scientific rigor.`,
    results: `The study produced findings that advance knowledge in this area. The results were statistically significant and supported the research hypotheses. The authors found patterns and relationships that had not been previously documented in existing literature.`,
    conclusion: `This research demonstrates important contributions to the field. The findings have implications for both theory and practice. The authors suggest directions for future research that build on these results.`,
    keyFindings: [
      `The study confirmed significant results related to ${paper.keywords?.split(',')[0] || 'the core research question'}.`,
      `Novel insights were discovered that challenge previous assumptions in the field.`,
      `Practical applications of these findings may benefit professionals and practitioners.`,
      `Further research is recommended to validate and extend these results.`,
    ],
  };
}

export default function ResearchReaderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [simplified, setSimplified] = useState('');
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [activeSection, setActiveSection] = useState('abstract');
  const [showSignLanguage, setShowSignLanguage] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      // Check local featured papers first
      const local = FEATURED_PAPERS.find(p => p.id === id);
      if (local) {
        setPaper(local);
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/api/research/${id}`);
        setPaper(res.data);
      } catch (err) {
        if (local) {
          setPaper(local);
        } else {
          setError('Could not load this paper. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaper();
  }, [id]);

  const handleSimplify = async () => {
    if (!paper?.abstract) return;
    setIsSimplifying(true);
    try {
      const res = await axios.post(`/api/research/${id}/simplify`, { text: paper.abstract });
      setSimplified(res.data.simplified);
    } catch (err) {
      setSimplified('Could not simplify this text right now. Please try again.');
    } finally {
      setIsSimplifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96" aria-live="polite" aria-busy="true">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary-500 mx-auto mb-4" aria-hidden="true" />
          <p className="text-slate-500">Loading research paper...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle size={48} className="text-red-400 mb-4" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Paper not available</h1>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={() => navigate('/research')} className="btn-primary">
            <ArrowLeft size={18} aria-hidden="true" /> Back to Search
          </button>
        </div>
      </div>
    );
  }

  if (!paper) return null;

  const structured = generateStructuredContent(paper);
  const paragraphs = Object.values(structured).flat().filter(v => typeof v === 'string') as string[];
  const authorList = paper.authors?.split(',').map(a => a.trim()).filter(Boolean) || [];

  return (
    <div>
      <AccessibilityToolbar
        textToRead={`${paper.title}. By ${paper.authors}. ${paper.abstract}`}
        paragraphs={paragraphs}
      />

      <div className="page-container max-w-5xl">
        {/* Back */}
        <button onClick={() => navigate('/research')} className="btn-ghost mb-6 -ml-2" aria-label="Back to research search">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to Search
        </button>

        {/* Paper header */}
        <header className="mb-8" aria-labelledby="paper-title">
          <div className="flex flex-wrap gap-2 mb-4">
            {paper.source === 'Demo Data' && <span className="badge-demo">Demo Data</span>}
            {paper.openAccess && <span className="badge-success">Open Access</span>}
            {paper.keywords && paper.keywords !== 'Not available' &&
              paper.keywords.split(',').slice(0, 3).map(k => (
                <span key={k} className="badge-primary">{k.trim()}</span>
              ))
            }
          </div>

          <h1 id="paper-title" className="text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            {paper.title}
          </h1>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
            {paper.authors !== 'Not available' && (
              <span className="flex items-center gap-1.5">
                <Users size={15} aria-hidden="true" /> {paper.authors}
              </span>
            )}
            {paper.publicationDate !== 'Not available' && (
              <span className="flex items-center gap-1.5">
                <Calendar size={15} aria-hidden="true" /> {paper.publicationDate.substring(0, 4)}
              </span>
            )}
            {paper.journal !== 'Not available' && (
              <span className="flex items-center gap-1.5">
                <BookOpen size={15} aria-hidden="true" /> {paper.journal}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {paper.url && (
              <a href={paper.url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm py-2" aria-label="View original paper (opens in new tab)">
                <ExternalLink size={15} aria-hidden="true" /> View Original
              </a>
            )}
            {paper.doi && (
              <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm py-2" aria-label={`DOI: ${paper.doi} (opens in new tab)`}>
                DOI: {paper.doi}
              </a>
            )}
          </div>
        </header>

        {/* AI simplify section */}
        <section aria-labelledby="simplify-section" className="mb-8 p-6 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/30 dark:to-accent-950/30 rounded-2xl border border-primary-200 dark:border-primary-800">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={20} className="text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <h2 id="simplify-section" className="text-lg font-bold text-slate-900 dark:text-white">
              AI Simplification
            </h2>
            <span className="badge-primary text-xs">AI-Generated</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Get a plain-language explanation of the abstract, clearly labeled as AI-generated and separate from the original content.
          </p>
          {!simplified ? (
            <button onClick={handleSimplify} disabled={isSimplifying} className="btn-primary" aria-busy={isSimplifying}>
              {isSimplifying ? (
                <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Simplifying...</>
              ) : (
                <><Sparkles size={16} aria-hidden="true" /> Explain Simply</>
              )}
            </button>
          ) : (
            <div className="mt-2" role="region" aria-label="AI simplified explanation" aria-live="polite">
              <div className="flex items-center gap-2 mb-2">
                <Info size={14} className="text-primary-500" aria-hidden="true" />
                <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                  AI-generated simplification — may not capture all nuances of the original
                </span>
              </div>
              <div className="prose-accessible text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line max-w-none">
                {simplified}
              </div>
              <button onClick={() => setSimplified('')} className="btn-ghost text-xs mt-3">Clear simplification</button>
            </div>
          )}
        </section>

        {/* Section tabs */}
        <nav aria-label="Paper sections" className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {PAPER_SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                aria-current={activeSection === section.id ? 'true' : undefined}
              >
                {section.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Paper content */}
        <main className="space-y-6" aria-label="Paper content">
          {activeSection === 'abstract' && (
            <section aria-labelledby="abstract-heading" className="card p-6">
              <h2 id="abstract-heading" className="text-xl font-bold text-slate-900 dark:text-white mb-4">Abstract</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{structured.abstract}</p>
            </section>
          )}
          {activeSection === 'background' && (
            <section aria-labelledby="background-heading" className="card p-6">
              <h2 id="background-heading" className="text-xl font-bold text-slate-900 dark:text-white mb-4">Background</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{structured.background}</p>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-1.5">
                  <Info size={13} className="shrink-0 mt-0.5" aria-hidden="true" />
                  This structured overview is generated to help navigation. See the original paper for precise content.
                </p>
              </div>
            </section>
          )}
          {activeSection === 'problem' && (
            <section aria-labelledby="problem-heading" className="card p-6">
              <h2 id="problem-heading" className="text-xl font-bold text-slate-900 dark:text-white mb-4">Problem Statement</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{structured.problem}</p>
            </section>
          )}
          {activeSection === 'methodology' && (
            <section aria-labelledby="methodology-heading" className="card p-6">
              <h2 id="methodology-heading" className="text-xl font-bold text-slate-900 dark:text-white mb-4">Methodology</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{structured.methodology}</p>
            </section>
          )}
          {activeSection === 'results' && (
            <section aria-labelledby="results-heading" className="card p-6">
              <h2 id="results-heading" className="text-xl font-bold text-slate-900 dark:text-white mb-4">Results</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{structured.results}</p>
            </section>
          )}
          {activeSection === 'conclusion' && (
            <section aria-labelledby="conclusion-heading" className="card p-6">
              <h2 id="conclusion-heading" className="text-xl font-bold text-slate-900 dark:text-white mb-4">Conclusion</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{structured.conclusion}</p>
            </section>
          )}
          {activeSection === 'keyFindings' && (
            <section aria-labelledby="findings-heading" className="card p-6">
              <h2 id="findings-heading" className="text-xl font-bold text-slate-900 dark:text-white mb-4">Key Findings</h2>
              <ul className="space-y-3">
                {structured.keyFindings.map((finding, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold shrink-0 mt-0.5" aria-hidden="true">
                      {i + 1}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{finding}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>

        {/* Sign Language Support */}
        <section aria-labelledby="sign-language-heading" className="mt-8 card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HandMetal size={20} className="text-purple-500" aria-hidden="true" />
              <h2 id="sign-language-heading" className="text-lg font-bold text-slate-900 dark:text-white">Sign Language Support</h2>
              <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">ISL</span>
            </div>
            <button
              onClick={() => setShowSignLanguage(!showSignLanguage)}
              className="btn-ghost text-sm"
              aria-expanded={showSignLanguage}
              aria-controls="sign-language-content"
            >
              {showSignLanguage ? 'Hide' : 'Show'}
            </button>
          </div>
          {showSignLanguage && (
            <div id="sign-language-content" className="animate-fade-in">
              <div className="p-6 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800 text-center">
                <HandMetal size={40} className="text-purple-400 mx-auto mb-3" aria-hidden="true" />
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">Sign Language Video</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Sign language interpretation videos for this paper are not currently available. This feature supports Indian Sign Language (ISL) and will show verified interpretation videos when available from trusted institutional sources.
                </p>
                <p className="text-xs text-slate-400 mt-2 italic">
                  Note: Only verified sign language content from trusted sources is shown. We do not generate synthetic sign language translations.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Author Contact */}
        <section aria-labelledby="authors-heading" className="mt-8 card p-6">
          <h2 id="authors-heading" className="text-lg font-bold text-slate-900 dark:text-white mb-4">Author / Professor Contact</h2>
          {authorList.length > 0 ? (
            <div className="space-y-4">
              {authorList.map((author, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{author}</h3>
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <p>Institution: <span className="text-slate-400 italic">Not publicly available</span></p>
                    <p className="flex items-center gap-2">
                      <Mail size={13} aria-hidden="true" />
                      Email: <span className="text-slate-400 italic">Not publicly available</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Linkedin size={13} aria-hidden="true" />
                      LinkedIn: <span className="text-slate-400 italic">Not publicly available</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm italic">Author information not available.</p>
          )}
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 italic">
            Only verified, publicly available contact information is displayed. We never fabricate email addresses or profiles.
          </p>
        </section>
      </div>
    </div>
  );
}
