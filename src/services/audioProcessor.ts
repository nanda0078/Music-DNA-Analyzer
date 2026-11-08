import { AudioMetadata } from '../types';

export class AudioProcessor {
  private static audioCtx: AudioContext | null = null;

  private static getAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Validate audio file format and size
   */
  public static validateAudioFile(file: File): { valid: boolean; error?: string } {
    const supportedExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.webm'];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExt = supportedExtensions.some(ext => fileNameLower.endsWith(ext));
    const isAudioMime = file.type.startsWith('audio/') || file.type === 'video/ogg';

    if (!hasValidExt && !isAudioMime) {
      return {
        valid: false,
        error: `Format file "${file.name}" tidak didukung. Harap unggah format audio MP3, WAV, OGG, M4A, AAC, atau FLAC.`
      };
    }

    // Limit to 60MB for reliable browser base64 transfer
    const MAX_SIZE_MB = 60;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return {
        valid: false,
        error: `Ukuran file audio terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)}MB). Batas maksimal adalah ${MAX_SIZE_MB}MB.`
      };
    }

    return { valid: true };
  }

  /**
   * Decode audio file and extract technical metadata & waveform peaks
   */
  public static async analyzeAudioFile(file: File): Promise<{
    metadata: AudioMetadata;
    waveformPeaks: number[];
    audioBuffer: AudioBuffer;
    base64Data: string;
    mimeType: string;
  }> {
    const arrayBuffer = await file.arrayBuffer();
    const ctx = this.getAudioContext();

    // Decode audio data using browser native audio engine
    // Make a clone of arrayBuffer because decodeAudioData detaches it
    const bufferCopy = arrayBuffer.slice(0);
    const audioBuffer = await ctx.decodeAudioData(bufferCopy);

    // Extract technical metadata
    const metadata: AudioMetadata = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || this.inferMimeType(file.name),
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      channels: audioBuffer.numberOfChannels,
      dataUrl: URL.createObjectURL(file)
    };

    // Extract waveform peaks for visualization (120 sample bins)
    const waveformPeaks = this.extractWaveformPeaks(audioBuffer, 120);

    // Convert original file to Base64
    const base64Data = await this.fileToBase64(file);
    const mimeType = metadata.fileType;

    return {
      metadata,
      waveformPeaks,
      audioBuffer,
      base64Data,
      mimeType
    };
  }

  /**
   * Extract normalized peaks from audio buffer for waveform rendering
   */
  public static extractWaveformPeaks(buffer: AudioBuffer, numPeaks: number = 120): number[] {
    const channelData = buffer.getChannelData(0);
    const totalSamples = channelData.length;
    const blockSize = Math.floor(totalSamples / numPeaks);
    const peaks: number[] = [];

    for (let i = 0; i < numPeaks; i++) {
      const start = i * blockSize;
      let max = 0;
      for (let j = 0; j < blockSize; j++) {
        const val = Math.abs(channelData[start + j] || 0);
        if (val > max) max = val;
      }
      peaks.push(max);
    }

    // Normalize peaks between 0.1 and 1.0 for aesthetic display
    const maxPeak = Math.max(...peaks, 0.01);
    return peaks.map(p => Math.max(0.12, p / maxPeak));
  }

  /**
   * Convert file to pure Base64 string (without data URI prefix)
   */
  public static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data:audio/...;base64,
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Infer MIME type from file extension
   */
  public static inferMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'mp3': return 'audio/mp3';
      case 'wav': return 'audio/wav';
      case 'ogg': return 'audio/ogg';
      case 'm4a': return 'audio/m4a';
      case 'aac': return 'audio/aac';
      case 'flac': return 'audio/flac';
      case 'webm': return 'audio/webm';
      default: return 'audio/mp3';
    }
  }

  /**
   * Format seconds to mm:ss
   */
  public static formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Format bytes to readable string (MB/KB)
   */
  public static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
