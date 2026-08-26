const fetch = require('node-fetch');

const OPENALEX_BASE = 'https://api.openalex.org';
const SEMANTIC_SCHOLAR_BASE = 'https://api.semanticscholar.org/graph/v1';

function normalizeOpenAlexPaper(work) {
  return {
    id: work.id,
    externalId: work.id,
    title: work.title || 'Untitled',
    authors: work.authorships
      ? work.authorships.slice(0, 5).map(a => a.author?.display_name || 'Unknown').join(', ')
      : 'Not available',
    abstract: work.abstract_inverted_index
      ? reconstructAbstract(work.abstract_inverted_index)
      : 'Abstract not available',
    publicationDate: work.publication_date || work.publication_year?.toString() || 'Not available',
    journal: work.primary_location?.source?.display_name || 'Not available',
    source: 'OpenAlex',
    doi: work.doi || null,
    url: work.primary_location?.landing_page_url || work.doi ? `https://doi.org/${work.doi}` : null,
    keywords: work.keywords
      ? work.keywords.slice(0, 5).map(k => k.display_name).join(', ')
      : (work.concepts ? work.concepts.slice(0, 5).map(c => c.display_name).join(', ') : 'Not available'),
    citationsCount: work.cited_by_count || 0,
    openAccess: work.open_access?.is_oa || false,
  };
}

function reconstructAbstract(invertedIndex) {
  if (!invertedIndex) return 'Not available';
  try {
    const words = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
      for (const pos of positions) {
        words[pos] = word;
      }
    }
    return words.filter(Boolean).join(' ');
  } catch {
    return 'Abstract not available';
  }
}

async function searchOpenAlex(query, filters = {}) {
  const params = new URLSearchParams({
    search: query,
    per_page: '20',
    select: 'id,title,authorships,abstract_inverted_index,publication_date,publication_year,primary_location,doi,cited_by_count,open_access,concepts,keywords',
  });

  if (filters.year) params.append('filter', `publication_year:${filters.year}`);
  if (filters.sort === 'date') params.append('sort', 'publication_date:desc');

  const url = `${OPENALEX_BASE}/works?${params}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'SAKSHAM-App/1.0 (mailto:saksham@example.com)' }
  });

  if (!res.ok) throw new Error(`OpenAlex API error: ${res.status}`);
  const data = await res.json();
  return (data.results || []).map(normalizeOpenAlexPaper);
}

async function getOpenAlexPaper(id) {
  const cleanId = id.replace('https://openalex.org/', '');
  const url = `${OPENALEX_BASE}/works/${cleanId}?select=id,title,authorships,abstract_inverted_index,publication_date,publication_year,primary_location,doi,cited_by_count,open_access,concepts,keywords,referenced_works,related_works`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'SAKSHAM-App/1.0 (mailto:saksham@example.com)' }
  });

  if (!res.ok) throw new Error(`OpenAlex API error: ${res.status}`);
  const work = await res.json();
  return normalizeOpenAlexPaper(work);
}

// Demo fallback papers
const DEMO_PAPERS = [
  {
    id: 'demo-1',
    externalId: 'demo-1',
    title: 'Deep Learning for Accessibility: Making AI Understandable for Everyone',
    authors: 'Dr. Priya Sharma, Dr. Rahul Mehta, Dr. Anita Krishnan',
    abstract: 'This paper presents novel approaches to making deep learning systems more accessible and understandable for users with various accessibility needs. We explore techniques for explaining AI decisions in simple language, visual formats, and through sign language interpretation.',
    publicationDate: '2023-08-15',
    journal: 'Journal of Accessibility in Computing',
    source: 'Demo Data',
    doi: null,
    url: null,
    keywords: 'deep learning, accessibility, explainability, sign language, assistive technology',
    citationsCount: 142,
    openAccess: true,
  },
  {
    id: 'demo-2',
    externalId: 'demo-2',
    title: 'Natural Language Processing for Indian Regional Languages: A Comprehensive Survey',
    authors: 'Dr. Vikram Nair, Dr. Sushma Patel',
    abstract: 'This survey covers the state-of-the-art NLP approaches for Indian regional languages including Hindi, Tamil, Telugu, Kannada, and Bengali. We analyze datasets, models, and benchmarks while highlighting gaps in accessibility for these languages in AI systems.',
    publicationDate: '2023-05-20',
    journal: 'Transactions on Asian Language Information Processing',
    source: 'Demo Data',
    doi: null,
    url: null,
    keywords: 'NLP, Indian languages, multilingual, accessibility, language models',
    citationsCount: 89,
    openAccess: true,
  },
  {
    id: 'demo-3',
    externalId: 'demo-3',
    title: 'NEET and JEE Examination Outcomes: Analysis of Socioeconomic Factors',
    authors: 'Dr. Kavitha Reddy, Prof. Sunil Kumar, Dr. Meena Singh',
    abstract: 'An empirical study examining how socioeconomic factors influence performance in NEET and JEE competitive examinations in India. Using data from 50,000 students across 5 years, we identify key barriers and propose evidence-based interventions.',
    publicationDate: '2022-11-10',
    journal: 'Indian Journal of Educational Research',
    source: 'Demo Data',
    doi: null,
    url: null,
    keywords: 'competitive exams, NEET, JEE, educational equity, socioeconomic factors',
    citationsCount: 234,
    openAccess: true,
  },
];

module.exports = { searchOpenAlex, getOpenAlexPaper, DEMO_PAPERS };
