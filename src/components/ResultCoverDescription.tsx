import React, { useState } from 'react';
import { Copy, Check, Edit3, ShieldAlert, CheckCircle2, Sparkles, AlertTriangle, Mic2, Music2 } from 'lucide-react';
import { MAX_COVER_DESCRIPTION_CHARS } from '../constants';
import { ValidatorService } from '../services/validatorService';
import { CustomIntroConfig } from '../types';

interface ResultCoverDescriptionProps {
  description: string;
  onChange: (newDescription: string) => void;
  wasOptimized?: boolean;
  replacementVocal?: string;
  customIntro?: CustomIntroConfig;
}

export const ResultCoverDescription: React.FC<ResultCoverDescriptionProps> = ({
  description,
  onChange,
  wasOptimized = false,
  replacementVocal,
  customIntro,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const charCount = ValidatorService.countCharacters(description);
  const isValid = charCount <= MAX_COVER_DESCRIPTION_CHARS && charCount > 0;
  const isOverLimit = charCount > MAX_COVER_DESCRIPTION_CHARS;

  const handleCopy = async () => {
    if (isOverLimit) {
      alert(`Output tidak dapat disalin karena melebihi batas 1.500 karakter (${charCount} karakter). Silakan edit atau kurangi teks terlebih dahulu.`);
      return;
    }
    try {
      await navigator.clipboard.writeText(description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className={`w-full glass-card rounded-2xl p-6 border transition-all duration-300 ${
      isOverLimit ? 'border-rose-500/60' : 'border-studio-700/80 hover:border-blue-500/40'
    }`}>
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-studio-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 font-mono font-bold text-xs">
            01
          </div>
          <div>
            <h3 className="text-base font-extrabold uppercase tracking-wide text-white flex flex-wrap items-center gap-2">
              <span>COVER DESCRIPTION</span>
              {replacementVocal && (
                <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 rounded-md flex items-center space-x-1" title="Vocal Character Replacement Aktif">
                  <Mic2 className="w-3 h-3 text-indigo-400" />
                  <span>Vocal: {replacementVocal}</span>
                </span>
              )}
              {customIntro?.enabled && (
                <span className="px-2 py-0.5 text-[10px] font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30 rounded-md flex items-center space-x-1" title={`Custom Intro: ${customIntro.atmosphere}`}>
                  <Music2 className="w-3 h-3 text-blue-400" />
                  <span>Intro: {customIntro.atmosphere}</span>
                </span>
              )}
              {wasOptimized && (
                <span className="px-2 py-0.5 text-[10px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-md flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Teroptimasi Otomatis</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Satu paragraf padu bahasa Inggris mencakup 5 dimensi musikal esensial
            </p>
          </div>
        </div>

        {/* Action Controls & Counter Badge */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          
          {/* Real-time Character Counter Badge */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all ${
            isOverLimit 
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse' 
              : charCount > 1350
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-studio-950 border-studio-800 text-slate-300'
          }`}>
            {isOverLimit ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{charCount}</span>
            <span className="text-slate-500 font-normal">/</span>
            <span>{MAX_COVER_DESCRIPTION_CHARS} Karakter</span>
          </div>

          {/* Edit Toggle Button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isEditing
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                : 'bg-studio-800/80 border-studio-700/80 text-slate-300 hover:text-white'
            }`}
            title="Edit manual deskripsi"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isEditing ? 'Selesai Edit' : 'Edit'}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={isOverLimit}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${
              isOverLimit
                ? 'opacity-40 cursor-not-allowed bg-studio-800 border-studio-700 text-slate-500'
                : copied
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500/50 studio-glow'
            }`}
            title={isOverLimit ? "Panjang melebihi 1.500 karakter!" : "Salin ke Clipboard"}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin</span>
              </>
            )}
          </button>

        </div>
      </div>

      {/* Description Content / Textarea */}
      <div className="relative">
        <textarea
          rows={6}
          value={description}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Deskripsi cover bahasa Inggris akan muncul di sini..."
          className={`w-full p-4 rounded-xl font-sans text-sm sm:text-base leading-relaxed bg-studio-950/70 text-slate-100 border transition-all duration-200 resize-y focus:outline-none focus:ring-2 ${
            isOverLimit 
              ? 'border-rose-500 focus:ring-rose-500/40' 
              : 'border-studio-800 focus:border-blue-500 focus:ring-blue-500/20'
          }`}
        />

        {/* Warning if over character limit */}
        {isOverLimit && (
          <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2.5 text-xs text-rose-300 animate-shake">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>
              <strong>Peringatan Validasi:</strong> Deskripsi ini memiliki <strong>{charCount} karakter</strong>, melebihi batas absolut 1.500 karakter. Mohon perpendek teks ini agar valid dan dapat disalin untuk Suno/Udio.
            </span>
          </div>
        )}
      </div>

      {/* Footer Dimension Badges */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-studio-800/80 text-[11px] text-slate-400">
        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">5 Pilar Terintegrasi:</span>
        <span className="px-2 py-0.5 rounded bg-studio-800/60 border border-studio-700/50 text-slate-300">1. Genre & Mood</span>
        <span className="px-2 py-0.5 rounded bg-studio-800/60 border border-studio-700/50 text-slate-300">2. Instrumentation & Progression</span>
        <span className="px-2 py-0.5 rounded bg-studio-800/60 border border-studio-700/50 text-slate-300">3. Vocal Character & Timbre</span>
        <span className="px-2 py-0.5 rounded bg-studio-800/60 border border-studio-700/50 text-slate-300">4. Rhythm & Groove</span>
        <span className="px-2 py-0.5 rounded bg-studio-800/60 border border-studio-700/50 text-slate-300">5. Mix & Spatial Depth</span>
      </div>

    </div>
  );
};
