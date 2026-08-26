import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search, BookOpen, Calendar, ExternalLink, Users, Tag,
  AlertCircle, Loader2, Filter, SortAsc, Info
} from 'lucide-react';

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

const CATEGORIES = [
  'All', 'Medicine', 'Biology', 'Computer Science', 'Physics',
  'Chemistry', 'Mathematics', 'Engineering', 'Social Sciences', 'Education'
];

export default function ResearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [year, setYear] = useState('');
  const [sort, setSort] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || query.trim().length < 2) {
      setError('Please enter at least 2 characters to search.');
      return;
    }
    setError('');
    setIsLoading(true);
    setHasSearched(true);
    try {
      const params: Record<string, string> = { q: query.trim() };
      if (year) params.year = year;
      if (sort !== 'relevance') params.sort = sort;

      const res = await axios.get('/api/research/search', { params });
      setResults(res.data.results || []);
      setNotice(res.data.notice || '');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Research papers could not be loaded right now. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <section aria-labelledby="research-heading" className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
            <BookOpen size={22} className="text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </div>
          <div>
            <h1 id="research-heading" className="section-title">SAKSHAM Research Papers</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Explore and understand academic research in simple language</p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section aria-label="Search research papers" className="mb-6">
        <form onSubmit={handleSearch} role="search" noValidate>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="research-search"
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by title, author, subject, keyword..."
                className="input-field pl-12 pr-4"
                aria-label="Search research papers"
                aria-describedby={error ? 'search-error' : undefined}
                autoComplete="off"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary px-4 ${showFilters ? 'border-primary-500 text-primary-600' : ''}`}
              aria-label="Toggle filters"
              aria-expanded={showFilters}
            >
              <Filter size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 animate-fade-in">
              <div>
                <label htmlFor="year-filter" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Publication Year</label>
                <input
                  id="year-filter"
                  type="number"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  placeholder="e.g. 2023"
                  min="1900" max={new Date().getFullYear()}
                  className="input-field w-32 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="sort-filter" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Sort by</label>
                <select
                  id="sort-filter"
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="input-field w-40 py-2 text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Most Recent</option>
                  <option value="citations">Most Cited</option>
                </select>
              </div>
            </div>
          )}
        </form>

        {/* Error */}
        {error && (
          <div id="search-error" role="alert" aria-live="polite" className="flex items-center gap-2 mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            <AlertCircle size={16} aria-hidden="true" />
            {error}
          </div>
        )}

        {/* Notice */}
        {notice && (
          <div role="status" aria-live="polite" className="flex items-center gap-2 mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg text-orange-700 dark:text-orange-300 text-sm">
            <Info size={16} aria-hidden="true" />
            {notice}
          </div>
        )}
      </section>

      {/* Popular searches */}
      {!hasSearched && (
        <section aria-label="Suggested searches" className="mb-8">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Popular searches:</p>
          <div className="flex flex-wrap gap-2">
            {['deep learning', 'climate change', 'NEET biology', 'quantum computing', 'mental health', 'COVID-19', 'machine learning', 'renewable energy'].map(term => (
              <button
                key={term}
                onClick={() => { setQuery(term); }}
                className="px-4 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {isLoading && (
        <div className="flex items-center justify-center py-20" aria-live="polite" aria-busy="true">
          <div className="text-center">
            <Loader2 size={40} className="animate-spin text-primary-500 mx-auto mb-4" aria-hidden="true" />
            <p className="text-slate-500 dark:text-slate-400">Searching research papers...</p>
          </div>
        </div>
      )}

      {!isLoading && hasSearched && results.length === 0 && !error && (
        <div className="text-center py-20">
          <BookOpen size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No papers found</h2>
          <p className="text-slate-500 dark:text-slate-400">Try different keywords or remove filters.</p>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <section aria-live="polite" aria-label={`${results.length} research papers found`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Found <strong className="text-slate-900 dark:text-white">{results.length}</strong> papers
            </p>
            {notice && <span className="badge-demo">Demo Data</span>}
          </div>

          <div className="space-y-4">
            {results.map((paper) => (
              <article
                key={paper.id}
                className="card p-6 hover:shadow-md transition-all duration-200"
                aria-labelledby={`paper-title-${paper.id}`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h2
                      id={`paper-title-${paper.id}`}
                      className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                      onClick={() => navigate(`/research/${encodeURIComponent(paper.id)}`)}
                    >
                      {paper.title}
                    </h2>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mb-3">
                      {paper.authors !== 'Not available' && (
                        <span className="flex items-center gap-1">
                          <Users size={13} aria-hidden="true" />
                          {paper.authors}
                        </span>
                      )}
                      {paper.publicationDate !== 'Not available' && (
                        <span className="flex items-center gap-1">
                          <Calendar size={13} aria-hidden="true" />
                          {paper.publicationDate.substring(0, 4)}
                        </span>
                      )}
                      {paper.journal !== 'Not available' && (
                        <span className="italic">{paper.journal}</span>
                      )}
                    </div>

                    {/* Abstract */}
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 mb-3">
                      {paper.abstract}
                    </p>

                    {/* Keywords */}
                    {paper.keywords && paper.keywords !== 'Not available' && (
                      <div className="flex items-center gap-1 flex-wrap">
                        <Tag size={12} className="text-slate-400" aria-hidden="true" />
                        {paper.keywords.split(',').slice(0, 4).map(k => (
                          <span key={k} className="badge-primary text-xs">{k.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/research/${encodeURIComponent(paper.id)}`)}
                      className="btn-primary text-sm py-2"
                      aria-label={`Read paper: ${paper.title}`}
                    >
                      Read Paper
                    </button>
                    {paper.url && (
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm py-2 text-center"
                        aria-label={`Open original paper: ${paper.title} (opens in new tab)`}
                      >
                        <ExternalLink size={14} aria-hidden="true" />
                        Original
                      </a>
                    )}
                    <div className="flex flex-wrap gap-1 justify-end">
                      {paper.source === 'Demo Data' && <span className="badge-demo">Demo</span>}
                      {paper.openAccess && <span className="badge-success">Open Access</span>}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
