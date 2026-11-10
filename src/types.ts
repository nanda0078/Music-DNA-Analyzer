export interface AudioMetadata {
  fileName: string;
  fileSize: number; // in bytes
  fileType: string;
  duration: number; // in seconds
  sampleRate?: number;
  channels?: number;
  dataUrl?: string; // for HTML5 audio element
}

export interface CustomIntroConfig {
  enabled: boolean;
  autoInstruments?: boolean;
  instruments: string[];
  atmosphere: string;
  dynamics: string;
  customInstruction?: string;
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
  replacementVocal?: string;
  customIntro?: CustomIntroConfig;
}

export type ApiProvider = 'gemini' | 'crowllm';

export interface ApiSettings {
  provider: ApiProvider;
  
  // Google Gemini Configuration (Backward compatible)
  apiKey: string;
  modelId: string;
  temperature: number;

  // CrowLLM Configuration (OpenAI-compatible)
  crowllmApiKey: string;
  crowllmBaseUrl: string;
  crowllmModelId: string;

  // Provider Fallback Configuration
  enableAutoFallback?: boolean;
  fallbackProvider?: ApiProvider;
}

export type AnalysisStatus = 'idle' | 'decoding' | 'analyzing' | 'optimizing' | 'completed' | 'error';

export interface ProgressState {
  status: AnalysisStatus;
  percentage: number;
  message: string;
  subMessage?: string;
  error?: string;
}
