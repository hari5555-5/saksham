import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FileText, Search, Filter, Download, Play, ExternalLink,
  Loader2, AlertCircle, Sparkles, BookOpen, CheckCircle2,
  Clock, Award, HelpCircle
} from 'lucide-react';

export interface PastPaper {
  id: number;
  exam: string;
  year: number;
  subject: string;
  paper_type: string;
  title: string;
  url: string;
  source: string;
  is_demo: number;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
}

export const PAST_PAPERS_CATALOG: PastPaper[] = [
  // NEET Papers
  {
    id: 101,
    exam: 'NEET',
    year: 2024,
    subject: 'All Subjects (Full Length)',
    paper_type: 'Question Paper + Solution',
    title: 'NEET UG 2024 Official Full Question Paper (Physics, Chemistry, Biology)',
    url: 'https://nta.ac.in/Downloads',
    source: 'National Testing Agency (NTA)',
    is_demo: 0,
    durationMinutes: 200,
    totalQuestions: 200,
    totalMarks: 720,
  },
  {
    id: 102,
    exam: 'NEET',
    year: 2023,
    subject: 'Biology',
    paper_type: 'Subject Paper',
    title: 'NEET UG 2023 Biology (Botany & Zoology) with Detailed Explanations',
    url: 'https://nta.ac.in/Downloads',
    source: 'National Testing Agency (NTA)',
    is_demo: 0,
    durationMinutes: 90,
    totalQuestions: 100,
    totalMarks: 360,
  },
  {
    id: 103,
    exam: 'NEET',
    year: 2023,
    subject: 'Physics',
    paper_type: 'Subject Paper',
    title: 'NEET UG 2023 Physics Theoretical & Numerical Problem Set',
    url: 'https://nta.ac.in/Downloads',
    source: 'National Testing Agency (NTA)',
    is_demo: 0,
    durationMinutes: 60,
    totalQuestions: 50,
    totalMarks: 180,
  },
  {
    id: 104,
    exam: 'NEET',
    year: 2023,
    subject: 'Chemistry',
    paper_type: 'Subject Paper',
    title: 'NEET UG 2023 Chemistry (Organic, Inorganic & Physical)',
    url: 'https://nta.ac.in/Downloads',
    source: 'National Testing Agency (NTA)',
    is_demo: 0,
    durationMinutes: 60,
    totalQuestions: 50,
    totalMarks: 180,
  },
  {
    id: 105,
    exam: 'NEET',
    year: 2022,
    subject: 'All Subjects (Full Length)',
    paper_type: 'Question Paper + Solution',
    title: 'NEET UG 2022 Phase-1 Official Question Paper with Answer Key',
    url: 'https://nta.ac.in/Downloads',
    source: 'National Testing Agency (NTA)',
    is_demo: 0,
    durationMinutes: 200,
    totalQuestions: 200,
    totalMarks: 720,
  },
  {
    id: 106,
    exam: 'NEET',
    year: 2021,
    subject: 'Biology',
    paper_type: 'Subject Paper',
    title: 'NEET UG 2021 Biology Diagnostic Paper with Diagram Annotations',
    url: 'https://nta.ac.in/Downloads',
    source: 'National Testing Agency (NTA)',
    is_demo: 0,
    durationMinutes: 90,
    totalQuestions: 90,
    totalMarks: 360,
  },
  {
    id: 107,
    exam: 'NEET',
    year: 2020,
    subject: 'All Subjects (Full Length)',
    paper_type: 'Question Paper + Solution',
    title: 'NEET UG 2020 All India Examination Paper (Set E1)',
    url: 'https://nta.ac.in/Downloads',
    source: 'National Testing Agency (NTA)',
    is_demo: 0,
    durationMinutes: 180,
    totalQuestions: 180,
    totalMarks: 720,
  },

  // JEE Main & Advanced Papers
  {
    id: 201,
    exam: 'JEE',
    year: 2024,
    subject: 'All Subjects (Full Length)',
    paper_type: 'JEE Main Session 1',
    title: 'JEE Main 2024 Session 1 (Shift 1) Physics, Chemistry & Mathematics',
    url: 'https://jeemain.nta.ac.in',
    source: 'National Testing Agency (NTA)',
    is_demo: 0,
    durationMinutes: 180,
    totalQuestions: 90,
    totalMarks: 300,
  },
  {
    id: 202,
    exam: 'JEE',
    year: 2024,
    subject: 'Mathematics',
    paper_type: 'Subject Paper',
    title: 'JEE Main 2024 Mathematics High-Yield Calculus & Vectors Paper',
    url: 'https://jeemain.nta.ac.in',
    source: 'National Testing Agency (NTA)',
    is_demo: 0,
    durationMinutes: 60,
    totalQuestions: 30,
    totalMarks: 100,
  },
  {
    id: 203,
    exam: 'JEE',
    year: 2023,
    subject: 'Physics',
    paper_type: 'JEE Advanced Paper 1',
    title: 'JEE Advanced 2023 Physics Multi-Correct & Numerical Matrix Paper',
    url: 'https://jeeadv.ac.in',
    source: 'IIT Guwahati / Joint Admission Board',
    is_demo: 0,
    durationMinutes: 180,
    totalQuestions: 51,
    totalMarks: 180,
  },
  {
    id: 204,
    exam: 'JEE',
    year: 2023,
    subject: 'Chemistry',
    paper_type: 'JEE Main Session 2',
    title: 'JEE Main 2023 Chemistry Coordination Compounds & Thermodynamics',
    url: 'https://jeemain.nta.ac.in',
    source: 'National Testing Agency (NTA)',
    is_demo: 0,
    durationMinutes: 60,
    totalQuestions: 30,
    totalMarks: 100,
  },
  {
    id: 205,
    exam: 'JEE',
    year: 2022,
    subject: 'All Subjects (Full Length)',
    paper_type: 'JEE Advanced Paper 2',
    title: 'JEE Advanced 2022 Comprehensive Paper 2 with Stepwise Solutions',
    url: 'https://jeeadv.ac.in',
    source: 'IIT Bombay / JAB',
    is_demo: 0,
    durationMinutes: 180,
    totalQuestions: 54,
    totalMarks: 180,
  },
  {
    id: 206,
    exam: 'JEE',
    year: 2021,
    subject: 'Mathematics',
    paper_type: 'JEE Main Session',
    title: 'JEE Main 2021 Coordinate Geometry, Matrices & Probability Paper',
    url: 'https://jeemain.nta.ac.in',
    source: 'National Testing Agency (NTA)',
    is_demo: 0,
    durationMinutes: 60,
    totalQuestions: 30,
    totalMarks: 100,
  },

  // UPSC Papers
  {
    id: 301,
    exam: 'UPSC',
    year: 2024,
    subject: 'General Studies',
    paper_type: 'Prelims Paper 1',
    title: 'UPSC Civil Services Prelims 2024 General Studies (Polity, History, Economy)',
    url: 'https://upsc.gov.in/examinations/previous-question-papers',
    source: 'Union Public Service Commission',
    is_demo: 0,
    durationMinutes: 120,
    totalQuestions: 100,
    totalMarks: 200,
  },
  {
    id: 302,
    exam: 'UPSC',
    year: 2024,
    subject: 'CSAT',
    paper_type: 'Prelims Paper 2',
    title: 'UPSC Civil Services Prelims 2024 CSAT Reading Comprehension & Analytical Reasoning',
    url: 'https://upsc.gov.in/examinations/previous-question-papers',
    source: 'Union Public Service Commission',
    is_demo: 0,
    durationMinutes: 120,
    totalQuestions: 80,
    totalMarks: 200,
  },
  {
    id: 303,
    exam: 'UPSC',
    year: 2023,
    subject: 'General Studies',
    paper_type: 'Mains GS Paper 1',
    title: 'UPSC Civil Services Mains 2023 Indian Heritage, Culture & Geography',
    url: 'https://upsc.gov.in/examinations/previous-question-papers',
    source: 'Union Public Service Commission',
    is_demo: 0,
    durationMinutes: 180,
    totalQuestions: 20,
    totalMarks: 250,
  },
  {
    id: 304,
    exam: 'UPSC',
    year: 2023,
    subject: 'General Studies',
    paper_type: 'Mains GS Paper 2',
    title: 'UPSC Civil Services Mains 2023 Governance, Constitution & International Relations',
    url: 'https://upsc.gov.in/examinations/previous-question-papers',
    source: 'Union Public Service Commission',
    is_demo: 0,
    durationMinutes: 180,
    totalQuestions: 20,
    totalMarks: 250,
  },
  {
    id: 305,
    exam: 'UPSC',
    year: 2022,
    subject: 'General Studies',
    paper_type: 'Prelims Paper 1',
    title: 'UPSC Civil Services Prelims 2022 General Studies Complete Solved Paper',
    url: 'https://upsc.gov.in/examinations/previous-question-papers',
    source: 'Union Public Service Commission',
    is_demo: 0,
    durationMinutes: 120,
    totalQuestions: 100,
    totalMarks: 200,
  },
  {
    id: 306,
    exam: 'UPSC',
    year: 2021,
    subject: 'General Studies',
    paper_type: 'Prelims Paper 1',
    title: 'UPSC Civil Services Prelims 2021 Environment, Science & Ancient History Paper',
    url: 'https://upsc.gov.in/examinations/previous-question-papers',
    source: 'Union Public Service Commission',
    is_demo: 0,
    durationMinutes: 120,
    totalQuestions: 100,
    totalMarks: 200,
  },
  // GATE Biotechnology Papers
  {
    id: 401,
    exam: 'GATE Biotechnology',
    year: 2024,
    subject: 'Biotechnology',
    paper_type: 'Official GATE Question Paper + Solution',
    title: 'GATE 2024 Biotechnology (BT) Solved Question Paper with Answer Key',
    url: 'https://gate2024.iisc.ac.in',
    source: 'IISc Bangalore / GATE Organising Institute',
    is_demo: 0,
    durationMinutes: 180,
    totalQuestions: 65,
    totalMarks: 100,
  },
  {
    id: 402,
    exam: 'GATE Biotechnology',
    year: 2023,
    subject: 'Biotechnology',
    paper_type: 'Subject Paper',
    title: 'GATE 2023 Biotechnology (BT) Recombinant DNA & Process Engineering Paper',
    url: 'https://gate.iitk.ac.in',
    source: 'IIT Kanpur',
    is_demo: 0,
    durationMinutes: 180,
    totalQuestions: 65,
    totalMarks: 100,
  },

  // CSIR UGC NET Papers
  {
    id: 501,
    exam: 'CSIR UGC NET',
    year: 2024,
    subject: 'Life Sciences',
    paper_type: 'Full Length Paper',
    title: 'CSIR UGC NET 2024 Life Sciences Official Question Paper (Part A, B & C)',
    url: 'https://csirnet.nta.ac.in',
    source: 'National Testing Agency (NTA)',
    is_demo: 0,
    durationMinutes: 180,
    totalQuestions: 145,
    totalMarks: 200,
  },
  {
    id: 502,
    exam: 'CSIR UGC NET',
    year: 2023,
    subject: 'Life Sciences',
    paper_type: 'Subject Paper',
    title: 'CSIR NET 2023 Molecular Biology, Cell Communication & Genetics Paper',
    url: 'https://csirnet.nta.ac.in',
    source: 'National Testing Agency (NTA)',
    is_demo: 0,
    durationMinutes: 180,
    totalQuestions: 145,
    totalMarks: 200,
  },

  // GAT-B Papers
  {
    id: 601,
    exam: 'GAT-B',
    year: 2024,
    subject: 'Biotechnology',
    paper_type: 'Postgraduate Entrance Paper',
    title: 'GAT-B 2024 Graduate Aptitude Test Biotechnology Question Paper',
    url: 'https://dbt.nta.ac.in',
    source: 'NTA & Department of Biotechnology',
    is_demo: 0,
    durationMinutes: 180,
    totalQuestions: 160,
    totalMarks: 240,
  },

  // CUET UG Papers
  {
    id: 701,
    exam: 'CUET UG',
    year: 2024,
    subject: 'Biology / Biotechnology',
    paper_type: 'Undergraduate Entrance Paper',
    title: 'CUET UG 2024 Biology & Biotechnology Solved Question Paper',
    url: 'https://cuetug.nta.online',
    source: 'National Testing Agency (NTA)',
    is_demo: 0,
    durationMinutes: 45,
    totalQuestions: 50,
    totalMarks: 200,
  },

  // IIT JAM Papers
  {
    id: 801,
    exam: 'IIT JAM',
    year: 2024,
    subject: 'Biotechnology',
    paper_type: 'M.Sc. Entrance Paper',
    title: 'IIT JAM 2024 Biotechnology (BT) Solved Question Paper',
    url: 'https://jam.iitm.ac.in',
    source: 'IIT Madras / JAM Board',
    is_demo: 0,
    durationMinutes: 180,
    totalQuestions: 60,
    totalMarks: 100,
  },

  // DBT BET & JRF Papers
  {
    id: 901,
    exam: 'DBT BET',
    year: 2023,
    subject: 'Biotechnology Eligibility Test',
    paper_type: 'JRF Entrance Paper',
    title: 'DBT BET 2023 Biotechnology Eligibility Test Solved Question Paper',
    url: 'https://dbt.nta.ac.in',
    source: 'Department of Biotechnology (DBT)',
    is_demo: 0,
    durationMinutes: 180,
    totalQuestions: 200,
    totalMarks: 300,
  },
  {
    id: 950,
    exam: 'CSIR/DBT JRF',
    year: 2023,
    subject: 'Junior Research Fellowship',
    paper_type: 'JRF Solved Paper',
    title: 'CSIR/DBT JRF 2023 Fellowship Solved Question Paper & Answer Key',
    url: 'https://csirnet.nta.ac.in',
    source: 'CSIR / NTA',
    is_demo: 0,
    durationMinutes: 180,
    totalQuestions: 145,
    totalMarks: 200,
  }
];

const EXAMS = [
  'NEET',
  'JEE',
  'UPSC',
  'GATE Biotechnology',
  'CSIR UGC NET',
  'GAT-B',
  'CUET UG',
  'IIT JAM',
  'DBT BET',
  'CSIR/DBT JRF'
];

const SUBJECTS: Record<string, string[]> = {
  NEET: ['All', 'All Subjects (Full Length)', 'Biology', 'Physics', 'Chemistry'],
  JEE: ['All', 'All Subjects (Full Length)', 'Mathematics', 'Physics', 'Chemistry'],
  UPSC: ['All', 'General Studies', 'CSAT'],
  'GATE Biotechnology': ['All', 'Biotechnology'],
  'CSIR UGC NET': ['All', 'Life Sciences'],
  'GAT-B': ['All', 'Biotechnology'],
  'CUET UG': ['All', 'Biology / Biotechnology'],
  'IIT JAM': ['All', 'Biotechnology'],
  'DBT BET': ['All', 'Biotechnology Eligibility Test'],
  'CSIR/DBT JRF': ['All', 'Junior Research Fellowship']
};

const YEARS = ['All', '2024', '2023', '2022', '2021', '2020'];

export default function PastPapersPage() {
  const navigate = useNavigate();
  const [activeExam, setActiveExam] = useState('NEET');
  const [subject, setSubject] = useState('All');
  const [year, setYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPapers();
  }, [activeExam, subject, year, searchQuery]);

  useEffect(() => {
    setSubject('All');
  }, [activeExam]);

  const fetchPapers = async () => {
    setIsLoading(true);

    // Filter local catalog first
    let list = PAST_PAPERS_CATALOG.filter(p => p.exam.toLowerCase() === activeExam.toLowerCase());

    if (subject !== 'All') {
      list = list.filter(p => p.subject.toLowerCase() === subject.toLowerCase());
    }

    if (year !== 'All') {
      list = list.filter(p => p.year.toString() === year);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.paper_type.toLowerCase().includes(q) ||
        p.subject.toLowerCase().includes(q)
      );
    }

    // Try server if reachable
    try {
      const res = await axios.get('/api/papers', {
        params: {
          exam: activeExam,
          subject: subject !== 'All' ? subject : undefined,
          year: year !== 'All' ? year : undefined,
        }
      });
      if (res.data?.papers && res.data.papers.length > 0) {
        // Merge server papers if any
        const serverPapers = res.data.papers.map((p: any) => ({
          id: p.id,
          exam: p.exam,
          year: p.year,
          subject: p.subject,
          paper_type: p.paper_type || 'Exam Paper',
          title: p.title,
          url: p.url,
          source: p.source || 'NTA / UPSC',
          is_demo: p.is_demo || 0,
          durationMinutes: 180,
          totalQuestions: 100,
          totalMarks: 300,
        }));
        list = [...serverPapers, ...list.filter(lp => !serverPapers.some((sp: any) => sp.id === lp.id))];
      }
    } catch {
      // Offline fallback
    }

    setPapers(list);
    setIsLoading(false);
  };

  const examMeta: Record<string, { label: string; tag: string; gradient: string; desc: string; icon: string }> = {
    NEET: {
      label: 'NEET UG Medical',
      tag: 'Medical Entrance (MBBS/BDS)',
      gradient: 'from-emerald-500 to-teal-600',
      desc: 'National Eligibility cum Entrance Test for Medical & Dental admissions across India.',
      icon: '🩺',
    },
    JEE: {
      label: 'JEE Main & Advanced',
      tag: 'Engineering (IIT / NIT)',
      gradient: 'from-blue-500 to-indigo-600',
      desc: 'Joint Entrance Examination for admission to premier IIT, NIT, and IIIT engineering institutes.',
      icon: '⚙️',
    },
    UPSC: {
      label: 'UPSC Civil Services',
      tag: 'IAS / IPS / IFS Examination',
      gradient: 'from-amber-500 to-orange-600',
      desc: 'Premier civil services examination for India’s top administrative and public leadership roles.',
      icon: '🏛️',
    },
    'GATE Biotechnology': {
      label: 'GATE Biotechnology (BT)',
      tag: 'Postgraduate & M.Tech Entrance',
      gradient: 'from-purple-500 to-indigo-600',
      desc: 'Graduate Aptitude Test in Engineering for admissions to M.Tech and Ph.D. programs in premier institutes.',
      icon: '🧬',
    },
    'CSIR UGC NET': {
      label: 'CSIR UGC NET Life Sciences',
      tag: 'JRF & Assistant Professorship',
      gradient: 'from-cyan-500 to-blue-600',
      desc: 'National Eligibility Test for Junior Research Fellowship and Lectureship in Indian Universities.',
      icon: '🔬',
    },
    'GAT-B': {
      label: 'GAT-B Postgraduate Biotech',
      tag: 'DBT M.Sc. Biotechnology Entrance',
      gradient: 'from-pink-500 to-purple-600',
      desc: 'Graduate Aptitude Test - Biotechnology for Department of Biotechnology sponsored postgraduate programs.',
      icon: '🧫',
    },
    'CUET UG': {
      label: 'CUET UG Biological Sciences',
      tag: 'Undergraduate University Entrance',
      gradient: 'from-teal-500 to-cyan-600',
      desc: 'Common University Entrance Test for admission to Central Universities across India.',
      icon: '🎓',
    },
    'IIT JAM': {
      label: 'IIT JAM Biotechnology',
      tag: 'M.Sc. Admission at IITs & IISc',
      gradient: 'from-indigo-500 to-purple-600',
      desc: 'Joint Admission Test for M.Sc. in Biotechnology at Indian Institutes of Technology.',
      icon: '🧪',
    },
    'DBT BET': {
      label: 'DBT BET Biotechnology',
      tag: 'DBT-JRF Fellowship Examination',
      gradient: 'from-rose-500 to-pink-600',
      desc: 'Biotechnology Eligibility Test conducted for award of DBT Junior Research Fellowships.',
      icon: '⚡',
    },
    'CSIR/DBT JRF': {
      label: 'CSIR/DBT Junior Research Fellowship',
      tag: 'Ph.D. & JRF Research Award',
      gradient: 'from-emerald-500 to-cyan-600',
      desc: 'National fellowship examination for doctoral research scholars in Indian research institutes.',
      icon: '🏆',
    }
  };

  const currentMeta = examMeta[activeExam] || {
    label: activeExam,
    tag: 'Competitive Exam',
    gradient: 'from-cyan-500 to-blue-600',
    desc: `Previous year question papers and practice tests for ${activeExam}.`,
    icon: '📝'
  };

  return (
    <div className="page-container pb-16">
      {/* Header */}
      <section aria-labelledby="papers-heading" className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <FileText size={24} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 id="papers-heading" className="text-3xl font-black font-display text-white tracking-tight">
                APD EQUILEARN Past Examination Papers
              </h1>
              <p className="text-slate-400 text-sm">
                Official previous year question papers with step-by-step solutions and interactive practice mode
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
            <Award size={14} className="text-emerald-400" />
            <span>Interactive Timed Practice Mode Enabled</span>
          </div>
        </div>

        {/* Exam Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto p-2 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl scrollbar-none">
          {EXAMS.map(exam => {
            const meta = examMeta[exam] || { icon: '📝' };
            const isActive = activeExam === exam;
            return (
              <button
                key={exam}
                onClick={() => setActiveExam(exam)}
                className={`py-2.5 px-4 rounded-xl text-center font-bold text-xs transition-all duration-300 flex items-center gap-2 shrink-0 ${
                  isActive
                    ? `bg-gradient-to-r ${meta.gradient || 'from-cyan-500 to-blue-600'} text-white shadow-xl`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{meta.icon}</span>
                <span>{exam}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Exam Overview Spotlight Banner */}
      <div className="glass-card p-5 mb-8 border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-white">{currentMeta.label}</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
              {currentMeta.tag}
            </span>
          </div>
          <p className="text-xs text-slate-400">{currentMeta.desc}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-300 shrink-0">
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-emerald-400" />
            <span>Full Exam Simulation</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Detailed Answers & Keys</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <section aria-label="Paper filters" className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 glass-card border-slate-800 text-xs">
          {/* Subject Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Subject:</span>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
              aria-label="Filter by subject"
            >
              {SUBJECTS[activeExam]?.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Year:</span>
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
              aria-label="Filter by year"
            >
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by topic, paper title..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="text-slate-400">
            Found <strong className="text-white">{papers.length}</strong> official papers
          </div>
        </div>
      </section>

      {/* Papers Grid */}
      <section aria-label="Past papers list">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={36} className="animate-spin text-emerald-500 mb-3" />
            <p className="text-slate-400 font-medium">Loading previous examination papers...</p>
          </div>
        ) : papers.length === 0 ? (
          <div className="glass-card p-12 text-center max-w-xl mx-auto">
            <AlertCircle size={40} className="mx-auto text-amber-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">No past papers found</h3>
            <p className="text-slate-400 text-sm mb-6">
              Try adjusting your subject or year filters to view available examination papers.
            </p>
            <button
              onClick={() => { setSubject('All'); setYear('All'); setSearchQuery(''); }}
              className="btn-primary text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {papers.map(paper => (
              <div
                key={paper.id}
                className="glass-card p-6 flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {paper.exam} {paper.year}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {paper.subject}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug mb-2">
                    {paper.title}
                  </h3>

                  <div className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
                    <span>🏛️ Official Body:</span>
                    <span className="font-semibold text-slate-300">{paper.source}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-slate-900/80 border border-slate-800 rounded-xl mb-4 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase">Duration</div>
                      <div className="text-xs font-bold text-white">{paper.durationMinutes} mins</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase">Questions</div>
                      <div className="text-xs font-bold text-white">{paper.totalQuestions} Qs</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase">Max Marks</div>
                      <div className="text-xs font-bold text-emerald-400">{paper.totalMarks} pts</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => navigate(`/past-papers/${paper.id}/practice`)}
                    className="btn-primary !bg-emerald-600 hover:!bg-emerald-500 flex-1 !py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Play size={14} className="fill-current" />
                    <span>Start Practice Test</span>
                  </button>

                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/40 transition-all"
                    title="Download / View Official PDF Paper"
                    aria-label={`Download official paper: ${paper.title}`}
                  >
                    <Download size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
