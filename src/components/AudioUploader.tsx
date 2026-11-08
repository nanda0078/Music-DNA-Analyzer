import React, { useState, useRef } from 'react';
import { Upload, Music, AlertCircle, FileAudio, ShieldCheck } from 'lucide-react';
import { AudioProcessor } from '../services/audioProcessor';

interface AudioUploaderProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({ onFileSelected, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setValidationError(null);
    const validation = AudioProcessor.validateAudioFile(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'File audio tidak valid.');
      return;
    }
    onFileSelected(file);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative group rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-blue-500 bg-blue-600/10 studio-glow scale-[1.01]'
            : 'border-studio-700/80 bg-studio-900/40 hover:border-blue-500/50 hover:bg-studio-850/50'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.webm"
          className="hidden"
          onChange={handleFileChange}
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          
          {/* Audio Icon Container */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-studio-800 to-studio-850 border border-studio-700 flex items-center justify-center group-hover:scale-105 group-hover:border-blue-500/50 transition-all duration-300 shadow-lg">
            <Music className="w-10 h-10 text-blue-400 group-hover:text-blue-300 transition-colors" />
          </div>

          <div className="space-y-1.5 max-w-lg">
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
              Unggah Audio Referensi (Song A)
            </h3>
            <p className="text-sm text-slate-400">
              Tarik dan lepaskan file audio ke sini, atau <span className="text-blue-400 font-semibold underline underline-offset-4">pilih dari perangkat Anda</span>
            </p>
          </div>

          {/* Formats Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {['MP3', 'WAV', 'OGG', 'M4A', 'FLAC', 'AAC'].map((fmt) => (
              <span
                key={fmt}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 bg-studio-800/90 border border-studio-700/60 rounded-md"
              >
                {fmt}
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400/80" />
            <span>Preservasi audio asli terjamin — file tidak dimodifikasi dan diproses secara aman</span>
          </div>

        </div>
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start space-x-3 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-semibold">Kesalahan Validasi File</p>
            <p className="text-xs text-rose-300/90 mt-0.5">{validationError}</p>
          </div>
        </div>
      )}
    </div>
  );
};
