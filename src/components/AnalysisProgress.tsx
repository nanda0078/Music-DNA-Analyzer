import React from 'react';
import { Loader2, AlertCircle, RefreshCw, XCircle, Sparkles } from 'lucide-react';
import { ProgressState } from '../types';

interface AnalysisProgressProps {
  progress: ProgressState;
  onRetry: () => void;
  onCancel: () => void;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  progress,
  onRetry,
  onCancel,
}) => {
  const isError = progress.status === 'error';

  return (
    <div className={`w-full rounded-2xl p-6 border transition-all duration-300 ${
      isError 
        ? 'bg-rose-500/10 border-rose-500/40 text-rose-200' 
        : 'glass-card border-blue-500/40 studio-glow'
    }`}>
      
      {/* Active Processing State */}
      {!isError ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-400/30 text-blue-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>{progress.message || 'Menganalisis Audio Referensi...'}</span>
                  <span className="flex space-x-1">
                    <span className="w-1.5 h-3 bg-blue-400 animate-pulse rounded-full" />
                    <span className="w-1.5 h-4 bg-blue-300 animate-pulse rounded-full delay-75" />
                    <span className="w-1.5 h-2 bg-blue-500 animate-pulse rounded-full delay-150" />
                  </span>
                </h4>
                {progress.subMessage && (
                  <p className="text-xs text-slate-400 mt-0.5">{progress.subMessage}</p>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg font-mono font-extrabold text-blue-400">
                {progress.percentage}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-studio-950 rounded-full h-2.5 overflow-hidden border border-studio-800">
            <div
              className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-md shadow-blue-500/50"
              style={{ width: `${Math.max(5, progress.percentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Memproses 9 Dimensi Intelegensi Musikal secara internal (No Lyrics, No Hallucinations)</span>
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-200 transition-colors flex items-center space-x-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Batalkan</span>
            </button>
          </div>
        </div>
      ) : (
        /* Error State */
        <div className="space-y-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center flex-shrink-0 text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-rose-200">
                Gagal Melakukan Analisis Audio
              </h4>
              <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
                {progress.error || 'Terjadi kendala saat memproses audio dengan Gemini API. Silakan periksa kunci API atau koneksi internet Anda.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={onRetry}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/30"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Ulang Analisis</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
