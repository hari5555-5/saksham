import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Sparkles,
  Award,
  TrendingUp,
  BarChart2,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  BookOpen,
  FileText,
  Clock,
  Download,
  Play,
  Search
} from 'lucide-react';
import { biobridgeApi } from '../../services/biobridgeApi';
import { CompetitiveQuestion, ConceptExplanation } from '../../types/biobridge';
import { SafetyDisclaimer } from '../../components/biobridge/SafetyDisclaimer';
import { PrintableTactileFlashcard } from '../../components/biobridge/PrintableTactileFlashcard';
import { PAST_PAPERS_CATALOG, PastPaper } from '../PastPapersPage';

export const BioBridgeCompetitivePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeMainTab, setActiveMainTab] = useState<'mcqs' | 'past-papers'>('mcqs');
  const [questions, setQuestions] = useState<CompetitiveQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  
  // Active Question Index & User Selection
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // AI Concept Detection on Wrong Answer
  const [aiConceptExplanation, setAiConceptExplanation] = useState<ConceptExplanation | null>(null);
  const [explainLoading, setExplainLoading] = useState<boolean>(false);

  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);

  const exams = [
    'All',
    'GATE Biotechnology',
    'JEE',
    'NEET',
    'UPSC',
    'CSIR UGC NET',
    'GAT-B',
    'CUET UG',
    'IIT JAM',
    'DBT BET',
    'CSIR/DBT JRF'
  ];
  const topics = ['All', 'Molecular Biology', 'Genetics', 'Biochemistry', 'Biosensors', 'Microbiology', 'Cell Biology', 'Bioinformatics'];

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const qList = await biobridgeApi.getCompetitiveQuestions({
        exam: selectedExam === 'All' ? undefined : selectedExam,
        topic: selectedTopic === 'All' ? undefined : selectedTopic
      });
      setQuestions(qList);
      setCurrentIndex(0);
      resetQuestionState();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await biobridgeApi.getCompetitiveAnalytics();
      setAnalytics(data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchQuestions();
    fetchAnalytics();
  }, [selectedExam, selectedTopic]);

  const resetQuestionState = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setIsCorrect(false);
    setAiConceptExplanation(null);
  };

  const currentQ = questions[currentIndex];

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !currentQ || submitted) return;

    const correct = selectedOption === currentQ.correct_answer;
    setSubmitted(true);
    setIsCorrect(correct);

    // Save performance
    biobridgeApi.recordPerformance(currentQ.id, selectedOption, correct).then(fetchAnalytics).catch(() => {});

    // If incorrect, trigger AI Concept Detection
    if (!correct) {
      setExplainLoading(true);
      try {
        const exp = await biobridgeApi.explainConcept(currentQ, selectedOption, currentQ.correct_answer);
        setAiConceptExplanation(exp);
      } catch (err) {
        console.error(err);
      } finally {
        setExplainLoading(false);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetQuestionState();
    }
  };

  // Past papers sub-tab state
  const [pastPaperExam, setPastPaperExam] = useState<string>('All');
  const [pastPaperSearch, setPastPaperSearch] = useState<string>('');

  const filteredPastPapers = PAST_PAPERS_CATALOG.filter(p => {
    const matchExam = pastPaperExam === 'All' || p.exam.toLowerCase().includes(pastPaperExam.toLowerCase());
    const matchSearch = !pastPaperSearch || p.title.toLowerCase().includes(pastPaperSearch.toLowerCase()) || p.subject.toLowerCase().includes(pastPaperSearch.toLowerCase());
    return matchExam && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-500/30 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            <span>Biotechnology Exam Prep & Concept AI</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Competitive — Biotechnology-Oriented Preparation
          </h1>
          <p className="text-slate-400 text-sm max-w-3xl">
            Master GATE Biotechnology, NEET, JEE, UPSC, CSIR NET, GAT-B, CUET UG, IIT JAM, DBT BET, and JRF entrance exams with solved past papers and AI concept detection.
          </p>
        </div>
      </div>

      <SafetyDisclaimer compact />

      {/* Main Sub-Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveMainTab('mcqs')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
            activeMainTab === 'mcqs'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>MCQ Practice & AI Concept Detection</span>
        </button>

        <button
          onClick={() => setActiveMainTab('past-papers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
            activeMainTab === 'past-papers'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Official Past Papers Catalog & Timed Mock Tests</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] uppercase font-black border border-emerald-500/40">
            {PAST_PAPERS_CATALOG.length} Papers
          </span>
        </button>
      </div>

      {/* MCQ PRACTICE TAB CONTENT */}
      {activeMainTab === 'mcqs' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Analytics Dashboard Grid */}
          {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Total Answered</span>
              <p className="text-2xl font-extrabold text-slate-100">{analytics.totalQuestionsAnswered}</p>
            </div>
            <BookOpen className="w-6 h-6 text-cyan-400" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Accuracy Rate</span>
              <p className="text-2xl font-extrabold text-slate-100">{analytics.accuracy}%</p>
            </div>
            <Award className="w-6 h-6 text-blue-400" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[11px] text-emerald-400 font-bold uppercase">Strong Topics</span>
            <p className="text-xs text-slate-200 line-clamp-1">
              {analytics.strongTopics.length > 0 ? analytics.strongTopics.map((t: any) => t.topic).join(', ') : 'Building topic mastery...'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[11px] text-amber-400 font-bold uppercase">Focus Needed</span>
            <p className="text-xs text-slate-200 line-clamp-1">
              {analytics.weakTopics.length > 0 ? analytics.weakTopics.map((t: any) => t.topic).join(', ') : 'Keep practicing!'}
            </p>
          </div>
        </div>
      )}

      {/* Exam & Topic Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <span className="text-xs text-slate-400 font-medium shrink-0">Exam:</span>
          {exams.map((e) => (
            <button
              key={e}
              onClick={() => setSelectedExam(e)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedExam === e
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
          <span className="text-xs text-slate-400 font-medium shrink-0">Topic:</span>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTopic === t
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Question & AI Breakdown Area */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading competitive questions...</div>
      ) : !currentQ ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
          <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-200">No questions available for this filter</h3>
          <p className="text-slate-400 text-xs mt-1">Try selecting "All" exams or topics.</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* MCQ Question Card */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            
            {/* Top Info */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                  {currentQ.exam}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                  {currentQ.topic}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
              {currentQ.question}
            </h2>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                let borderClass = 'border-slate-800 bg-slate-950/80 hover:border-cyan-500/50';
                if (selectedOption === idx) {
                  borderClass = 'border-cyan-400 bg-cyan-950/40 text-cyan-200';
                }
                if (submitted) {
                  if (idx === currentQ.correct_answer) {
                    borderClass = 'border-emerald-500 bg-emerald-950/50 text-emerald-200';
                  } else if (selectedOption === idx && !isCorrect) {
                    borderClass = 'border-rose-500 bg-rose-950/50 text-rose-200';
                  }
                }

                return (
                  <div
                    key={idx}
                    onClick={() => !submitted && setSelectedOption(idx)}
                    className={`cursor-pointer p-4 rounded-2xl border text-sm transition-all flex items-center justify-between font-medium ${borderClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {submitted && idx === currentQ.correct_answer && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {submitted && selectedOption === idx && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit & Next Controls */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <span className="text-xs text-slate-400">Concept: <strong className="text-cyan-400">{currentQ.concept}</strong></span>

              {!submitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold text-sm shadow-md disabled:opacity-40 hover:scale-105 transition-all"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  disabled={currentIndex >= questions.length - 1}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm shadow-md hover:scale-105 transition-all disabled:opacity-40"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

          {/* AI Concept Detection Card (Appears after submission) */}
          {submitted && (
            <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-purple-500/20 pb-3">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-slate-100 text-base">
                  {isCorrect ? 'Correct Answer Breakdown' : 'AI Concept Detection & Learning Guidance'}
                </h3>
              </div>

              <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
                <p><strong className="text-purple-300">Explanation: </strong>{currentQ.explanation}</p>

                {explainLoading && (
                  <p className="text-cyan-400 font-medium animate-pulse">BioBridge AI is analyzing why this concept was missed...</p>
                )}

                {aiConceptExplanation && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/20 space-y-2 mt-2">
                    <p className="text-purple-300 font-bold">Concept Identified: {aiConceptExplanation.concept_identified}</p>
                    <p className="text-slate-300"><strong className="text-rose-400">Why Selected Answer Was Incorrect: </strong>{aiConceptExplanation.why_incorrect}</p>
                    <p className="text-slate-300"><strong className="text-emerald-400">Correct Biological Principle: </strong>{aiConceptExplanation.correct_principle}</p>
                    <p className="text-cyan-300 italic"><strong className="text-cyan-400">Simple Analogy: </strong>"{aiConceptExplanation.simple_example}"</p>
                  </div>
                )}
              </div>

              {/* ACCESSIBLE PRINTABLE FLASHCARD FOR COMPETITIVE EXAM */}
              <div className="pt-4 border-t border-purple-500/20">
                <PrintableTactileFlashcard
                  title={`${currentQ.exam} — ${currentQ.topic}`}
                  categoryOrExam={currentQ.exam}
                  summaryOrQuestion={currentQ.question}
                  keyPointsOrExplanation={currentQ.options.map((opt, i) => `${String.fromCharCode(65 + i)}: ${opt}${i === currentQ.correct_answer ? ' (Correct Answer)' : ''}`)}
                  biomarkerOrConcept={currentQ.concept}
                  simplifiedTakeaway={currentQ.explanation}
                />
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )}

      {/* ---------------------------------------------------- */}
      {/* 2. OFFICIAL PAST PAPERS CATALOG TAB                  */}
      {/* ---------------------------------------------------- */}
      {activeMainTab === 'past-papers' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Filter Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
              <span className="text-xs text-slate-400 font-bold shrink-0">Filter Exam:</span>
              {['All', ...exams.filter(e => e !== 'All')].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPastPaperExam(ex)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    pastPaperExam === ex
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {ex}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={pastPaperSearch}
                onChange={(e) => setPastPaperSearch(e.target.value)}
                placeholder="Search paper title or subject..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Papers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPastPapers.map((paper) => (
              <div
                key={paper.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-xl space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      {paper.exam} {paper.year}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{paper.subject}</span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-100 leading-snug">
                    {paper.title}
                  </h3>

                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span>🏛️ Authority:</span>
                    <span className="font-semibold text-slate-200">{paper.source}</span>
                  </p>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Duration</span>
                      <p className="font-bold text-slate-200">{paper.durationMinutes} mins</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Questions</span>
                      <p className="font-bold text-slate-200">{paper.totalQuestions} Qs</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Max Marks</span>
                      <p className="font-bold text-emerald-400">{paper.totalMarks} pts</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => navigate(`/past-papers/${paper.id}/practice`)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-emerald-400 shadow-md transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Practice Test</span>
                  </button>

                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/40 transition-all"
                    title="Download Official Paper PDF"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>

                {/* Tactile Flashcard */}
                <div className="pt-2">
                  <PrintableTactileFlashcard
                    title={`${paper.exam} ${paper.year} — ${paper.subject}`}
                    categoryOrExam={paper.exam}
                    summaryOrQuestion={paper.title}
                    keyPointsOrExplanation={[
                      `Authority: ${paper.source}`,
                      `Exam Duration: ${paper.durationMinutes} Minutes`,
                      `Total Questions: ${paper.totalQuestions} Questions (${paper.totalMarks} Points)`
                    ]}
                    biomarkerOrConcept={`${paper.exam} Solved Past Paper`}
                    simplifiedTakeaway="Official exam paper with answer keys, solution guides, and timed practice test mode."
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
