import React, { useState } from 'react';
import { X, History, Trash2, Download, Copy, Check, FileText, Calendar, Clock, ExternalLink } from 'lucide-react';
import { AnalysisResult } from '../types';
import { HistoryService } from '../services/historyService';

interface HistoryDrawerProps {
  isOpen: boolean;
  history: AnalysisResult[];
  onClose: () => void;
  onSelectResult: (result: AnalysisResult) => void;
  onHistoryUpdated: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  history,
  onClose,
  onSelectResult,
  onHistoryUpdated,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter(item => 
    item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.style.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyBoth = async (item: AnalysisResult) => {
    const combined = `01. COVER DESCRIPTION\n${item.coverDescription}\n\n02. STYLE\n${item.style}`;
    try {
      await navigator.clipboard.writeText(combined);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Hapus riwayat analisis ini?')) {
      HistoryService.deleteItem(id);
      onHistoryUpdated();
    }
  };

  const handleClearAll = () => {
    if (confirm('Apakah Anda yakin ingin menghapus SELURUH riwayat analisis? Tindakan ini tidak dapat dibatalkan.')) {
      HistoryService.clearAll();
      onHistoryUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md h-full glass-studio bg-studio-950 border-l border-studio-700/80 p-6 flex flex-col justify-between shadow-2xl">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-studio-800">
            <div className="flex items-center space-x-2.5">
              <History className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Riwayat Analisis
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-studio-800 text-blue-300 rounded-full">
                {history.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-studio-850 hover:bg-studio-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="my-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lagu atau genre..."
              className="w-full px-3.5 py-2 rounded-xl bg-studio-900 border border-studio-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
          {filteredHistory.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <FileText className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
              <p className="text-xs">Belum ada riwayat analisis yang tersimpan.</p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectResult(item);
                    onClose();
                  }}
                  className="group relative p-4 rounded-xl bg-studio-900/80 hover:bg-studio-850 border border-studio-800/80 hover:border-blue-500/50 cursor-pointer transition-all duration-200 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                        {item.fileName}
                      </h4>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span className="font-mono text-blue-400">{item.charCount} Karakter</span>
                        {item.replacementVocal && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-400 font-medium">Vocal: {item.replacementVocal}</span>
                          </>
                        )}
                        {item.customIntro?.enabled && (
                          <>
                            <span>•</span>
                            <span className="text-blue-400 font-medium">Intro: ON</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                      title="Hapus item ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Snippet Preview */}
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed bg-studio-950/60 p-2 rounded-lg border border-studio-850">
                    {item.coverDescription}
                  </p>

                  <div className="text-[10px] text-indigo-300 truncate font-mono">
                    {item.style}
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-studio-800/60 text-[10px]">
                    <span className="text-blue-400 font-medium group-hover:underline flex items-center space-x-1">
                      <span>Buka di Editor</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>

                    <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleCopyBoth(item)}
                        className="px-2 py-1 rounded bg-studio-800 hover:bg-studio-700 text-slate-300 hover:text-white flex items-center space-x-1 border border-studio-700"
                        title="Salin Cover Description + Style"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => HistoryService.exportToTxt(item)}
                        className="px-2 py-1 rounded bg-studio-800 hover:bg-studio-700 text-slate-300 hover:text-white flex items-center space-x-1 border border-studio-700"
                        title="Ekspor ke TXT"
                      >
                        <Download className="w-3 h-3" />
                        <span>TXT</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="pt-4 border-t border-studio-800 flex justify-between items-center text-xs">
            <span className="text-slate-500">Total: {history.length} blueprint</span>
            <button
              onClick={handleClearAll}
              className="text-rose-400 hover:text-rose-300 transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
