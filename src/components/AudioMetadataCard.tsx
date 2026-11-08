import React from 'react';
import { FileText, Clock, HardDrive, Disc, Activity, Layers } from 'lucide-react';
import { AudioMetadata } from '../types';
import { AudioProcessor } from '../services/audioProcessor';

interface AudioMetadataCardProps {
  metadata: AudioMetadata;
}

export const AudioMetadataCard: React.FC<AudioMetadataCardProps> = ({ metadata }) => {
  return (
    <div className="w-full glass-card rounded-2xl p-4 sm:p-5 border border-studio-700/60">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-studio-800">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="uppercase tracking-wider">Informasi Teknis Audio</span>
        </div>
        <span className="px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          Audio Valid & Terdekode
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* File Name */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-2 p-3 bg-studio-950/60 rounded-xl border border-studio-800/80">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mb-1">
            <Disc className="w-3.5 h-3.5 text-blue-400" />
            <span>Nama File</span>
          </div>
          <p className="text-xs font-semibold text-white truncate" title={metadata.fileName}>
            {metadata.fileName}
          </p>
        </div>

        {/* Duration */}
        <div className="p-3 bg-studio-950/60 rounded-xl border border-studio-800/80">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Durasi</span>
          </div>
          <p className="text-xs font-mono font-bold text-blue-300">
            {AudioProcessor.formatDuration(metadata.duration)}
          </p>
        </div>

        {/* File Size */}
        <div className="p-3 bg-studio-950/60 rounded-xl border border-studio-800/80">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mb-1">
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span>Ukuran</span>
          </div>
          <p className="text-xs font-mono font-bold text-slate-200">
            {AudioProcessor.formatBytes(metadata.fileSize)}
          </p>
        </div>

        {/* Sample Rate */}
        <div className="p-3 bg-studio-950/60 rounded-xl border border-studio-800/80">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mb-1">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Sample Rate</span>
          </div>
          <p className="text-xs font-mono font-bold text-slate-200">
            {metadata.sampleRate ? `${(metadata.sampleRate / 1000).toFixed(1)} kHz` : 'N/A'}
          </p>
        </div>

        {/* Channels */}
        <div className="p-3 bg-studio-950/60 rounded-xl border border-studio-800/80">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 mb-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Kanal</span>
          </div>
          <p className="text-xs font-bold text-slate-200">
            {metadata.channels === 2 ? 'Stereo (2 Ch)' : metadata.channels === 1 ? 'Mono (1 Ch)' : 'N/A'}
          </p>
        </div>

      </div>
    </div>
  );
};
