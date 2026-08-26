import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock,
  Flag, Send, RotateCcw, Loader2, AlertCircle, BookOpen
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface Paper {
  id: number;
  title: string;
  exam: string;
  year: number;
  subject: string;
  is_demo: number;
  questions: Question[];
}

type AnswerState = number | null;

export default function PracticeModePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [flagged, setFlagged] = useState<boolean[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const res = await axios.get(`/api/papers/${id}`);
        setPaper(res.data);
        setAnswers(new Array(res.data.questions?.length || 0).fill(null));
        setFlagged(new Array(res.data.questions?.length || 0).fill(false));
      } catch (err) {
        setError('Could not load this practice paper. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaper();
  }, [id]);

  useEffect(() => {
    if (!submitted) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [submitted]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const selectAnswer = (optIdx: number) => {
    if (submitted) return;
    setAnswers(prev => { const a = [...prev]; a[current] = optIdx; return a; });
  };

  const toggleFlag = () => {
    setFlagged(prev => { const f = [...prev]; f[current] = !f[current]; return f; });
  };

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitted(true);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-96" aria-live="polite" aria-busy="true">
      <Loader2 size={40} className="animate-spin text-primary-500" aria-hidden="true" />
    </div>
  );

  if (error) return (
    <div className="page-container text-center py-20">
      <AlertCircle size={48} className="text-red-400 mx-auto mb-4" aria-hidden="true" />
      <p className="text-slate-500 mb-4">{error}</p>
      <button onClick={() => navigate('/past-papers')} className="btn-primary">
        <ArrowLeft size={18} aria-hidden="true" /> Back to Papers
      </button>
    </div>
  );

  if (!paper || !paper.questions?.length) return (
    <div className="page-container text-center py-20">
      <BookOpen size={48} className="text-slate-300 mx-auto mb-4" aria-hidden="true" />
      <p className="text-slate-500 mb-4">No practice questions available for this paper.</p>
      <button onClick={() => navigate('/past-papers')} className="btn-primary">
        <ArrowLeft size={18} aria-hidden="true" /> Back to Papers
      </button>
    </div>
  );

  const questions = paper.questions;
  const q = questions[current];

  // Results view
  if (submitted) {
    const correct = answers.filter((a, i) => a === questions[i].correct).length;
    const attempted = answers.filter(a => a !== null).length;
    const incorrect = attempted - correct;
    const unanswered = questions.length - attempted;
    const score = Math.round((correct / questions.length) * 100);

    return (
      <div className="page-container max-w-3xl">
        <div className="card p-8 text-center mb-8">
          <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-black text-white ${
            score >= 70 ? 'bg-gradient-to-br from-emerald-400 to-green-600' : score >= 40 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-red-400 to-rose-600'
          }`} aria-label={`Score: ${score}%`}>
            {score}%
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Practice Complete!</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{paper.title}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Time taken: {formatTime(elapsed)}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Total', value: questions.length, color: 'text-slate-900 dark:text-white' },
              { label: 'Correct', value: correct, color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Incorrect', value: incorrect, color: 'text-red-600 dark:text-red-400' },
              { label: 'Unanswered', value: unanswered, color: 'text-slate-500' },
            ].map(s => (
              <div key={s.label} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Answers review */}
        <section aria-labelledby="review-heading" className="space-y-4">
          <h2 id="review-heading" className="text-xl font-bold text-slate-900 dark:text-white">Review Answers</h2>
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correct;
            const isAttempted = answers[i] !== null;
            return (
              <div key={q.id} className={`card p-5 border-l-4 ${isCorrect ? 'border-l-emerald-500' : isAttempted ? 'border-l-red-500' : 'border-l-slate-300'}`}>
                <div className="flex items-start gap-3 mb-3">
                  {isCorrect ? <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" aria-label="Correct" /> :
                    isAttempted ? <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" aria-label="Incorrect" /> :
                    <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 shrink-0 mt-0.5" aria-label="Not attempted" />
                  }
                  <p className="font-medium text-slate-900 dark:text-white text-sm">Q{i + 1}. {q.question}</p>
                </div>
                <div className="ml-7 space-y-1.5 mb-3">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={`p-2.5 rounded-lg text-sm flex items-center gap-2 ${
                      oi === q.correct ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium' :
                      oi === answers[i] && oi !== q.correct ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                      'text-slate-600 dark:text-slate-400'
                    }`}>
                      {oi === q.correct && <CheckCircle size={13} aria-hidden="true" />}
                      {oi === answers[i] && oi !== q.correct && <XCircle size={13} aria-hidden="true" />}
                      {String.fromCharCode(65 + oi)}. {opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="ml-7 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Explanation</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <div className="flex gap-3 mt-8 justify-center">
          <button onClick={() => navigate('/past-papers')} className="btn-secondary">
            <ArrowLeft size={18} aria-hidden="true" /> Back to Papers
          </button>
          <button onClick={() => { setSubmitted(false); setAnswers(new Array(questions.length).fill(null)); setElapsed(0); setCurrent(0); }} className="btn-primary">
            <RotateCcw size={18} aria-hidden="true" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // Practice view
  return (
    <div className="page-container max-w-3xl">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button onClick={() => navigate('/past-papers')} className="btn-ghost" aria-label="Back to past papers">
          <ArrowLeft size={18} aria-hidden="true" /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-mono font-bold text-slate-700 dark:text-slate-200" aria-label={`Time elapsed: ${formatTime(elapsed)}`}>
            <Clock size={15} aria-hidden="true" />
            {formatTime(elapsed)}
          </div>
          <button
            onClick={handleSubmit}
            className="btn-primary text-sm py-2"
            aria-label="Submit practice test"
          >
            <Send size={14} aria-hidden="true" /> Submit
          </button>
        </div>
      </div>

      {/* Paper title */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">{paper.title}</h1>
        {paper.is_demo === 1 && <span className="badge-demo mt-1">Demo Questions</span>}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
          <span>Question {current + 1} of {questions.length}</span>
          <span>{answers.filter(a => a !== null).length} answered</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={questions.length}>
          <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Question nav dots */}
      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Question navigation">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
              i === current ? 'bg-primary-600 text-white scale-110' :
              answers[i] !== null ? 'bg-emerald-500 text-white' :
              flagged[i] ? 'bg-orange-400 text-white' :
              'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
            aria-label={`Question ${i + 1}${answers[i] !== null ? ', answered' : ''}${flagged[i] ? ', flagged' : ''}`}
            aria-current={i === current ? 'true' : undefined}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <section className="card p-6 mb-4" aria-labelledby={`q-heading-${q.id}`}>
        <div className="flex items-start justify-between mb-4">
          <h2 id={`q-heading-${q.id}`} className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed flex-1">
            <span className="text-primary-500 mr-2">Q{current + 1}.</span>{q.question}
          </h2>
          <button
            onClick={toggleFlag}
            className={`ml-3 p-2 rounded-lg transition-colors ${flagged[current] ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'text-slate-400 hover:text-orange-500'}`}
            aria-label={flagged[current] ? 'Remove flag from this question' : 'Flag this question for review'}
            aria-pressed={flagged[current]}
          >
            <Flag size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-3" role="radiogroup" aria-label={`Options for question ${current + 1}`}>
          {q.options.map((opt, oi) => (
            <button
              key={oi}
              onClick={() => selectAnswer(oi)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                answers[current] === oi
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 text-slate-700 dark:text-slate-300'
              }`}
              role="radio"
              aria-checked={answers[current] === oi}
              aria-label={`Option ${String.fromCharCode(65 + oi)}: ${opt}`}
            >
              <span className="font-bold mr-3 text-slate-500 dark:text-slate-400">{String.fromCharCode(65 + oi)}.</span>
              {opt}
            </button>
          ))}
        </div>
      </section>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="btn-secondary disabled:opacity-50"
          aria-label="Previous question"
        >
          <ArrowLeft size={18} aria-hidden="true" /> Previous
        </button>
        <span className="text-sm text-slate-500" aria-live="polite">
          {answers[current] !== null ? '✓ Answered' : 'Not answered'}
          {flagged[current] ? ' · 🚩 Flagged' : ''}
        </span>
        {current < questions.length - 1 ? (
          <button
            onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
            className="btn-primary"
            aria-label="Next question"
          >
            Next <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : (
          <button onClick={handleSubmit} className="btn-primary bg-emerald-600 hover:bg-emerald-700" aria-label="Submit test">
            <Send size={18} aria-hidden="true" /> Submit
          </button>
        )}
      </div>
    </div>
  );
}
