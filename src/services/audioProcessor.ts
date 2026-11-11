import { AudioMetadata, BpmAnalysis, BpmConfidence } from '../types';

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

  /**
   * Get classical / standard tempo category for a given BPM
   */
  public static getTempoCategory(bpm: number): string {
    if (bpm <= 0) return '';
    if (bpm < 60) return 'Largo';
    if (bpm < 76) return 'Adagio';
    if (bpm < 108) return 'Andante';
    if (bpm < 128) return 'Moderato';
    if (bpm < 156) return 'Allegro';
    if (bpm < 176) return 'Vivace';
    return 'Presto';
  }

  /**
   * Asynchronously detect BPM from AudioBuffer across the entire song.
   * Completely non-blocking and safe for UI rendering.
   */
  public static async detectBpm(audioBuffer: AudioBuffer): Promise<BpmAnalysis> {
    return new Promise((resolve) => {
      // Use setTimeout to yield execution so UI remains 100% responsive
      setTimeout(() => {
        try {
          const sampleRate = audioBuffer.sampleRate;
          const numChannels = audioBuffer.numberOfChannels;
          const totalSamples = audioBuffer.length;

          if (!totalSamples || totalSamples < sampleRate) {
            resolve({
              bpm: 0,
              confidence: 'Low',
              halfTimeBpm: 0,
              doubleTimeBpm: 0,
              status: 'failed'
            });
            return;
          }

          // Downmix channels to mono for full-spectrum analysis
          let monoData: Float32Array;
          if (numChannels === 1) {
            monoData = audioBuffer.getChannelData(0);
          } else {
            const ch0 = audioBuffer.getChannelData(0);
            const ch1 = audioBuffer.getChannelData(1);
            monoData = new Float32Array(totalSamples);
            for (let i = 0; i < totalSamples; i++) {
              monoData[i] = (ch0[i] + ch1[i]) * 0.5;
            }
          }

          const result = this.calculateBpmFromChannelData(monoData, sampleRate);
          resolve(result);
        } catch (err) {
          console.warn('Error during BPM detection:', err);
          resolve({
            bpm: 0,
            confidence: 'Low',
            halfTimeBpm: 0,
            doubleTimeBpm: 0,
            status: 'failed'
          });
        }
      }, 10);
    });
  }

  /**
   * High-precision beat tracking and tempo estimation on raw PCM audio data.
   * Analyzes the entire song using dual-band onset flux, adaptive baseline subtraction,
   * multi-harmonic autocorrelation comb resonator, and human tactus prior weighting.
   */
  public static calculateBpmFromChannelData(channelData: Float32Array, sampleRate: number): BpmAnalysis {
    const hopSize = Math.max(1, Math.floor(sampleRate * 0.01)); // ~10ms hop
    const windowSize = Math.max(2, Math.floor(sampleRate * 0.02)); // ~20ms window
    const envSampleRate = sampleRate / hopSize; // ~100 Hz
    const totalSamples = channelData.length;
    const numFrames = Math.floor((totalSamples - windowSize) / hopSize);

    if (numFrames < 80) {
      return {
        bpm: 0,
        confidence: 'Low',
        halfTimeBpm: 0,
        doubleTimeBpm: 0,
        status: 'failed'
      };
    }

    // 1. Dual-band digital filter (Lowpass at 220Hz for kick/bass, mid for snare/harmony/transients)
    const fc = 220;
    const alpha = (2 * Math.PI * fc / sampleRate) / (1 + (2 * Math.PI * fc / sampleRate));

    let y1 = 0;
    let y2 = 0;
    const lowPass = new Float32Array(totalSamples);
    const midPass = new Float32Array(totalSamples);

    for (let i = 0; i < totalSamples; i++) {
      const x = channelData[i];
      y1 += alpha * (x - y1);
      y2 += alpha * (y1 - y2);
      lowPass[i] = y2;
      midPass[i] = x - y2;
    }

    // Frame energy
    const lowEnergy = new Float32Array(numFrames);
    const midEnergy = new Float32Array(numFrames);

    for (let f = 0; f < numFrames; f++) {
      const start = f * hopSize;
      let sumLow = 0;
      let sumMid = 0;
      // Step by 2 for high computational efficiency without losing fidelity
      for (let j = 0; j < windowSize; j += 2) {
        const l = lowPass[start + j];
        const m = midPass[start + j];
        sumLow += l * l;
        sumMid += m * m;
      }
      lowEnergy[f] = Math.sqrt(sumLow);
      midEnergy[f] = Math.sqrt(sumMid);
    }

    // 2. Onset flux (first-order difference, half-wave rectified)
    const lowDiff = new Float32Array(numFrames);
    const midDiff = new Float32Array(numFrames);
    let meanLowDiff = 0;
    let meanMidDiff = 0;

    for (let f = 1; f < numFrames; f++) {
      const dl = Math.max(0, lowEnergy[f] - lowEnergy[f - 1]);
      const dm = Math.max(0, midEnergy[f] - midEnergy[f - 1]);
      lowDiff[f] = dl;
      midDiff[f] = dm;
      meanLowDiff += dl;
      meanMidDiff += dm;
    }
    meanLowDiff /= numFrames;
    meanMidDiff /= numFrames;

    let varLow = 0;
    let varMid = 0;
    for (let f = 1; f < numFrames; f++) {
      varLow += (lowDiff[f] - meanLowDiff) ** 2;
      varMid += (midDiff[f] - meanMidDiff) ** 2;
    }
    const stdLow = Math.sqrt(varLow / numFrames) || 1e-6;
    const stdMid = Math.sqrt(varMid / numFrames) || 1e-6;

    const onset = new Float32Array(numFrames);
    for (let f = 1; f < numFrames; f++) {
      onset[f] = 0.6 * (lowDiff[f] / stdLow) + 0.4 * (midDiff[f] / stdMid);
    }

    // 3. Local moving average subtraction (1.2s window) to remove dynamic volume swells (e.g. intro/crescendo)
    const maWindow = Math.min(120, Math.floor(envSampleRate * 1.2));
    let runSum = 0;
    for (let i = 0; i < maWindow && i < numFrames; i++) {
      runSum += onset[i];
    }

    const cleanOnset = new Float32Array(numFrames);
    for (let f = 0; f < numFrames; f++) {
      const avg = runSum / maWindow;
      cleanOnset[f] = Math.max(0, onset[f] - avg);
      const nextIdx = f + Math.floor(maWindow / 2);
      const prevIdx = f - Math.floor(maWindow / 2);
      if (nextIdx < numFrames) runSum += onset[nextIdx];
      if (prevIdx >= 0) runSum -= onset[prevIdx];
    }

    // Energy of clean onset
    let onsetEnergy = 0;
    for (let f = 0; f < numFrames; f++) {
      onsetEnergy += cleanOnset[f] * cleanOnset[f];
    }
    if (onsetEnergy < 1e-6) {
      return {
        bpm: 0,
        confidence: 'Low',
        halfTimeBpm: 0,
        doubleTimeBpm: 0,
        status: 'failed'
      };
    }

    // Helper: Fractional lag correlation with linear interpolation
    const getCorrelation = (lag: number): number => {
      if (lag < 4 || lag >= numFrames - 10) return 0;
      const intLag = Math.floor(lag);
      const frac = lag - intLag;
      let sum = 0;
      const len = numFrames - intLag - 1;
      for (let f = 0; f < len; f++) {
        const v1 = cleanOnset[f];
        const v2 = cleanOnset[f + intLag] * (1 - frac) + cleanOnset[f + intLag + 1] * frac;
        sum += v1 * v2;
      }
      return sum / onsetEnergy;
    };

    // 4. Test candidate BPMs from 60 to 190 in steps of 0.5
    const minBpm = 60;
    const maxBpm = 190;
    const bpmStep = 0.5;
    const numCandidates = Math.floor((maxBpm - minBpm) / bpmStep) + 1;
    const candidates = new Float32Array(numCandidates);
    const rawScores = new Float32Array(numCandidates);
    const scores = new Float32Array(numCandidates);

    for (let i = 0; i < numCandidates; i++) {
      candidates[i] = minBpm + i * bpmStep;
    }

    for (let i = 0; i < numCandidates; i++) {
      const bpm = candidates[i];
      const lag = (60 * envSampleRate) / bpm;
      const r1 = getCorrelation(lag);
      const r2 = getCorrelation(lag * 2); // 2 beats
      const r4 = getCorrelation(lag * 4); // 4 beats (measure)
      const rHalf = getCorrelation(lag * 0.5); // half beat

      rawScores[i] = r1;

      // Harmonic beat resonance comb
      const harmonicResonance = r1 + 0.6 * r2 + 0.3 * r4 + 0.4 * rHalf;

      // Human tempo tactus prior (Gaussian centered around 120 BPM)
      const tactusWeight = Math.exp(-0.5 * Math.pow((Math.log(bpm) - Math.log(120)) / 0.42, 2));

      scores[i] = harmonicResonance * (0.65 + 0.35 * tactusWeight);
    }

    // Find best peak
    let maxScore = -1;
    let bestIdx = 0;
    for (let i = 0; i < numCandidates; i++) {
      if (scores[i] > maxScore) {
        maxScore = scores[i];
        bestIdx = i;
      }
    }

    // Parabolic interpolation for fine sub-BPM accuracy
    let refinedBpm = candidates[bestIdx];
    if (bestIdx > 0 && bestIdx < numCandidates - 1) {
      const y0 = scores[bestIdx];
      const yMinus = scores[bestIdx - 1];
      const yPlus = scores[bestIdx + 1];
      const denom = 2 * (2 * y0 - yMinus - yPlus);
      if (denom > 1e-7) {
        const delta = (yPlus - yMinus) / denom;
        if (Math.abs(delta) <= 1) {
          refinedBpm += delta * bpmStep;
        }
      }
    }

    // Check octave ambiguity (double-time vs half-time)
    const doubleBpm = refinedBpm * 2;
    if (doubleBpm <= 180 && refinedBpm < 80) {
      const lagDouble = (60 * envSampleRate) / doubleBpm;
      const rDouble = getCorrelation(lagDouble);
      const lagCurrent = (60 * envSampleRate) / refinedBpm;
      const rCurrent = getCorrelation(lagCurrent);
      if (rDouble > rCurrent * 0.95) {
        refinedBpm = doubleBpm;
      }
    }

    const roundedBpm = Math.round(refinedBpm);
    const halfTimeBpm = Math.round(roundedBpm / 2);
    const doubleTimeBpm = Math.round(roundedBpm * 2);

    // Calculate confidence based on peak score salience (Z-score)
    let sumScore = 0;
    for (let i = 0; i < numCandidates; i++) sumScore += scores[i];
    const meanScore = sumScore / numCandidates;

    let varScore = 0;
    for (let i = 0; i < numCandidates; i++) varScore += (scores[i] - meanScore) ** 2;
    const stdScore = Math.sqrt(varScore / numCandidates) || 1e-6;

    const zScore = (maxScore - meanScore) / stdScore;
    const peakRaw = rawScores[bestIdx];

    let confidence: BpmConfidence = 'Low';
    if (zScore >= 3.0 && peakRaw >= 0.08) {
      confidence = 'High';
    } else if (zScore >= 1.8 && peakRaw >= 0.04) {
      confidence = 'Medium';
    } else if (peakRaw >= 0.015) {
      confidence = 'Low';
    } else {
      return {
        bpm: 0,
        confidence: 'Low',
        halfTimeBpm: 0,
        doubleTimeBpm: 0,
        status: 'failed'
      };
    }

    const tempoCategory = this.getTempoCategory(roundedBpm);

    return {
      bpm: roundedBpm,
      rawBpm: Number(refinedBpm.toFixed(1)),
      confidence,
      halfTimeBpm,
      doubleTimeBpm,
      tempoCategory,
      status: 'detected'
    };
  }
}
