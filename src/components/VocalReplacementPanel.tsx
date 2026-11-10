import React from 'react';
import { Mic2, RotateCcw, Sparkles, Shield, UserCheck } from 'lucide-react';

interface VocalReplacementPanelProps {
  enabled: boolean;
  onToggle: () => void;
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  disabled?: boolean;
}

export const VocalReplacementPanel: React.FC<VocalReplacementPanelProps> = ({
  enabled,
  onToggle,
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
      enabled 
        ? 'border-indigo-500/50 studio-glow bg-indigo-950/20' 
        : 'border-studio-700/80 hover:border-studio-600 bg-studio-900/40'
    }`}>
      
      {/* Header with ON/OFF Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-studio-800 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            enabled 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
              : 'bg-studio-800 text-slate-400'
          }`}>
            <Mic2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
                VOCAL CHARACTER REPLACEMENT
              </h3>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded tracking-wider uppercase border transition-all ${
                enabled
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-sm'
                  : 'bg-studio-800 border-studio-700 text-slate-400'
              }`}>
                {enabled ? 'ON' : 'OFF'}
              </span>
              {enabled && isFilled && (
                <span className="hidden xs:inline-flex px-2 py-0.5 text-[10px] font-bold text-indigo-300 bg-indigo-500/20 rounded border border-indigo-500/30 items-center space-x-1">
                  <UserCheck className="w-3 h-3 text-indigo-400" />
                  <span>Karakter Aktif</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ubah karakter suara penyanyi pada cover tanpa mengubah melodi, instrumen, atau aransemen asli
            </p>
          </div>
        </div>

        {/* Toggle Switch & Reset Button */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {enabled && isFilled && (
            <button
              type="button"
              onClick={onReset}
              disabled={disabled}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-studio-800/80 hover:bg-studio-750 border border-studio-700 transition-colors"
              title="Kosongkan karakter vokal pengganti"
            >
              <RotateCcw className="w-3 h-3 text-rose-400" />
              <span>Reset</span>
            </button>
          )}

          {/* Interactive ON/OFF Switch Pill */}
          <button
            type="button"
            onClick={onToggle}
            disabled={disabled}
            className={`relative inline-flex h-7 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
              enabled 
                ? 'bg-indigo-600 border-indigo-500 shadow-md shadow-indigo-600/40' 
                : 'bg-studio-800 border-studio-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={enabled ? "Matikan Vocal Character Replacement" : "Aktifkan Vocal Character Replacement"}
          >
            <span
              className={`pointer-events-none inline-flex items-center justify-center h-6 w-8 transform rounded-full bg-white text-[10px] font-extrabold shadow-sm ring-0 transition duration-200 ease-in-out ${
                enabled 
                  ? 'translate-x-7 text-indigo-700' 
                  : 'translate-x-0.5 text-slate-600'
              }`}
            >
              {enabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* Configuration Section (Active only when toggle is ON) */}
      <div className={`space-y-3 transition-all duration-300 ${
        !enabled ? 'opacity-40 pointer-events-none select-none grayscale-[40%]' : ''
      }`}>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={!enabled || disabled}
            placeholder="Describe the desired replacement vocal character..."
            className="w-full px-4 py-3 rounded-xl bg-studio-950/80 border border-studio-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-sans transition-all disabled:opacity-50"
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
              disabled={!enabled || disabled}
              onClick={() => onChange(preset)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                enabled && value === preset
                  ? 'bg-indigo-600 text-white font-bold border border-indigo-400 shadow-sm'
                  : 'bg-studio-850 hover:bg-studio-800 text-slate-300 hover:text-white border border-studio-750 disabled:opacity-40'
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
            {enabled ? (
              isFilled ? (
                <span className="text-indigo-300">
                  <strong>Catatan Integrasi:</strong> Karakter vokal pengganti <strong>hanya memengaruhi output 01. COVER DESCRIPTION</strong>. Output 02. STYLE tetap independen berdasarkan Original Musical DNA.
                </span>
              ) : (
                <span>Kolom deskripsi kosong: Vokal penyanyi asli akan dipertahankan sesuai hasil rekaman.</span>
              )
            ) : (
              <span>Toggle OFF: Fitur tidak aktif. Karakter suara penyanyi asli dipertahankan secara utuh.</span>
            )}
          </span>
        </div>
      </div>

    </div>
  );
};
