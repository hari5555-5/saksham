import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface SafetyDisclaimerProps {
  compact?: boolean;
}

export const SafetyDisclaimer: React.FC<SafetyDisclaimerProps> = ({ compact = false }) => {
  return (
    <div className={`rounded-xl bg-cyan-950/40 border border-cyan-500/30 p-4 ${compact ? 'py-2 px-3 text-xs' : 'text-sm'} text-cyan-200 backdrop-blur-md flex items-start gap-3 my-4`}>
      <AlertTriangle className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-cyan-400 shrink-0 mt-0.5`} />
      <div>
        <p className="font-semibold text-cyan-300 mb-0.5">Scientific Responsibility & Educational Disclaimer</p>
        <p className="text-cyan-200/90 leading-relaxed">
          APD EQUILEARN is an educational and research exploration platform designed to aid biotechnology learning, exam preparation, and research concept formulation. <strong className="text-white">APD EQUILEARN does not provide medical diagnosis, clinical decisions, personal health assessments, or biological determinations of gender identity or neurodiversity.</strong>
        </p>
      </div>
    </div>
  );
};
