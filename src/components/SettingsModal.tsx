import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Cpu, 
  Sliders, 
  ShieldCheck, 
  Trash2, 
  Globe, 
  Layers, 
  Download,
  Shuffle
} from 'lucide-react';
import { ApiSettings, ApiProvider } from '../types';
import { AVAILABLE_MODELS, CROWLLM_DEFAULT_BASE_URL, CROWLLM_DEFAULT_MODEL } from '../constants';
import { GeminiService } from '../services/geminiService';
import { CrowllmService } from '../services/crowllmService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved: (settings: ApiSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSaved,
}) => {
  // Provider Selection
  const [provider, setProvider] = useState<ApiProvider>('gemini');

  // Gemini State
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showGeminiApiKey, setShowGeminiApiKey] = useState(false);
  const [geminiModelId, setGeminiModelId] = useState(AVAILABLE_MODELS[0].id);

  // CrowLLM State
  const [crowllmApiKey, setCrowllmApiKey] = useState('');
  const [showCrowllmApiKey, setShowCrowllmApiKey] = useState(false);
  const [crowllmBaseUrl, setCrowllmBaseUrl] = useState(CROWLLM_DEFAULT_BASE_URL);
  const [crowllmModelId, setCrowllmModelId] = useState(CROWLLM_DEFAULT_MODEL);
  const [crowllmModelsList, setCrowllmModelsList] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsLoadError, setModelsLoadError] = useState<string | null>(null);

  // Fallback Configuration
  const [enableAutoFallback, setEnableAutoFallback] = useState(false);
  const [fallbackProvider, setFallbackProvider] = useState<ApiProvider>('crowllm');

  // Shared Temperature
  const [temperature, setTemperature] = useState(0.2);

  // Test and Save Status
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = GeminiService.getStoredSettings();
      setProvider(stored.provider || 'gemini');
      setGeminiApiKey(stored.apiKey || '');
      setGeminiModelId(stored.modelId || AVAILABLE_MODELS[0].id);
      setCrowllmApiKey(stored.crowllmApiKey || '');
      setCrowllmBaseUrl(stored.crowllmBaseUrl || CROWLLM_DEFAULT_BASE_URL);
      setCrowllmModelId(stored.crowllmModelId || CROWLLM_DEFAULT_MODEL);
      setEnableAutoFallback(Boolean(stored.enableAutoFallback));
      setFallbackProvider(stored.fallbackProvider || (stored.provider === 'gemini' ? 'crowllm' : 'gemini'));
      setTemperature(stored.temperature ?? 0.2);
      setTestStatus('idle');
      setTestMessage('');
      setSaveSuccess(false);
      setModelsLoadError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Load available models from CrowLLM /models endpoint
  const handleLoadCrowllmModels = async () => {
    if (!crowllmApiKey.trim()) {
      setModelsLoadError('Masukkan Kunci API CrowLLM terlebih dahulu.');
      return;
    }
    setIsLoadingModels(true);
    setModelsLoadError(null);

    try {
      const models = await CrowllmService.fetchAvailableModels(crowllmApiKey.trim(), crowllmBaseUrl.trim());
      setCrowllmModelsList(models);
      if (models.length > 0) {
        if (!models.includes(crowllmModelId)) {
          setCrowllmModelId(models[0]);
        }
      } else {
        setModelsLoadError('Tidak ada model yang ditemukan dari endpoint ini.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat model.';
      setModelsLoadError(msg);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Test Connection for current provider
  const handleTestConnection = async () => {
    setTestStatus('testing');

    if (provider === 'gemini') {
      if (!geminiApiKey.trim()) {
        setTestStatus('error');
        setTestMessage('Harap masukkan Kunci Google Gemini API terlebih dahulu.');
        return;
      }
      setTestMessage('Menguji koneksi ke server Google Gemini...');
      const res = await GeminiService.testConnection(geminiApiKey.trim(), geminiModelId);
      setTestStatus(res.success ? 'success' : 'error');
      setTestMessage(res.message);
    } else {
      if (!crowllmApiKey.trim()) {
        setTestStatus('error');
        setTestMessage('Harap masukkan Kunci CrowLLM API terlebih dahulu.');
        return;
      }
      setTestMessage(`Menguji koneksi ke server CrowLLM (${crowllmModelId})...`);
      const res = await CrowllmService.testConnection(
        crowllmApiKey.trim(),
        crowllmBaseUrl.trim(),
        crowllmModelId.trim()
      );
      setTestStatus(res.success ? 'success' : 'error');
      setTestMessage(res.message);
    }
  };

  // Save Settings
  const handleSave = () => {
    const newSettings: ApiSettings = {
      provider,
      apiKey: geminiApiKey.trim(),
      modelId: geminiModelId,
      temperature,
      crowllmApiKey: crowllmApiKey.trim(),
      crowllmBaseUrl: crowllmBaseUrl.trim(),
      crowllmModelId: crowllmModelId.trim(),
      enableAutoFallback,
      fallbackProvider,
    };
    GeminiService.saveSettings(newSettings);
    onSettingsSaved(newSettings);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  // Clear current provider settings
  const handleClear = () => {
    if (confirm('Apakah Anda yakin ingin menghapus konfigurasi API dan kembali ke default?')) {
      GeminiService.clearSettings();
      setProvider('gemini');
      setGeminiApiKey('');
      setGeminiModelId(AVAILABLE_MODELS[0].id);
      setCrowllmApiKey('');
      setCrowllmBaseUrl(CROWLLM_DEFAULT_BASE_URL);
      setCrowllmModelId(CROWLLM_DEFAULT_MODEL);
      setEnableAutoFallback(false);
      setFallbackProvider('crowllm');
      setTemperature(0.2);
      setTestStatus('idle');
      setTestMessage('');
      onSettingsSaved({
        provider: 'gemini',
        apiKey: '',
        modelId: AVAILABLE_MODELS[0].id,
        temperature: 0.2,
        crowllmApiKey: '',
        crowllmBaseUrl: CROWLLM_DEFAULT_BASE_URL,
        crowllmModelId: CROWLLM_DEFAULT_MODEL,
        enableAutoFallback: false,
        fallbackProvider: 'crowllm'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl glass-studio bg-studio-900 rounded-2xl border border-studio-700/80 shadow-2xl p-6 sm:p-7 space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-studio-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                API & PENGATURAN PROVIDER
              </h3>
              <p className="text-xs text-slate-400">
                Konfigurasi Google Gemini & CrowLLM (OpenAI-Compatible)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-studio-800/80 hover:bg-studio-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Pilih Provider Aktif</span>
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-studio-950 rounded-xl border border-studio-800">
            <button
              type="button"
              onClick={() => {
                setProvider('gemini');
                setTestStatus('idle');
                setTestMessage('');
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                provider === 'gemini'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-300" />
              <span>Google Gemini</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setProvider('crowllm');
                setTestStatus('idle');
                setTestMessage('');
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                provider === 'crowllm'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-300" />
              <span>CrowLLM (OpenAI)</span>
            </button>
          </div>
        </div>

        {/* GEMINI SETTINGS PANEL */}
        {provider === 'gemini' && (
          <div className="space-y-4 p-4 rounded-xl bg-studio-950/40 border border-studio-800/80 animate-fade-in">
            {/* API Key */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Gemini API Key (BYOK)
              </label>
              <div className="relative">
                <input
                  type={showGeminiApiKey ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 pr-24 rounded-xl bg-studio-950/80 border border-studio-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
                <div className="absolute right-2 top-2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowGeminiApiKey(!showGeminiApiKey)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                    title={showGeminiApiKey ? "Sembunyikan Kunci" : "Tampilkan Kunci"}
                  >
                    {showGeminiApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Kunci disimpan secara lokal di browser dan tidak pernah dibagikan ke server lain.</span>
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>Pilihan Model Gemini</span>
              </label>
              <select
                value={geminiModelId}
                onChange={(e) => setGeminiModelId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-studio-950/80 border border-studio-700 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {AVAILABLE_MODELS.map((model) => (
                  <option key={model.id} value={model.id} className="bg-studio-900 text-slate-100">
                    {model.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 italic">
                {AVAILABLE_MODELS.find(m => m.id === geminiModelId)?.description}
              </p>
            </div>
          </div>
        )}

        {/* CROWLLM SETTINGS PANEL */}
        {provider === 'crowllm' && (
          <div className="space-y-4 p-4 rounded-xl bg-studio-950/40 border border-studio-800/80 animate-fade-in">
            {/* Base URL */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>CrowLLM Base URL</span>
              </label>
              <input
                type="text"
                value={crowllmBaseUrl}
                onChange={(e) => setCrowllmBaseUrl(e.target.value)}
                placeholder="https://crowllm.com/v1"
                className="w-full px-4 py-2.5 rounded-xl bg-studio-950/80 border border-studio-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-500">
                Endpoint standar: <span className="font-mono text-slate-400">{crowllmBaseUrl.replace(/\/+$/, '')}/chat/completions</span>
              </p>
            </div>

            {/* CrowLLM API Key */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                CrowLLM Bearer API Key
              </label>
              <div className="relative">
                <input
                  type={showCrowllmApiKey ? 'text' : 'password'}
                  value={crowllmApiKey}
                  onChange={(e) => setCrowllmApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 pr-24 rounded-xl bg-studio-950/80 border border-studio-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
                <div className="absolute right-2 top-2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowCrowllmApiKey(!showCrowllmApiKey)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                    title={showCrowllmApiKey ? "Sembunyikan Kunci" : "Tampilkan Kunci"}
                  >
                    {showCrowllmApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>API Key disimpan secara aman di browser lokal Anda.</span>
              </p>
            </div>

            {/* Model ID Selection & Dynamic Fetch */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Model ID CrowLLM</span>
                </label>
                <button
                  type="button"
                  onClick={handleLoadCrowllmModels}
                  disabled={isLoadingModels || !crowllmApiKey.trim()}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 disabled:opacity-40"
                  title="Ambil daftar model yang tersedia dari endpoint /models"
                >
                  {isLoadingModels ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  <span>{isLoadingModels ? 'Memuat...' : 'Muat Model Tersedia'}</span>
                </button>
              </div>

              {crowllmModelsList.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    value={crowllmModelId}
                    onChange={(e) => setCrowllmModelId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-studio-950/80 border border-studio-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono text-xs"
                  >
                    {crowllmModelsList.map((m) => (
                      <option key={m} value={m} className="bg-studio-900 text-slate-100">
                        {m}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{crowllmModelsList.length} model berhasil dimuat dari akun CrowLLM Anda.</span>
                  </p>
                </div>
              ) : (
                <input
                  type="text"
                  value={crowllmModelId}
                  onChange={(e) => setCrowllmModelId(e.target.value)}
                  placeholder="gpt-4o"
                  className="w-full px-4 py-2.5 rounded-xl bg-studio-950/80 border border-studio-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono text-xs"
                />
              )}

              {modelsLoadError && (
                <p className="text-[11px] text-rose-400 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{modelsLoadError}</span>
                </p>
              )}
              <p className="text-[11px] text-slate-500">
                Pilih model yang mendukung input audio multimodal (misal: model berbasis audio/vision).
              </p>
            </div>
          </div>
        )}

        {/* CROSS-PROVIDER FALLBACK CONFIGURATION */}
        <div className="p-4 rounded-xl bg-studio-950/60 border border-studio-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5 uppercase tracking-wider">
                <Shuffle className="w-3.5 h-3.5 text-blue-400" />
                <span>Fallback Otomatis Antar Provider</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Alihkan otomatis jika provider utama mengalami gangguan server (503, 500, 429, timeout).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnableAutoFallback(!enableAutoFallback)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                enableAutoFallback ? 'bg-blue-600' : 'bg-studio-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  enableAutoFallback ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {enableAutoFallback && (
            <div className="pt-2 border-t border-studio-800/60 flex items-center justify-between text-xs animate-fade-in">
              <span className="text-slate-400">Provider Cadangan:</span>
              <select
                value={fallbackProvider}
                onChange={(e) => setFallbackProvider(e.target.value as ApiProvider)}
                className="px-3 py-1.5 rounded-lg bg-studio-900 border border-studio-700 text-xs text-slate-200 focus:outline-none"
              >
                <option value={provider === 'gemini' ? 'crowllm' : 'gemini'}>
                  {provider === 'gemini' ? 'CrowLLM (Cadangan)' : 'Google Gemini (Cadangan)'}
                </option>
              </select>
            </div>
          )}
        </div>

        {/* Temperature Tuning */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center space-x-1.5 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Analytic Temperature</span>
            </span>
            <span className="font-mono text-blue-400">{temperature.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-studio-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0.0 (Presisi & Objektif Tinggi)</span>
            <span>0.2 (Direkomendasikan)</span>
            <span>1.0 (Lebih Eksploratif)</span>
          </div>
        </div>

        {/* Connection Test Status Feedback */}
        {testStatus !== 'idle' && (
          <div className={`p-4 rounded-xl border text-xs flex items-start space-x-3 transition-all ${
            testStatus === 'testing'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              : testStatus === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {testStatus === 'testing' && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 mt-0.5 text-blue-400" />}
            {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />}
            {testStatus === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />}
            <span className="leading-relaxed">{testMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Pengaturan berhasil disimpan!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-studio-800">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing' || (provider === 'gemini' ? !geminiApiKey.trim() : !crowllmApiKey.trim())}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-studio-800 hover:bg-studio-700 text-slate-200 border border-studio-700 transition-colors disabled:opacity-40"
            >
              {testStatus === 'testing' ? 'Menguji...' : `Uji Koneksi ${provider === 'gemini' ? 'Gemini' : 'CrowLLM'}`}
            </button>
            {(geminiApiKey || crowllmApiKey) && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors"
                title="Hapus Kunci API & Reset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md shadow-blue-600/30 studio-glow"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
