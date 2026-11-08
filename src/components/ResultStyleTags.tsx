import React, { useState } from 'react';
import { Copy, Check, Edit3, Tag, Music, Sliders } from 'lucide-react';
import { ValidatorService } from '../services/validatorService';

interface ResultStyleTagsProps {
  style: string;
  onChange: (newStyle: string) => void;
}

export const ResultStyleTags: React.FC<ResultStyleTagsProps> = ({
  style,
  onChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const tags = style
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(style);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy style tags', err);
    }
  };

  const handleNormalize = () => {
    const cleaned = ValidatorService.normalizeStyleTags(style);
    onChange(cleaned);
  };

  return (
    <div className="w-full glass-card rounded-2xl p-6 border border-studio-700/80 hover:border-blue-500/40 transition-all duration-300">
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-studio-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-mono font-bold text-xs">
            02
          </div>
          <div>
            <h3 className="text-base font-extrabold uppercase tracking-wide text-white flex items-center space-x-2">
              <span>STYLE</span>
              <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-md">
                Suno v3.5/v4 & Udio Ready
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Daftar tag musikal bahasa Inggris elit dipisahkan tanda koma
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            {tags.length} Tags
          </span>

          {/* Edit Toggle Button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isEditing
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                : 'bg-studio-800/80 border-studio-700/80 text-slate-300 hover:text-white'
            }`}
            title="Edit manual tag style"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isEditing ? 'Selesai Edit' : 'Edit'}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/50 studio-glow'
            }`}
            title="Salin Tag Style ke Clipboard"
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

      {/* Tags Visual Pill Clouds */}
      {!isEditing ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-studio-950/70 border border-studio-800 min-h-[72px]">
            {tags.length > 0 ? (
              tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-studio-800 to-studio-850 border border-studio-700/80 text-indigo-200 hover:border-indigo-500/50 transition-colors shadow-sm"
                >
                  <Tag className="w-3 h-3 text-indigo-400" />
                  <span>{tag}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">Belum ada tag yang digenerate.</span>
            )}
          </div>
        </div>
      ) : (
        /* Textarea for manual editing */
        <div className="space-y-2">
          <textarea
            rows={4}
            value={style}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Masukkan tag dipisahkan koma..."
            className="w-full p-4 rounded-xl font-mono text-xs sm:text-sm bg-studio-950/70 text-indigo-200 border border-studio-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-y"
          />
          <div className="flex justify-end">
            <button
              onClick={handleNormalize}
              className="text-[11px] text-blue-400 hover:text-blue-300 underline underline-offset-2 flex items-center space-x-1"
            >
              <Sliders className="w-3 h-3" />
              <span>Bersihkan & Format Tag (Hapus Duplikat)</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer Tag Hierarchy Guide */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-studio-800/80 text-[11px] text-slate-400">
        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Hierarki Tag:</span>
        <span className="px-2 py-0.5 rounded bg-studio-800/60 border border-studio-700/50 text-slate-300">Genre Utama</span>
        <span className="px-2 py-0.5 rounded bg-studio-800/60 border border-studio-700/50 text-slate-300">Subgenre</span>
        <span className="px-2 py-0.5 rounded bg-studio-800/60 border border-studio-700/50 text-slate-300">Mood / Atmosfer</span>
        <span className="px-2 py-0.5 rounded bg-studio-800/60 border border-studio-700/50 text-slate-300">Instrumen Kunci</span>
        <span className="px-2 py-0.5 rounded bg-studio-800/60 border border-studio-700/50 text-slate-300">Karakter Vokal</span>
        <span className="px-2 py-0.5 rounded bg-studio-800/60 border border-studio-700/50 text-slate-300">Tempo / Groove</span>
        <span className="px-2 py-0.5 rounded bg-studio-800/60 border border-studio-700/50 text-slate-300">Kualitas Produksi</span>
      </div>

    </div>
  );
};
