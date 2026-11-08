import { ApiSettings, AnalysisResult, CustomIntroConfig } from '../types';
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
   * Supports optional VOCAL CHARACTER REPLACEMENT and CUSTOM INTRO ARRANGEMENT (affects COVER DESCRIPTION only)
   */
  public static async analyzeAudio(
    base64Audio: string,
    mimeType: string,
    fileMeta: { fileName: string; fileSize: number; duration: number },
    onProgress?: (step: string, percentage: number) => void,
    replacementVocal?: string,
    customIntro?: CustomIntroConfig
  ): Promise<AnalysisResult> {
    const settings = this.getStoredSettings();
    if (!settings.apiKey) {
      throw new Error('Kunci Gemini API belum diatur. Silakan buka menu "API & PENGATURAN" untuk memasukkan API Key Anda.');
    }

    let activeModel = settings.modelId || 'gemini-3.8-flash';
    if (activeModel === 'gemini-2.5-flash') {
      activeModel = 'gemini-3.8-flash';
    }

    // 1. Vocal Replacement Instruction
    const hasVocalReplacement = Boolean(replacementVocal && replacementVocal.trim());
    const vocalReplacementInstruction = hasVocalReplacement
      ? `\n\n[MANDATORY FEATURE — VOCAL CHARACTER REPLACEMENT]\nThe user has explicitly requested a VOCAL CHARACTER REPLACEMENT for the cover track (Song B):\nTARGET REPLACEMENT VOCAL: "${replacementVocal!.trim()}"\n\nSTRICT CONDITIONAL EXECUTION RULES:\n1. IN "cover_description": Replace the original singer's vocal character, vocal timbre, gender presentation, and vocal delivery with this TARGET VOCAL CHARACTER ("${replacementVocal!.trim()}"). Seamlessly integrate this replacement vocal into the single cohesive cover description paragraph. DO NOT alter the original song's melody, lyrics, language, rhythm, tempo, instrumentation, chord progressions, arrangement builds, mood, or mix textures — ONLY replace the vocal character.\n2. IN "style": ABSOLUTELY DO NOT MODIFY STYLE TAGS BASED ON THIS VOCAL REPLACEMENT. "style" MUST REMAIN 100% FAITHFUL TO THE ORIGINAL REFERENCE AUDIO'S MUSICAL DNA (original genre, original mood, original instrumentation, original tempo, original mix quality). STYLE MUST REMAIN STRICTLY INDEPENDENT FROM VOCAL CHARACTER REPLACEMENT.`
      : `\n\n[VOCAL CHARACTER HANDLING]\nNo replacement vocal character specified. Preserve and describe the original singer's vocal character exactly as detected in the audio.`;

    // 2. Custom Intro Arrangement Instruction (Toggle ON/OFF)
    const isCustomIntroEnabled = Boolean(customIntro && customIntro.enabled);
    let customIntroInstruction = `\n\n[INTRO ARRANGEMENT HANDLING]\nCustom Intro Arrangement is DISABLED (OFF). Preserve and describe the original intro structure and instrumentation exactly as audibly present in the reference audio.`;

    if (isCustomIntroEnabled && customIntro) {
      const isAutoMode = Boolean(customIntro.autoInstruments);
      const instrumentDirective = isAutoMode
        ? `[SELECTION MODE: AUTO — AI RECOMMENDED INSTRUMENTS]\n- Analyze the reference audio's authentic Musical DNA (genre, emotional mood, tempo, groove feel, harmonic movement, and frequency spectrum).\n- Automatically determine and select the ideal, most musical combination of additional intro instruments (from rich acoustic, orchestral, synth pad, or percussive textures) that harmoniously complements the song's unique identity.\n- Avoid clashing, crowded, or generic choices. State and weave these AI-selected instruments naturally into the intro arrangement.`
        : `[SELECTION MODE: MANUAL INSTRUMENTS]\n- Target User-Selected Intro Instruments: ${customIntro.instruments && customIntro.instruments.length > 0 ? customIntro.instruments.join(', ') : 'Grand Piano, Acoustic Guitar'}\n- Strictly adhere to these user-selected instruments for the intro arrangement. Do not add random outside instruments.`;

      const customNotes = customIntro.customInstruction?.trim()
        ? ` Additional custom intro instruction: "${customIntro.customInstruction.trim()}".`
        : '';

      customIntroInstruction = `\n\n[MANDATORY FEATURE — CUSTOM INTRO ARRANGEMENT (TOGGLE IS ON)]\nThe user has activated a custom, creative, and musically richer intro arrangement for the cover track (Song B):\n${instrumentDirective}\n- Intro Atmosphere: ${customIntro.atmosphere}\n- Intro Dynamics: ${customIntro.dynamics}${customNotes}\n\nSTRICT CONDITIONAL EXECUTION RULES FOR CUSTOM INTRO:\n1. IN "cover_description": Design a musically richer, more captivating, and emotionally elevated instrumental intro arrangement that opens the song before the first verse. ${isAutoMode ? 'Introduce the AI-recommended instrument combination' : `Seamlessly weave the chosen instruments (${customIntro.instruments.join(', ') || 'chosen instruments'})`} into an atmosphere of "${customIntro.atmosphere}" with a dynamic curve of "${customIntro.dynamics}". Formulate a smooth, natural musical transition leading seamlessly from this creative intro directly into the song's original first verse.\n2. STRICT ORIGINAL SONG PRESERVATION: This customization applies EXCLUSIVELY to the INTRO section. After the creative intro finishes, the song MUST return 100% faithfully to the original composition: preserve the original melody, original lyrics and language, original tempo and groove, original chord progressions, original genre identity, and original arrangements of Verse, Chorus, Bridge, Interlude, and Outro. DO NOT rearrange or alter any other section of the song!\n3. IN "style": ABSOLUTELY DO NOT MODIFY STYLE TAGS BASED ON THE CUSTOM INTRO ARRANGEMENT (WHETHER AUTO OR MANUAL). "style" MUST REMAIN 100% FAITHFUL TO THE ORIGINAL REFERENCE AUDIO'S MUSICAL DNA. DO NOT add or alter tags based on the custom intro instruments or atmosphere. STYLE MUST REMAIN STRICTLY INDEPENDENT!`;
    }

    onProgress?.('Mengirim audio referensi ke Gemini AI...', 30);

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${SYSTEM_ANALYSIS_INSTRUCTION}${vocalReplacementInstruction}${customIntroInstruction}\n\n[FILE METADATA]\nFilename: ${fileMeta.fileName}\nDuration: ${Math.round(fileMeta.duration)} seconds\nMIME: ${mimeType}\n\nBegin deep audio listening and output the JSON blueprint now:`
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

      finalDescription = await this.optimizeDescription(finalDescription, settings, replacementVocal, customIntro);
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
      wasOptimized,
      replacementVocal: hasVocalReplacement ? replacementVocal!.trim() : undefined,
      customIntro: isCustomIntroEnabled ? customIntro : undefined,
    };
  }

  /**
   * Re-synthesize and compress COVER DESCRIPTION to guarantee <= 1500 chars
   */
  private static async optimizeDescription(
    text: string, 
    settings: ApiSettings, 
    replacementVocal?: string,
    customIntro?: CustomIntroConfig
  ): Promise<string> {
    const targetModel = settings.modelId === 'gemini-2.5-flash' ? 'gemini-3.8-flash' : (settings.modelId || 'gemini-3.8-flash');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${settings.apiKey.trim()}`;
    let notes = '';
    if (replacementVocal && replacementVocal.trim()) {
      notes += `\nNote: Ensure the target replacement vocal character ("${replacementVocal.trim()}") remains explicitly intact.`;
    }
    if (customIntro && customIntro.enabled) {
      notes += `\nNote: Ensure the custom intro arrangement elements (${customIntro.atmosphere}, ${customIntro.instruments.slice(0, 3).join(', ')}) and its smooth transition into the original song are preserved.`;
    }

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${SYSTEM_OPTIMIZATION_INSTRUCTION}${notes}\n\nORIGINAL COVER DESCRIPTION TO CONDENSE:\n${text}`
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
