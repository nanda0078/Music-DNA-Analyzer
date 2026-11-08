import React from 'react';
import { Mic2, RotateCcw, Sparkles, Shield, UserCheck } from 'lucide-react';

interface VocalReplacementPanelProps {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  disabled?: boolean;
}

export const VocalReplacementPanel: React.FC<VocalReplacementPanelProps> = ({
  value,
  onChange,
  onReset,
  disabled = false,
}) => {
  const presets = [
    'Female Vocal',
    'Male Vocal',
    'Warm, expressive female vocal',
    'Aggressive, high-energy female vocal',
    'Smooth, velvety male tenor',
    'Female Alto',
    'Male Baritone',
  ];

  const isFilled = value.trim().length > 0;

  return (
    <div className={`w-full glass-card rounded-2xl p-5 border transition-all duration-300 ${
      isFilled 
        ? 'border-indigo-500/50 studio-glow bg-indigo-950/20' 
        : 'border-studio-700/80 hover:border-studio-600'
    }`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-studio-800 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isFilled ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-studio-800 text-indigo-400'
          }`}>
            <Mic2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-white flex items-center space-x-2">
              <span>VOCAL CHARACTER REPLACEMENT</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-studio-800/80 rounded border border-studio-700/60">
                Opsional
              </span>
              {isFilled && (
                <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-300 bg-indigo-500/20 rounded border border-indigo-500/30 flex items-center space-x-1">
                  <UserCheck className="w-3 h-3 text-indigo-400" />
                  <span>Aktif</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Ubah karakter suara penyanyi pada cover tanpa mengubah melodi, instrumen, atau aransemen asli
            </p>
          </div>
        </div>

        {/* Reset Button */}
        {isFilled && (
          <button
            type="button"
            onClick={onReset}
            disabled={disabled}
            className="self-end sm:self-auto flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-studio-800/80 hover:bg-studio-750 border border-studio-700 transition-colors"
            title="Kosongkan karakter vokal pengganti (kembali ke vokal asli)"
          >
            <RotateCcw className="w-3 h-3 text-rose-400" />
            <span>Reset ke Asli</span>
          </button>
        )}
      </div>

      {/* Input Field */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="Describe the desired replacement vocal character..."
            className="w-full px-4 py-3 rounded-xl bg-studio-950/80 border border-studio-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-sans transition-all"
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 mr-1 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Inspirasi Cepat:</span>
          </span>
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={disabled}
              onClick={() => onChange(preset)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                value === preset
                  ? 'bg-indigo-600 text-white font-bold border border-indigo-400 shadow-sm'
                  : 'bg-studio-850 hover:bg-studio-800 text-slate-300 hover:text-white border border-studio-750'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Strict Constraint Reminder Badge */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1">
          <Shield className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span>
            {isFilled ? (
              <span className="text-indigo-300">
                <strong>Catatan Integrasi:</strong> Karakter vokal pengganti <strong>hanya memengaruhi output 01. COVER DESCRIPTION</strong>. Output 02. STYLE tetap independen berdasarkan Original Musical DNA.
              </span>
            ) : (
              <span>Kolom kosong secara default: Vokal penyanyi asli akan dipertahankan sesuai hasil analisis rekaman.</span>
            )}
          </span>
        </div>
      </div>

    </div>
  );
};
