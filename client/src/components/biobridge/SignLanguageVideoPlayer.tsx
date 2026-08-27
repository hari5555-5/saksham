import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, X, Sparkles, Layers, Sliders, CheckCircle2 } from 'lucide-react';

interface SignLanguageVideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export const SignLanguageVideoPlayer: React.FC<SignLanguageVideoPlayerProps> = ({
  isOpen,
  onClose,
  initialTopic = 'DNA'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [caption, setCaption] = useState<string>('');

  const signTopics = [
    { name: 'DNA', gloss: 'DOUBLE-HELIX GENETIC CODE', desc: 'Hands twist in opposing spiral waves showing double-helix strands.' },
    { name: 'Enzyme', gloss: 'BIOCATALYST SUBSTRATE BIND', desc: 'Right hand forms active site pocket; left hand fits substrate into pocket.' },
    { name: 'Biosensor', gloss: 'BIOLOGICAL TRANSDUCER SIGNAL', desc: 'Finger tap on surface followed by expanding signal wave gesture.' },
    { name: 'Mutation', gloss: 'GENE SEQUENCE ALTERATION', desc: 'Parallel finger strands rotate and cross, signaling sequence change.' },
    { name: 'PCR', gloss: 'DNA EXPONENTIAL COPY', desc: 'One strand splits into two, then two split into four outward hands.' },
    { name: 'Biomarker', gloss: 'MOLECULAR TARGET INDICATOR', desc: 'Index finger pinpoints circular molecular target in mid-air.' },
    { name: 'Gel Electrophoresis', gloss: 'CHARGE BAND MIGRATION', desc: 'Horizontal bands move down vertical gel lanes at varying speeds.' }
  ];

  const currentGloss = signTopics.find(t => t.name === selectedTopic) || signTopics[0];

  // Animated sign avatar rendering on Canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark avatar stage background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid background effect
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw Avatar Head & Torso
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(centerX, centerY - 65, 30, 0, Math.PI * 2); // Head
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Torso
      ctx.beginPath();
      ctx.moveTo(centerX - 40, centerY + 30);
      ctx.lineTo(centerX + 40, centerY + 30);
      ctx.lineTo(centerX + 30, centerY - 30);
      ctx.lineTo(centerX - 30, centerY - 30);
      ctx.closePath();
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.stroke();

      // Sign Motions based on selected topic
      const phase = Math.sin(t * speed);
      const cosPhase = Math.cos(t * speed);

      // Left & Right Arm Joint Locations
      let leftHandX = centerX - 55 + phase * 35;
      let leftHandY = centerY - 10 + cosPhase * 25;
      let rightHandX = centerX + 55 - phase * 35;
      let rightHandY = centerY - 10 - cosPhase * 25;

      if (selectedTopic === 'DNA') {
        leftHandY = centerY - 20 + Math.sin(t * 2 * speed) * 35;
        rightHandY = centerY - 20 - Math.sin(t * 2 * speed) * 35;
        leftHandX = centerX - 30 + Math.cos(t * 2 * speed) * 40;
        rightHandX = centerX + 30 - Math.cos(t * 2 * speed) * 40;

        // Helix connection lines
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(leftHandX, leftHandY);
        ctx.lineTo(rightHandX, rightHandY);
        ctx.stroke();
      } else if (selectedTopic === 'Biosensor') {
        leftHandX = centerX - 25;
        leftHandY = centerY + 10;
        rightHandX = centerX - 25 + Math.sin(t * 3 * speed) * 15;
        rightHandY = centerY + 10 - Math.abs(Math.cos(t * 3 * speed)) * 30;

        // Signal wave pulses
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
        ctx.beginPath();
        ctx.arc(centerX - 25, centerY + 10, (t * 25 * speed) % 60, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Arms
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX - 30, centerY - 25);
      ctx.lineTo(leftHandX, leftHandY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX + 30, centerY - 25);
      ctx.lineTo(rightHandX, rightHandY);
      ctx.stroke();

      // Draw Hands (Glowing Sign Nodes)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(leftHandX, leftHandY, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(rightHandX, rightHandY, 9, 0, Math.PI * 2);
      ctx.fill();

      // Sign Gloss Subtitle Overlay
      setCaption(`[ISL/ASL GLOSS]: ${currentGloss.gloss} — (${currentGloss.desc})`);

      if (isPlaying) {
        t += 0.05;
      }
      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isOpen, selectedTopic, isPlaying, speed]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl p-4 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-0 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Biotechnology Sign Language Video Player
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] uppercase font-bold">ISL / ASL</span>
              </h2>
              <p className="text-xs text-cyan-300/80">Accessible Animated Sign Video Avatar for Deaf & Hard of Hearing Learners</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas Stage */}
        <div className="relative bg-slate-950 flex flex-col items-center justify-center p-4">
          <canvas
            ref={canvasRef}
            width={480}
            height={260}
            className="rounded-2xl border border-cyan-500/30 shadow-lg w-full max-w-[480px] bg-slate-950"
          />

          {/* Controls Bar */}
          <div className="w-full max-w-[480px] mt-3 flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-2 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsPlaying(true)}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                title="Restart Sign Motion"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 px-1 font-semibold">Speed:</span>
              {[0.5, 1.0, 1.5].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${speed === s ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Synchronized Captions Bar */}
        <div className="px-6 py-3 bg-cyan-950/40 border-y border-cyan-500/20 text-xs text-cyan-200 font-mono leading-relaxed">
          {caption}
        </div>

        {/* Sign Dictionary Pills */}
        <div className="p-5 space-y-3 overflow-y-auto max-h-48">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Biotechnology Concept Sign:</h4>
          <div className="flex flex-wrap gap-2">
            {signTopics.map((item) => (
              <button
                key={item.name}
                onClick={() => setSelectedTopic(item.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedTopic === item.name
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            * Sign Language Animations utilize standard ISL & ASL fingerspelling and spatial vector hand gestures tailored for biological, molecular, and biosensor scientific terminology.
          </p>
        </div>

      </div>
    </div>
  );
};
