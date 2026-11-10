import React from 'react';
import { Sparkles, Key, History, Activity, Radio } from 'lucide-react';
import { APP_NAME, APP_VERSION } from '../constants';
import { ApiProvider } from '../types';

interface NavbarProps {
  hasApiKey: boolean;
  modelId: string;
  provider?: ApiProvider;
  historyCount: number;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onNewAnalysis: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  hasApiKey,
  modelId,
  provider = 'gemini',
  historyCount,
  onOpenSettings,
  onOpenHistory,
  onNewAnalysis,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-studio border-b border-studio-700/60 bg-studio-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Identity */}
        <div className="flex items-center space-x-4 cursor-pointer" onClick={onNewAnalysis}>
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 border border-blue-400/30 studio-glow shadow-lg shadow-blue-500/20">
            <Radio className="w-6 h-6 text-white animate-pulse" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-studio-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-extrabold tracking-wider text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-200">
                {APP_NAME}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-blue-500/20 border border-blue-400/40 text-blue-300 rounded-md">
                {APP_VERSION}
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Professional Reference Audio DNA & AI Cover Prompt Generator
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* API Connection Indicator */}
          <div 
            onClick={onOpenSettings}
            className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all duration-200 ${
              hasApiKey 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            }`}
            title="Klik untuk mengubah Pengaturan API & Provider"
          >
            <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span className="font-medium">
              {hasApiKey 
                ? provider === 'crowllm'
                  ? `CrowLLM (${modelId})`
                  : `Gemini (${modelId.replace('gemini-', '')})`
                : 'Kunci API Belum Diatur'}
            </span>
          </div>

          {/* New Analysis Button */}
          <button
            onClick={onNewAnalysis}
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-studio-800/80 hover:bg-studio-700/80 border border-studio-700 hover:text-white transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Analisis Baru</span>
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 bg-studio-850 hover:bg-studio-800 border border-studio-700/80 hover:border-slate-600 transition-all shadow-sm"
            title="Lihat Riwayat Analisis"
          >
            <History className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Riwayat</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          {/* Settings Button (BYOK) */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm ${
              hasApiKey 
                ? 'bg-studio-850 hover:bg-studio-800 border border-studio-700 text-slate-200 hover:text-white' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white studio-glow'
            }`}
          >
            <Key className="w-4 h-4 text-blue-300" />
            <span className="hidden xs:inline">API & Pengaturan</span>
          </button>

        </div>
      </div>
    </header>
  );
};
