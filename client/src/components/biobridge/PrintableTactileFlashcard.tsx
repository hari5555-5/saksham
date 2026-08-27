import React, { useState } from 'react';
import { Printer, Volume2, Sparkles, X, Check, Eye } from 'lucide-react';

interface PrintableTactileFlashcardProps {
  title: string;
  categoryOrExam: string;
  summaryOrQuestion: string;
  keyPointsOrExplanation: string[];
  biomarkerOrConcept: string;
  simplifiedTakeaway: string;
  onClose?: () => void;
}

export const PrintableTactileFlashcard: React.FC<PrintableTactileFlashcardProps> = ({
  title,
  categoryOrExam,
  summaryOrQuestion,
  keyPointsOrExplanation,
  biomarkerOrConcept,
  simplifiedTakeaway,
  onClose
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [highContrastPrint, setHighContrastPrint] = useState(true);

  const handleSpeakAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isPlayingAudio) {
        setIsPlayingAudio(false);
        return;
      }

      const textToRead = `Flashcard: ${title}. Exam or category: ${categoryOrExam}. Question or summary: ${summaryOrQuestion}. Key points: ${keyPointsOrExplanation.join('. ')}. Biological concept: ${biomarkerOrConcept}. Simplified takeaway: ${simplifiedTakeaway}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="rounded-3xl bg-slate-950 border-2 border-yellow-400/80 p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-100 print:text-black print:bg-white print:border-black font-sans" role="region" aria-label={`Accessible study flashcard for ${title}`}>
      
      {/* Non-printable action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-yellow-400/40 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-yellow-400 text-slate-950 font-black">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-yellow-300">ACCESSIBLE STUDY FLASHCARD (TACTILE & BLIND FRIENDLY)</h3>
            <p className="text-xs text-slate-300">High Contrast • Screen-Reader Optimized • Print Ready</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeakAudio}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isPlayingAudio ? 'bg-rose-500 text-white' : 'bg-slate-800 text-yellow-300 border border-yellow-400/40 hover:bg-slate-700'
            }`}
            aria-label="Read flashcard aloud using audio text-to-speech"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isPlayingAudio ? 'Stop Audio' : 'Listen Audio'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 text-slate-950 font-extrabold text-xs shadow-lg hover:bg-yellow-300 transition-all"
            aria-label="Print flashcard for tactile study"
          >
            <Printer className="w-4 h-4" />
            <span>Print Flashcard</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white"
              aria-label="Close flashcard modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* PRINTABLE HIGH-CONTRAST FLASHCARD BODY */}
      <div className="space-y-6 print:space-y-4">
        
        {/* Tactile Print Header Stamp */}
        <div className="flex items-center justify-between border-b-4 border-yellow-400 print:border-black pb-3">
          <div>
            <span className="text-xs uppercase font-black tracking-widest text-yellow-400 print:text-black">
              APD EQUILEARN • {categoryOrExam}
            </span>
            <h2 className="text-2xl font-black text-white print:text-black tracking-tight mt-1">
              {title}
            </h2>
          </div>
          <div className="hidden print:block text-right text-xs font-bold border-2 border-black p-2">
            TACTILE / BRAILLE READY
          </div>
        </div>

        {/* Question or Paper Summary */}
        <div className="p-4 rounded-2xl bg-slate-900 border-2 border-yellow-400/50 print:border-black print:bg-gray-100 text-base leading-relaxed text-slate-100 print:text-black font-semibold">
          <span className="block text-xs uppercase tracking-wider font-extrabold text-yellow-400 print:text-black mb-1">
            CORE SUMMARY / QUESTION:
          </span>
          {summaryOrQuestion}
        </div>

        {/* Key Study Points */}
        <div className="space-y-2">
          <span className="block text-xs uppercase tracking-wider font-extrabold text-yellow-400 print:text-black">
            KEY POINTS TO MEMORIZE:
          </span>
          <ul className="space-y-2">
            {keyPointsOrExplanation.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700 print:border-black print:bg-white text-sm font-medium text-slate-200 print:text-black">
                <span className="w-6 h-6 rounded-full bg-yellow-400 text-slate-950 print:bg-black print:text-white font-black text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Target Concept & Simplified Takeaway Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-900 border-2 border-cyan-400/60 print:border-black print:bg-white">
            <span className="block text-xs uppercase tracking-wider font-black text-cyan-300 print:text-black mb-1">
              BIOLOGICAL CONCEPT / TARGET:
            </span>
            <p className="text-sm font-bold text-white print:text-black">{biomarkerOrConcept}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border-2 border-emerald-400/60 print:border-black print:bg-white">
            <span className="block text-xs uppercase tracking-wider font-black text-emerald-300 print:text-black mb-1">
              SIMPLIFIED TAKEAWAY:
            </span>
            <p className="text-sm font-bold text-white print:text-black">{simplifiedTakeaway}</p>
          </div>
        </div>

        {/* Footer info for blind accessibility */}
        <div className="pt-4 border-t-2 border-slate-800 print:border-black flex items-center justify-between text-xs text-slate-400 print:text-black">
          <span>APD EQUILEARN Accessible Biotechnology Education</span>
          <span>Tactile Print Standard • Large Type 18pt</span>
        </div>

      </div>

    </div>
  );
};
