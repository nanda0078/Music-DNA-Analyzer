import { ApiSettings, AnalysisResult } from '../types';
import { 
  DEFAULT_SETTINGS, 
  MAX_COVER_DESCRIPTION_CHARS, 
  SYSTEM_ANALYSIS_INSTRUCTION, 
  SYSTEM_OPTIMIZATION_INSTRUCTION 
} from '../constants';
import { ValidatorService } from './validatorService';

const SETTINGS_KEY = 'music_dna_analyzer_settings_v1';

export class GeminiService {
  /**
   * Load stored API settings
   */
  public static getStoredSettings(): ApiSettings {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Automatically migrate deprecated gemini-2.5-flash to gemini-3.8-flash
        let activeModel = parsed.modelId || DEFAULT_SETTINGS.modelId;
        if (activeModel === 'gemini-2.5-flash') {
          activeModel = 'gemini-3.8-flash';
        }
        return {
          apiKey: parsed.apiKey || '',
          modelId: activeModel,
          temperature: typeof parsed.temperature === 'number' ? parsed.temperature : DEFAULT_SETTINGS.temperature,
        };
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Save API settings securely in browser localStorage
   */
  public static saveSettings(settings: ApiSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  /**
   * Clear API settings
   */
  public static clearSettings(): void {
    localStorage.removeItem(SETTINGS_KEY);
  }

  /**
   * Test API connection with the specified key and model
   */
  public static async testConnection(apiKey: string, modelId: string): Promise<{ success: boolean; message: string }> {
    if (!apiKey || apiKey.trim() === '') {
      return { success: false, message: 'Kunci Gemini API belum diisi.' };
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey.trim()}`;
      const payload = {
        contents: [
          {
            parts: [{ text: 'Respond strictly with the single word "READY".' }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0.1,
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData?.error?.message || response.statusText;
        if (response.status === 400 && errorMsg.includes('API_KEY_INVALID')) {
          return { success: false, message: 'API Key tidak valid. Mohon periksa kembali API Key Anda dari Google AI Studio.' };
        }
        if (response.status === 403) {
          return { success: false, message: 'Akses ditolak (403). Pastikan Gemini API aktif di proyek Google Cloud Anda.' };
        }
        if (response.status === 404) {
          return { success: false, message: `Model "${modelId}" tidak ditemukan atau tidak tersedia untuk akun ini.` };
        }
        if (response.status === 429) {
          return { success: false, message: 'Batas kuota API tercapai (Rate Limit / Quota Exceeded). Silakan coba lagi nanti.' };
        }
        return { success: false, message: `Koneksi gagal (${response.status}): ${errorMsg}` };
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text.includes('READY')) {
        return { success: true, message: `Koneksi berhasil! Model "${modelId}" aktif dan siap menganalisis.` };
      }

      return { success: true, message: `Koneksi berhasil terhubung ke Google Gemini API.` };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Kesalahan jaringan atau koneksi.';
      return { success: false, message: `Gagal menghubungi server Gemini: ${errorMessage}` };
    }
  }

  /**
   * Analyze reference audio to extract Musical DNA and generate exactly TWO outputs
   */
  public static async analyzeAudio(
    base64Audio: string,
    mimeType: string,
    fileMeta: { fileName: string; fileSize: number; duration: number },
    onProgress?: (step: string, percentage: number) => void
  ): Promise<AnalysisResult> {
    const settings = this.getStoredSettings();
    if (!settings.apiKey) {
      throw new Error('Kunci Gemini API belum diatur. Silakan buka menu "API & PENGATURAN" untuk memasukkan API Key Anda.');
    }

    let activeModel = settings.modelId || 'gemini-3.8-flash';
    if (activeModel === 'gemini-2.5-flash') {
      activeModel = 'gemini-3.8-flash';
    }

    onProgress?.('Mengirim audio referensi ke Gemini AI...', 30);

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${SYSTEM_ANALYSIS_INSTRUCTION}\n\n[FILE METADATA]\nFilename: ${fileMeta.fileName}\nDuration: ${Math.round(fileMeta.duration)} seconds\nMIME: ${mimeType}\n\nBegin deep audio listening and output the JSON blueprint now:`
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Audio
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: settings.temperature || 0.2,
      }
    };

    onProgress?.('AI sedang mengekstraksi 9 Dimensi Intelegensi Musikal...', 60);

    let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${settings.apiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    // Smart fallback if model is 404 or deprecated
    if (!response.ok && response.status === 404) {
      const fallbackModels = ['gemini-3.8-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'].filter(m => m !== activeModel);
      for (const fallback of fallbackModels) {
        onProgress?.(`Model ${activeModel} tidak tersedia. Mencoba fallback ke ${fallback}...`, 65);
        const retryRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${fallback}:generateContent?key=${settings.apiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        if (retryRes.ok) {
          response = retryRes;
          activeModel = fallback;
          this.saveSettings({ ...settings, modelId: fallback });
          break;
        }
      }
    }

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const msg = errorJson?.error?.message || response.statusText;
      if (response.status === 400) {
        throw new Error(`Format audio atau ukuran request ditolak oleh Gemini: ${msg}`);
      }
      if (response.status === 403) {
        throw new Error(`Autentikasi API Key gagal (403): ${msg}`);
      }
      if (response.status === 404) {
        throw new Error(`Model ${activeModel} tidak tersedia untuk API key ini. Silakan pilih model lain di menu "API & PENGATURAN". Pesan server: ${msg}`);
      }
      if (response.status === 429) {
        throw new Error(`Batas kuota Gemini API tercapai (429 Rate Limit): ${msg}`);
      }
      throw new Error(`Gemini API Error (${response.status}): ${msg}`);
    }

    const resData = await response.json();
    const rawContent = resData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      throw new Error('Tidak ada respon data analisis yang diterima dari Gemini.');
    }

    onProgress?.('Melakukan sintesis internal & validasi output...', 80);

    let parsed: { cover_description?: string; style?: string };
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      // Clean JSON fences if model returned them
      const cleanJson = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    let initialDescription = ValidatorService.normalizeCoverDescription(parsed.cover_description || '');
    const cleanStyle = ValidatorService.normalizeStyleTags(parsed.style || '');

    if (!initialDescription) {
      throw new Error('AI gagal menghasilkan COVER DESCRIPTION yang valid.');
    }
    if (!cleanStyle) {
      throw new Error('AI gagal menghasilkan STYLE tags yang valid.');
    }

    // Programmatic character validation loop
    let finalDescription = initialDescription;
    let charCount = ValidatorService.countCharacters(finalDescription);
    let wasOptimized = false;
    let attempts = 0;
    const MAX_OPTIMIZATION_ATTEMPTS = 3;

    while (charCount > MAX_COVER_DESCRIPTION_CHARS && attempts < MAX_OPTIMIZATION_ATTEMPTS) {
      attempts++;
      onProgress?.(`Memadatkan COVER DESCRIPTION (${charCount} > 1.500 karakter)... Upaya ke-${attempts}`, 85 + (attempts * 4));
      wasOptimized = true;

      finalDescription = await this.optimizeDescription(finalDescription, settings);
      finalDescription = ValidatorService.normalizeCoverDescription(finalDescription);
      charCount = ValidatorService.countCharacters(finalDescription);
    }

    // If still slightly over after multiple passes, strictly trim at the last complete sentence
    if (charCount > MAX_COVER_DESCRIPTION_CHARS) {
      const truncated = finalDescription.slice(0, MAX_COVER_DESCRIPTION_CHARS);
      const lastPeriod = truncated.lastIndexOf('.');
      if (lastPeriod > 800) {
        finalDescription = truncated.slice(0, lastPeriod + 1);
      } else {
        finalDescription = truncated;
      }
      charCount = ValidatorService.countCharacters(finalDescription);
    }

    onProgress?.('Selesai! Menyusun blueprint audio cover...', 100);

    return {
      id: `dna_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      fileName: fileMeta.fileName,
      fileSize: fileMeta.fileSize,
      duration: fileMeta.duration,
      coverDescription: finalDescription,
      style: cleanStyle,
      charCount,
      modelUsed: activeModel,
      wasOptimized
    };
  }

  /**
   * Re-synthesize and compress COVER DESCRIPTION to guarantee <= 1500 chars
   */
  private static async optimizeDescription(text: string, settings: ApiSettings): Promise<string> {
    const targetModel = settings.modelId === 'gemini-2.5-flash' ? 'gemini-3.8-flash' : (settings.modelId || 'gemini-3.8-flash');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${settings.apiKey.trim()}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${SYSTEM_OPTIMIZATION_INSTRUCTION}\n\nORIGINAL COVER DESCRIPTION TO CONDENSE:\n${text}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 500,
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      // If optimization call fails, fallback to smart sentence boundary trim
      return text.slice(0, 1490);
    }

    const data = await res.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return resultText ? resultText.trim() : text.slice(0, 1490);
  }
}
