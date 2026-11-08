import React from 'react';
import { Music2, RotateCcw, Sparkles, Shield, Layers, Gauge, Compass, Check } from 'lucide-react';
import { CustomIntroConfig } from '../types';
import { INTRO_INSTRUMENTS, INTRO_ATMOSPHERES, INTRO_DYNAMICS } from '../constants';

interface CustomIntroPanelProps {
  config: CustomIntroConfig;
  onChange: (config: CustomIntroConfig) => void;
  onReset: () => void;
  disabled?: boolean;
}

export const CustomIntroPanel: React.FC<CustomIntroPanelProps> = ({
  config,
  onChange,
  onReset,
  disabled = false,
}) => {
  const isEnabled = config.enabled;

  const handleToggle = () => {
    if (disabled) return;
    onChange({
      ...config,
      enabled: !isEnabled,
    });
  };

  const handleInstrumentToggle = (instrument: string) => {
    if (!isEnabled || disabled) return;
    const current = config.instruments || [];
    const exists = current.includes(instrument);
    const updated = exists 
      ? current.filter(i => i !== instrument)
      : [...current, instrument];

    onChange({
      ...config,
      instruments: updated,
    });
  };

  return (
    <div className={`w-full glass-card rounded-2xl p-5 border transition-all duration-300 ${
      isEnabled 
        ? 'border-blue-500/50 studio-glow bg-blue-950/20' 
        : 'border-studio-700/80 hover:border-studio-600 bg-studio-900/40'
    }`}>
      
      {/* Header with ON/OFF Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-studio-800 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isEnabled 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
              : 'bg-studio-800 text-slate-400'
          }`}>
            <Music2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
                CUSTOM INTRO ARRANGEMENT
              </h3>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded tracking-wider uppercase border transition-all ${
                isEnabled
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-sm'
                  : 'bg-studio-800 border-studio-700 text-slate-400'
              }`}>
                {isEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ciptakan intro cover yang lebih menarik, kaya instrumen, dan emosional sebelum masuk ke lagu asli
            </p>
          </div>
        </div>

        {/* Toggle Switch & Reset Button */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {isEnabled && (
            <button
              type="button"
              onClick={onReset}
              disabled={disabled}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-studio-800/80 hover:bg-studio-750 border border-studio-700 transition-colors"
              title="Kembalikan pengaturan intro ke default"
            >
              <RotateCcw className="w-3 h-3 text-rose-400" />
              <span>Reset</span>
            </button>
          )}

          {/* Interactive ON/OFF Switch Pill */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            className={`relative inline-flex h-7 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
              isEnabled 
                ? 'bg-blue-600 border-blue-500 shadow-md shadow-blue-600/40' 
                : 'bg-studio-800 border-studio-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isEnabled ? "Matikan Custom Intro Arrangement" : "Aktifkan Custom Intro Arrangement"}
          >
            <span
              className={`pointer-events-none inline-flex items-center justify-center h-6 w-8 transform rounded-full bg-white text-[10px] font-extrabold shadow-sm ring-0 transition duration-200 ease-in-out ${
                isEnabled 
                  ? 'translate-x-7 text-blue-700' 
                  : 'translate-x-0.5 text-slate-600'
              }`}
            >
              {isEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* Intro Configuration Section (Active only when toggle is ON) */}
      <div className={`space-y-4 transition-all duration-300 ${
        !isEnabled ? 'opacity-40 pointer-events-none select-none grayscale-[40%]' : ''
      }`}>
        
        {/* 1. Multiple Instrument Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Pilihan Instrumen Tambahan Intro (Multiple Select)</span>
            </label>
            <span className="font-mono text-blue-400 text-[11px]">
              {config.instruments.length} Dipilih
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-studio-950/70 border border-studio-800/80">
            {INTRO_INSTRUMENTS.map((inst) => {
              const isSelected = config.instruments.includes(inst);
              return (
                <button
                  key={inst}
                  type="button"
                  disabled={!isEnabled || disabled}
                  onClick={() => handleInstrumentToggle(inst)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold border border-blue-400 shadow-sm shadow-blue-600/30 scale-[1.02]'
                      : 'bg-studio-850 hover:bg-studio-800 text-slate-300 hover:text-white border border-studio-750'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                  <span>{inst}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Atmosphere & Dynamics Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Intro Atmosphere */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Intro Atmosphere</span>
            </label>
            <select
              value={config.atmosphere}
              disabled={!isEnabled || disabled}
              onChange={(e) => onChange({ ...config, atmosphere: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-studio-950/80 border border-studio-700 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {INTRO_ATMOSPHERES.map((atm) => (
                <option key={atm} value={atm} className="bg-studio-900 text-slate-100">
                  {atm}
                </option>
              ))}
            </select>
          </div>

          {/* Intro Dynamics */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              <span>Intro Dynamics</span>
            </label>
            <select
              value={config.dynamics}
              disabled={!isEnabled || disabled}
              onChange={(e) => onChange({ ...config, dynamics: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-studio-950/80 border border-studio-700 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {INTRO_DYNAMICS.map((dyn) => (
                <option key={dyn} value={dyn} className="bg-studio-900 text-slate-100">
                  {dyn}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* 3. Optional Custom Instruction */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Instruksi Custom Khusus Intro (Opsional)</span>
          </label>
          <input
            type="text"
            value={config.customInstruction || ''}
            disabled={!isEnabled || disabled}
            onChange={(e) => onChange({ ...config, customInstruction: e.target.value })}
            placeholder="Misal: Solo piano melankolis di awal lalu disambung gesekan cello sebelum drum masuk..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-studio-950/80 border border-studio-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Strict Constraint & Preservation Note */}
        <div className="flex items-start space-x-2 text-[11px] text-slate-400 pt-1 border-t border-studio-800/80">
          <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            {isEnabled ? (
              <span className="text-blue-300 leading-relaxed">
                <strong>Aturan Preservasi Lagu:</strong> Custom intro hanya memperkaya bagian INTRO instrumental awal. Setelah intro selesai, lagu <strong>wajib kembali 100% ke melodi, lirik, tempo, chord, dan aransemen asli</strong> (Verse, Chorus, Bridge, Outro tetap original). Output 02. STYLE tetap independen.
              </span>
            ) : (
              <span>Toggle OFF: Intro lagu original dari audio referensi akan dipertahankan sepenuhnya tanpa modifikasi.</span>
            )}
          </span>
        </div>

      </div>

    </div>
  );
};
