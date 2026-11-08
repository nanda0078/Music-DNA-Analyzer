export interface AudioMetadata {
  fileName: string;
  fileSize: number; // in bytes
  fileType: string;
  duration: number; // in seconds
  sampleRate?: number;
  channels?: number;
  dataUrl?: string; // for HTML5 audio element
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  fileName: string;
  fileSize: number;
  duration: number;
  coverDescription: string;
  style: string;
  charCount: number;
  modelUsed: string;
  wasOptimized?: boolean;
}

export interface ApiSettings {
  apiKey: string;
  modelId: string;
  temperature: number;
}

export type AnalysisStatus = 'idle' | 'decoding' | 'analyzing' | 'optimizing' | 'completed' | 'error';

export interface ProgressState {
  status: AnalysisStatus;
  percentage: number;
  message: string;
  subMessage?: string;
  error?: string;
}
