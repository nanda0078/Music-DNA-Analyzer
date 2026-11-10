import { ApiSettings, AnalysisResult, CustomIntroConfig, ApiProvider, VocalGender } from '../types';
import { GeminiService } from './geminiService';
import { CrowllmService } from './crowllmService';

export class AiRouter {
  /**
   * Check if an error qualifies for automatic cross-provider fallback
   */
  public static isCrossProviderFallbackEligible(error: unknown): boolean {
    if (!error) return false;
    const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

    // User input or model limitations are NOT fallback eligible
    if (msg.includes('tidak mendukung input audio') || msg.includes('api key tidak valid') || msg.includes('belum diatur') || msg.includes('401 unauthorized')) {
      return false;
    }

    // Server-side downtime, schema/gateway rejections (400), rate limits, high demand spikes, and network timeouts are eligible
    return (
      msg.includes('400') ||
      msg.includes('bad request') ||
      msg.includes('messages.') ||
      msg.includes('503') ||
      msg.includes('502') ||
      msg.includes('500') ||
      msg.includes('429') ||
      msg.includes('high demand') ||
      msg.includes('rate limit') ||
      msg.includes('timeout') ||
      msg.includes('kesalahan jaringan') ||
      msg.includes('gagal menghubungi') ||
      msg.includes('service unavailable')
    );
  }

  /**
   * Test connection for the given settings and provider
   */
  public static async testConnection(
    provider: ApiProvider,
    settings: ApiSettings
  ): Promise<{ success: boolean; message: string }> {
    if (provider === 'crowllm') {
      return await CrowllmService.testConnection(
        settings.crowllmApiKey,
        settings.crowllmBaseUrl,
        settings.crowllmModelId
      );
    } else {
      return await GeminiService.testConnection(
        settings.apiKey,
        settings.modelId
      );
    }
  }

  /**
   * Main entry point to analyze audio with active provider and cross-provider fallback
   */
  public static async analyzeAudio(
    base64Audio: string,
    mimeType: string,
    fileMeta: { fileName: string; fileSize: number; duration: number },
    onProgress?: (step: string, percentage: number) => void,
    replacementVocal?: string,
    customIntro?: CustomIntroConfig,
    settingsOverride?: ApiSettings,
    vocalGender?: VocalGender
  ): Promise<AnalysisResult> {
    const settings = settingsOverride || GeminiService.getStoredSettings();
    const primaryProvider: ApiProvider = settings.provider || 'gemini';

    try {
      if (primaryProvider === 'crowllm') {
        return await CrowllmService.analyzeAudio(
          base64Audio,
          mimeType,
          fileMeta,
          onProgress,
          replacementVocal,
          customIntro,
          settings,
          vocalGender
        );
      } else {
        return await GeminiService.analyzeAudio(
          base64Audio,
          mimeType,
          fileMeta,
          onProgress,
          replacementVocal,
          customIntro,
          vocalGender
        );
      }
    } catch (primaryError: unknown) {
      // Check if user enabled cross-provider fallback
      const canFallback = 
        Boolean(settings.enableAutoFallback) &&
        Boolean(settings.fallbackProvider) &&
        settings.fallbackProvider !== primaryProvider &&
        this.isCrossProviderFallbackEligible(primaryError);

      if (!canFallback) {
        throw primaryError;
      }

      const secondaryProvider = settings.fallbackProvider!;
      const primaryName = primaryProvider === 'crowllm' ? 'CrowLLM' : 'Google Gemini';
      const secondaryName = secondaryProvider === 'crowllm' ? 'CrowLLM' : 'Google Gemini';

      onProgress?.(
        `Provider utama (${primaryName}) mengalami gangguan server. Mengalihkan otomatis ke provider cadangan (${secondaryName})...`,
        65
      );

      try {
        if (secondaryProvider === 'crowllm') {
          return await CrowllmService.analyzeAudio(
            base64Audio,
            mimeType,
            fileMeta,
            onProgress,
            replacementVocal,
            customIntro,
            settings,
            vocalGender
          );
        } else {
          return await GeminiService.analyzeAudio(
            base64Audio,
            mimeType,
            fileMeta,
            onProgress,
            replacementVocal,
            customIntro,
            vocalGender
          );
        }
      } catch (secondaryError: unknown) {
        const secMsg = secondaryError instanceof Error ? secondaryError.message : String(secondaryError);
        const priMsg = primaryError instanceof Error ? primaryError.message : String(primaryError);
        throw new Error(
          `Gagal pada Provider Utama (${primaryName}: ${priMsg}) dan Provider Cadangan (${secondaryName}: ${secMsg}).`
        );
      }
    }
  }
}
