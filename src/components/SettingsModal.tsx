import React, { useState, useEffect } from 'react';
import { X, Key, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Cpu, Sliders, ShieldCheck, Trash2 } from 'lucide-react';
import { ApiSettings } from '../types';
import { AVAILABLE_MODELS } from '../constants';
import { GeminiService } from '../services/geminiService';

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
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [modelId, setModelId] = useState(AVAILABLE_MODELS[0].id);
  const [temperature, setTemperature] = useState(0.2);

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = GeminiService.getStoredSettings();
      setApiKey(stored.apiKey);
      setModelId(stored.modelId || AVAILABLE_MODELS[0].id);
      setTemperature(stored.temperature ?? 0.2);
      setTestStatus('idle');
      setTestMessage('');
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Harap masukkan Kunci Gemini API terlebih dahulu.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Menguji koneksi ke server Google Gemini...');

    const res = await GeminiService.testConnection(apiKey.trim(), modelId);
    if (res.success) {
      setTestStatus('success');
      setTestMessage(res.message);
    } else {
      setTestStatus('error');
      setTestMessage(res.message);
    }
  };

  const handleSave = () => {
    const newSettings: ApiSettings = {
      apiKey: apiKey.trim(),
      modelId,
      temperature,
    };
    GeminiService.saveSettings(newSettings);
    onSettingsSaved(newSettings);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    if (confirm('Apakah Anda yakin ingin menghapus API Key dan kembali ke pengaturan default?')) {
      GeminiService.clearSettings();
      setApiKey('');
      setModelId(AVAILABLE_MODELS[0].id);
      setTemperature(0.2);
      setTestStatus('idle');
      setTestMessage('');
      onSettingsSaved({ apiKey: '', modelId: AVAILABLE_MODELS[0].id, temperature: 0.2 });
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
                API & PENGATURAN
              </h3>
              <p className="text-xs text-slate-400">
                Manajemen Kunci Google Gemini (BYOK) & Konfigurasi Model
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

        {/* API Key Input Field */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Gemini API Key (BYOK)
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-3 pr-24 rounded-xl bg-studio-950/80 border border-studio-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono"
            />
            <div className="absolute right-2 top-2 flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                title={showApiKey ? "Sembunyikan Kunci" : "Tampilkan Kunci"}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Kunci disimpan secara lokal di browser Anda dan tidak pernah diteruskan ke server pihak ketiga.</span>
          </p>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Pilihan Model Gemini</span>
          </label>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-studio-950/80 border border-studio-700 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            {AVAILABLE_MODELS.map((model) => (
              <option key={model.id} value={model.id} className="bg-studio-900 text-slate-100">
                {model.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 italic">
            {AVAILABLE_MODELS.find(m => m.id === modelId)?.description}
          </p>
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
              disabled={testStatus === 'testing' || !apiKey.trim()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-studio-800 hover:bg-studio-700 text-slate-200 border border-studio-700 transition-colors disabled:opacity-40"
            >
              {testStatus === 'testing' ? 'Menguji...' : 'Uji Koneksi API'}
            </button>
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors"
                title="Hapus Kunci API"
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
