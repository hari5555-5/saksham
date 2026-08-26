import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FileText, Search, Filter, Download, Play, ExternalLink,
  Loader2, AlertCircle, ChevronDown
} from 'lucide-react';

interface Paper {
  id: number;
  exam: string;
  year: number;
  subject: string;
  paper_type: string;
  title: string;
  url: string;
  source: string;
  is_demo: number;
}

const EXAMS = ['NEET', 'JEE', 'UPSC'];
const SUBJECTS: Record<string, string[]> = {
  NEET: ['All', 'Biology', 'Physics', 'Chemistry'],
  JEE: ['All', 'Mathematics', 'Physics', 'Chemistry'],
  UPSC: ['All', 'General Studies', 'CSAT', 'Optional'],
};
const YEARS = ['All', '2023', '2022', '2021', '2020', '2019', '2018'];

export default function PastPapersPage() {
  const navigate = useNavigate();
  const [activeExam, setActiveExam] = useState('NEET');
  const [subject, setSubject] = useState('All');
  const [year, setYear] = useState('All');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPapers();
  }, [activeExam, subject, year]);

  useEffect(() => {
    setSubject('All');
  }, [activeExam]);

  const fetchPapers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { exam: activeExam };
      if (subject && subject !== 'All') params.subject = subject;
      if (year && year !== 'All') params.year = year;
      const res = await axios.get('/api/papers', { params });
      setPapers(res.data.papers || []);
    } catch (err) {
      setError('Past papers could not be loaded right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const examColors: Record<string, { bg: string; text: string; active: string }> = {
    NEET: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', active: 'bg-emerald-600 text-white' },
    JEE: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', active: 'bg-blue-600 text-white' },
    UPSC: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', active: 'bg-orange-600 text-white' },
  };

  const examInfo: Record<string, { desc: string; icon: string }> = {
    NEET: { desc: 'National Eligibility cum Entrance Test for Medical Admissions', icon: '🩺' },
    JEE: { desc: 'Joint Entrance Examination for IIT and NIT Admissions', icon: '⚙️' },
    UPSC: { desc: 'Union Public Service Commission Civil Services Examination', icon: '🏛️' },
  };

  return (
    <div className="page-container">
      {/* Header */}
      <section aria-labelledby="papers-heading" className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
            <FileText size={22} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          </div>
          <div>
            <h1 id="papers-heading" className="section-title">SAKSHAM Past Papers</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Access and practice with previous year examination papers</p>
          </div>
        </div>
      </section>

      {/* Exam tabs */}
      <nav aria-label="Exam selection" className="mb-6">
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl max-w-sm" role="tablist">
          {EXAMS.map(exam => (
            <button
              key={exam}
              role="tab"
              aria-selected={activeExam === exam}
              onClick={() => setActiveExam(exam)}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeExam === exam
                  ? `${examColors[exam].active} shadow-md`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {examInfo[exam].icon} {exam}
            </button>
          ))}
        </div>
      </nav>

      {/* Exam info */}
      <div className={`mb-6 p-4 ${examColors[activeExam].bg} rounded-xl border border-current/10`} role="status">
        <p className={`text-sm font-medium ${examColors[activeExam].text}`}>
          {examInfo[activeExam].icon} {examInfo[activeExam].desc}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6" role="group" aria-label="Paper filters">
        <div>
          <label htmlFor="subject-filter" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Subject</label>
          <select
            id="subject-filter"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="input-field py-2 text-sm w-44"
            aria-label="Filter by subject"
          >
            {(SUBJECTS[activeExam] || ['All']).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="year-filter-pp" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Year</label>
          <select
            id="year-filter-pp"
            value={year}
            onChange={e => setYear(e.target.value)}
            className="input-field py-2 text-sm w-32"
            aria-label="Filter by year"
          >
            {YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" aria-live="polite" className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 mb-6">
          <AlertCircle size={18} aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20" aria-live="polite" aria-busy="true">
          <Loader2 size={36} className="animate-spin text-primary-500" aria-hidden="true" />
        </div>
      )}

      {/* Papers list */}
      {!isLoading && (
        <section aria-label={`${activeExam} past papers`} aria-live="polite">
          {papers.length === 0 ? (
            <div className="text-center py-20">
              <FileText size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" aria-hidden="true" />
              <p className="text-slate-500 dark:text-slate-400">No papers found for the selected filters.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Showing <strong className="text-slate-900 dark:text-white">{papers.length}</strong> papers
              </p>
              <div className="space-y-3">
                {papers.map(paper => (
                  <article
                    key={paper.id}
                    className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    aria-labelledby={`paper-title-${paper.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`badge ${examColors[activeExam].bg} ${examColors[activeExam].text}`}>{paper.exam}</span>
                        <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{paper.year}</span>
                        {paper.paper_type && <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{paper.paper_type}</span>}
                        {paper.is_demo === 1 && <span className="badge-demo">Demo</span>}
                      </div>
                      <h2 id={`paper-title-${paper.id}`} className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                        {paper.title}
                      </h2>
                      {paper.subject && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Subject: {paper.subject}</p>
                      )}
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Source: {paper.source}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button
                        onClick={() => navigate(`/past-papers/${paper.id}/practice`)}
                        className="btn-primary text-sm py-2"
                        aria-label={`Practice: ${paper.title}`}
                      >
                        <Play size={14} aria-hidden="true" />
                        Practice
                      </button>
                      {paper.url && (
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-sm py-2"
                          aria-label={`View official source for ${paper.title} (opens in new tab)`}
                        >
                          <ExternalLink size={14} aria-hidden="true" />
                          Official Source
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Copyright notice */}
      <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <strong>Note:</strong> Practice questions in Demo mode are sample questions for learning purposes. Real exam papers are copyright-protected — use the "Official Source" button to access papers from NTA, IIT, and UPSC official websites. SAKSHAM does not reproduce copyrighted exam material.
        </p>
      </div>
    </div>
  );
}
