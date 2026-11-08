import React, { useState, useEffect } from 'react';
import { Sparkles, Music, Play, AlertCircle, ArrowRight, ShieldCheck, Disc3 } from 'lucide-react';
import { AudioMetadata, AnalysisResult, ProgressState, ApiSettings } from './types';
import { AudioProcessor } from './services/audioProcessor';
import { GeminiService } from './services/geminiService';
import { HistoryService } from './services/historyService';
import { Navbar } from './components/Navbar';
import { AudioUploader } from './components/AudioUploader';
import { AudioPlayerWaveform } from './components/AudioPlayerWaveform';
import { AudioMetadataCard } from './components/AudioMetadataCard';
import { AnalysisProgress } from './components/AnalysisProgress';
import { ResultCoverDescription } from './components/ResultCoverDescription';
import { ResultStyleTags } from './components/ResultStyleTags';
import { SettingsModal } from './components/SettingsModal';
import { HistoryDrawer } from './components/HistoryDrawer';

export const App: React.FC = () => {
  // Settings & API state
  const [settings, setSettings] = useState<ApiSettings>(GeminiService.getStoredSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  // Audio state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioMetadata, setAudioMetadata] = useState<AudioMetadata | null>(null);
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const [base64Audio, setBase64Audio] = useState<string | null>(null);

  // Analysis progress & Results
  const [progress, setProgress] = useState<ProgressState>({
    status: 'idle',
    percentage: 0,
    message: '',
  });
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Load history & sync settings on mount
  useEffect(() => {
    refreshHistory();
    const current = GeminiService.getStoredSettings();
    if (current.modelId !== settings.modelId) {
      setSettings(current);
      GeminiService.saveSettings(current);
    }
  }, []);

  const refreshHistory = () => {
    setHistory(HistoryService.getHistory());
  };

  // Handle file selection and decoding
  const handleFileSelected = async (file: File) => {
    try {
      setProgress({
        status: 'decoding',
        percentage: 15,
        message: 'Mendekode header audio dan mengekstrak waveform...',
        subMessage: `${file.name} (${AudioProcessor.formatBytes(file.size)})`
      });

      const analysis = await AudioProcessor.analyzeAudioFile(file);
      setAudioFile(file);
      setAudioMetadata(analysis.metadata);
      setWaveformPeaks(analysis.waveformPeaks);
      setBase64Audio(analysis.base64Data);

      setProgress({ status: 'idle', percentage: 0, message: '' });
      // Reset previous results if any
      setCurrentResult(null);
    } catch (err: unknown) {
      console.error('Audio decoding error', err);
      const errorMsg = err instanceof Error ? err.message : 'Gagal membaca dan mendekode file audio.';
      setProgress({
        status: 'error',
        percentage: 0,
        message: 'Gagal Memproses File Audio',
        error: errorMsg
      });
    }
  };

  // Reset/Remove audio
  const handleRemoveAudio = () => {
    if (audioMetadata?.dataUrl) {
      URL.revokeObjectURL(audioMetadata.dataUrl);
    }
    setAudioFile(null);
    setAudioMetadata(null);
    setWaveformPeaks([]);
    setBase64Audio(null);
    setCurrentResult(null);
    setProgress({ status: 'idle', percentage: 0, message: '' });
  };

  // Trigger AI Audio Analysis
  const handleStartAnalysis = async () => {
    if (!base64Audio || !audioMetadata) {
      alert('Harap unggah audio referensi terlebih dahulu.');
      return;
    }

    if (!settings.apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);

    setProgress({
      status: 'analyzing',
      percentage: 20,
      message: 'Mempersiapkan data audio referensi...',
      subMessage: `Menggunakan model ${settings.modelId}`
    });

    try {
      const result = await GeminiService.analyzeAudio(
        base64Audio,
        audioMetadata.fileType,
        {
          fileName: audioMetadata.fileName,
          fileSize: audioMetadata.fileSize,
          duration: audioMetadata.duration,
        },
        (stepMessage, pct) => {
          setProgress(prev => ({
            ...prev,
            status: pct >= 80 ? 'optimizing' : 'analyzing',
            percentage: pct,
            message: stepMessage,
          }));
        }
      );

      setCurrentResult(result);
      // Save result to history
      HistoryService.saveResult(result);
      refreshHistory();

      setProgress({
        status: 'completed',
        percentage: 100,
        message: 'Analisis Selesai! Dua Output Final Berhasil Dibuat.',
      });

      // Smooth scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById('final-results-anchor');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 250);

    } catch (err: unknown) {
      console.error('Audio analysis error', err);
      const msg = err instanceof Error ? err.message : 'Terjadi kegagalan selama proses analisis AI.';
      setProgress({
        status: 'error',
        percentage: 0,
        message: 'Analisis Gagal',
        error: msg
      });
    } finally {
      setAbortController(null);
    }
  };

  const handleCancelAnalysis = () => {
    if (abortController) {
      abortController.abort();
    }
    setProgress({ status: 'idle', percentage: 0, message: '' });
  };

  // Manual editing callbacks
  const handleDescriptionChange = (newDesc: string) => {
    if (!currentResult) return;
    const updated = {
      ...currentResult,
      coverDescription: newDesc,
      charCount: newDesc.length
    };
    setCurrentResult(updated);
    HistoryService.saveResult(updated);
    refreshHistory();
  };

  const handleStyleChange = (newStyle: string) => {
    if (!currentResult) return;
    const updated = {
      ...currentResult,
      style: newStyle
    };
    setCurrentResult(updated);
    HistoryService.saveResult(updated);
    refreshHistory();
  };

  // Start fresh analysis
  const handleNewAnalysis = () => {
    handleRemoveAudio();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isProcessing = progress.status === 'analyzing' || progress.status === 'optimizing' || progress.status === 'decoding';

  return (
    <div className="min-h-screen flex flex-col bg-studio-950 text-slate-100">
      
      {/* Top Studio Navbar */}
      <Navbar
        hasApiKey={Boolean(settings.apiKey)}
        modelId={settings.modelId}
        historyCount={history.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewAnalysis={handleNewAnalysis}
      />

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Audio Intelligence & Music DNA Extraction</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Ekstraksi Otentik Musical DNA
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-indigo-300">
              Khusus Suno v3.5/v4 & Udio
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Unggah lagu referensi (<span className="text-slate-200 font-medium">Song A</span>) untuk membedah genre, instrumen, vokal, progresi, dan tekstur mixing asli. Sistem menganalisis 9 dimensi musikal secara internal dan menghasilkan <strong className="text-blue-400">tepat dua output final</strong> tanpa laporan berlebihan.
          </p>
        </div>

        {/* Section B: Audio Analyzer (Uploader or Player & Metadata) */}
        <section className="space-y-6">
          {!audioMetadata ? (
            <AudioUploader
              onFileSelected={handleFileSelected}
              isProcessing={isProcessing}
            />
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Waveform Player */}
              <AudioPlayerWaveform
                audioUrl={audioMetadata.dataUrl || ''}
                duration={audioMetadata.duration}
                waveformPeaks={waveformPeaks}
                onReplaceAudio={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleFileSelected(file);
                  };
                  input.click();
                }}
                onRemoveAudio={handleRemoveAudio}
              />

              {/* Technical Metadata Card */}
              <AudioMetadataCard metadata={audioMetadata} />

              {/* Start Analysis Call To Action */}
              {!currentResult && progress.status !== 'analyzing' && progress.status !== 'optimizing' && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl glass-card border border-blue-500/30 studio-glow gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2 justify-center sm:justify-start">
                      <Disc3 className="w-5 h-5 text-blue-400 animate-spin" />
                      <span>Audio Siap Dianalisis</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      AI akan mendengarkan secara menyeluruh, membedah 9 dimensi intelegensi musikal, dan membuat prompt cover presisi.
                    </p>
                  </div>

                  <button
                    onClick={handleStartAnalysis}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 flex items-center justify-center space-x-2.5 transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Mulai Analisis DNA Musik</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Section C: Analysis Engine (Progress & Status) */}
        {(isProcessing || progress.status === 'error') && (
          <section className="animate-fade-in">
            <AnalysisProgress
              progress={progress}
              onRetry={handleStartAnalysis}
              onCancel={handleCancelAnalysis}
            />
          </section>
        )}

        {/* Section D: Final Results (Strictly Panel 1 & Panel 2) */}
        {currentResult && (
          <section id="final-results-anchor" className="space-y-6 pt-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-studio-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-lg font-extrabold uppercase tracking-wider text-white">
                  Hasil Blueprint DNA Musik (Song B)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                AI Engine: {currentResult.modelUsed}
              </span>
            </div>

            {/* PANEL 1: 01. COVER DESCRIPTION */}
            <ResultCoverDescription
              description={currentResult.coverDescription}
              onChange={handleDescriptionChange}
              wasOptimized={currentResult.wasOptimized}
            />

            {/* PANEL 2: 02. STYLE */}
            <ResultStyleTags
              style={currentResult.style}
              onChange={handleStyleChange}
            />

            {/* Re-analyze or Analyze New Audio */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                onClick={handleStartAnalysis}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-studio-800 hover:bg-studio-700 text-slate-300 hover:text-white border border-studio-700 transition-colors"
              >
                Analisis Ulang Audio Ini
              </button>
              <button
                onClick={handleNewAnalysis}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 border border-blue-500/40 transition-all shadow-md shadow-blue-600/30"
              >
                Unggah Lagu Baru
              </button>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-studio-800/80 bg-studio-950 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">MUSIC DNA ANALYZER</span>
            <span>•</span>
            <span>Audio Intelligence Engine</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Suno v3.5/v4 Optimized</span>
            <span>•</span>
            <span>Udio Compatible</span>
            <span>•</span>
            <span>Strict $\le$ 1.500 Chars Validation</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal (BYOK) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={(newSettings) => setSettings(newSettings)}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        history={history}
        onClose={() => setIsHistoryOpen(false)}
        onSelectResult={(selected) => {
          setCurrentResult(selected);
          setTimeout(() => {
            document.getElementById('final-results-anchor')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        onHistoryUpdated={refreshHistory}
      />

    </div>
  );
};
