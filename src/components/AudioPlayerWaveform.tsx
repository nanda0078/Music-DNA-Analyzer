import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, RefreshCw, Trash2 } from 'lucide-react';
import { AudioProcessor } from '../services/audioProcessor';

interface AudioPlayerWaveformProps {
  audioUrl: string;
  duration: number;
  waveformPeaks: number[];
  onReplaceAudio: () => void;
  onRemoveAudio: () => void;
}

export const AudioPlayerWaveform: React.FC<AudioPlayerWaveformProps> = ({
  audioUrl,
  duration,
  waveformPeaks,
  onReplaceAudio,
  onRemoveAudio,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isHoveringWaveform, setIsHoveringWaveform] = useState(false);

  // Initialize audio volume & events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [audioUrl, isMuted, volume]);

  // Draw Waveform onto HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const peaks = waveformPeaks.length > 0 ? waveformPeaks : new Array(100).fill(0.3);
    const numBars = peaks.length;
    const barSpacing = width / numBars;
    const barWidth = Math.max(2, barSpacing - 1.5);
    const progressRatio = duration > 0 ? currentTime / duration : 0;

    for (let i = 0; i < numBars; i++) {
      const peak = peaks[i];
      const barHeight = Math.max(6, peak * (height - 12));
      const x = i * barSpacing;
      const y = (height - barHeight) / 2;
      const isPlayed = (i / numBars) <= progressRatio;

      // Color played vs unplayed bars
      if (isPlayed) {
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#60a5fa');
        gradient.addColorStop(1, '#2563eb');
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = '#1e293b';
      }

      // Draw rounded bar
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [2]);
      ctx.fill();
    }

    // Draw playhead cursor line
    if (progressRatio > 0 && progressRatio <= 1) {
      const playheadX = progressRatio * width;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(playheadX - 1, 0, 2, height);
    }
  }, [waveformPeaks, currentTime, duration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio || duration <= 0) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audio.volume = nextMuted ? 0 : volume;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  return (
    <div className="w-full glass-card rounded-2xl p-5 border border-studio-700/80 studio-glow">
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      {/* Header controls & replace/remove */}
      <div className="flex items-center justify-between pb-4 border-b border-studio-800">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPlaying ? 'bg-blue-400 opacity-75' : 'bg-transparent'}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-blue-500' : 'bg-slate-500'}`} />
          </span>
          <span className="uppercase tracking-wider">Audio Waveform & Player</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onReplaceAudio}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-studio-800 hover:bg-studio-700 hover:text-white border border-studio-700 transition-colors"
            title="Ganti file audio referensi"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Ganti</span>
          </button>
          <button
            onClick={onRemoveAudio}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
            title="Hapus file audio"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      {/* Interactive Waveform Canvas */}
      <div 
        className="relative my-4 w-full h-24 bg-studio-950/70 rounded-xl overflow-hidden cursor-pointer border border-studio-800/80 group"
        onMouseEnter={() => setIsHoveringWaveform(true)}
        onMouseLeave={() => setIsHoveringWaveform(false)}
      >
        <canvas
          ref={canvasRef}
          onClick={handleWaveformClick}
          className="w-full h-full block"
        />
        {isHoveringWaveform && (
          <div className="absolute top-2 right-3 pointer-events-none text-[10px] bg-studio-900/90 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-mono">
            Klik / Geser untuk lompat posisi
          </div>
        )}
      </div>

      {/* Playback Controls & Time */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        
        {/* Play/Pause & Restart */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-center sm:justify-start">
          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all duration-200 studio-glow shadow-lg shadow-blue-600/30"
            title={isPlaying ? "Jeda" : "Putar"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={handleRestart}
            className="w-9 h-9 rounded-full bg-studio-800 hover:bg-studio-700 text-slate-300 hover:text-white flex items-center justify-center border border-studio-700 transition-colors"
            title="Mulai Ulang"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Time Display */}
          <div className="flex items-center space-x-1.5 font-mono text-xs px-3 py-1.5 rounded-lg bg-studio-950/80 border border-studio-800 text-slate-300">
            <span className="text-blue-400 font-semibold">{AudioProcessor.formatDuration(currentTime)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{AudioProcessor.formatDuration(duration)}</span>
          </div>
        </div>

        {/* Volume & Seek Slider */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-center sm:justify-end">
          <button
            onClick={toggleMute}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            title={isMuted ? "Bunyikan" : "Bisukan"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-slate-300" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-1.5 bg-studio-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            title="Volume audio"
          />
        </div>

      </div>

    </div>
  );
};
