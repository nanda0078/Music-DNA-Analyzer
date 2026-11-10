import { ApiSettings, AnalysisResult, CustomIntroConfig } from '../types';
import { 
  MAX_COVER_DESCRIPTION_CHARS, 
  SYSTEM_ANALYSIS_INSTRUCTION, 
  SYSTEM_OPTIMIZATION_INSTRUCTION,
  CROWLLM_DEFAULT_BASE_URL
} from '../constants';
import { ValidatorService } from './validatorService';

export class CrowllmService {
  /**
   * Helper to normalize base URL without trailing slash
   */
  private static cleanBaseUrl(url?: string): string {
    const raw = (url && url.trim()) ? url.trim() : CROWLLM_DEFAULT_BASE_URL;
    return raw.replace(/\/+$/, '');
  }

  /**
   * Helper for fetch with timeout
   */
  private static async fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 45000): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Permintaan ke CrowLLM melebihi batas waktu (Timeout ${timeoutMs / 1000} detik).`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Test CrowLLM API connection
   */
  public static async testConnection(
    apiKey: string, 
    baseUrl: string, 
    modelId: string
  ): Promise<{ success: boolean; message: string }> {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, message: 'Kunci CrowLLM API belum diisi.' };
    }
    if (!modelId || !modelId.trim()) {
      return { success: false, message: 'Model ID CrowLLM belum ditentukan.' };
    }

    const cleanUrl = this.cleanBaseUrl(baseUrl);
    const endpoint = `${cleanUrl}/chat/completions`;

    try {
      const payload = {
        model: modelId.trim(),
        messages: [
          { role: 'user', content: 'Respond strictly with the single word "READY".' }
        ],
        max_tokens: 10,
        temperature: 0.1
      };

      const response = await this.fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify(payload)
      }, 45000);

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const errorMsg = errorJson?.error?.message || response.statusText;

        if (response.status === 401) {
          return { success: false, message: 'API Key CrowLLM tidak valid atau tidak memiliki akses (401 Unauthorized).' };
        }
        if (response.status === 402) {
          return { success: false, message: 'Saldo / kuota akun CrowLLM tidak mencukupi (402 Insufficient Balance).' };
        }
        if (response.status === 404) {
          return { success: false, message: `Model "${modelId}" atau endpoint "${cleanUrl}" tidak ditemukan di server CrowLLM (404 Not Found).` };
        }
        if (response.status === 429) {
          return { success: false, message: 'Batas laju pemanggilan (Rate Limit / 429) CrowLLM tercapai. Coba beberapa saat lagi.' };
        }
        if (response.status >= 500) {
          return { success: false, message: `Server CrowLLM mengalami kendala internal (${response.status}): ${errorMsg}` };
        }
        return { success: false, message: `Koneksi CrowLLM gagal (${response.status}): ${errorMsg}` };
      }

      const resData = await response.json();
      const reply = resData?.choices?.[0]?.message?.content || '';
      return {
        success: true,
        message: `Koneksi berhasil! Model "${modelId.trim()}" pada CrowLLM aktif dan siap digunakan.`
      };
    } catch (err: unknown) {
      // If /chat/completions timed out (common for free-tier queued models like crow-limitless:free),
      // verify if API Key and base URL are actually valid via /models endpoint:
      if (err instanceof Error && err.message.includes('Timeout')) {
        try {
          const authCheck = await this.fetchWithTimeout(`${cleanUrl}/models`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey.trim()}` }
          }, 8000);
          if (authCheck.ok) {
            return {
              success: true,
              message: `Kredensial API Key CrowLLM valid dan terhubung! (Catatan: Model "${modelId.trim()}" sedang dalam antrean beban gratis di server CrowLLM, namun akun Anda sudah siap digunakan).`
            };
          }
        } catch {
          // If authCheck also failed, fall through to timeout message
        }
      }
      const message = err instanceof Error ? err.message : 'Gagal menghubungi server CrowLLM.';
      return { success: false, message: `Koneksi CrowLLM gagal: ${message}` };
    }
  }

  /**
   * Fetch available models list from GET /models endpoint
   */
  public static async fetchAvailableModels(apiKey: string, baseUrl: string): Promise<string[]> {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('Kunci CrowLLM API diperlukan untuk memuat daftar model.');
    }

    const cleanUrl = this.cleanBaseUrl(baseUrl);
    const endpoint = `${cleanUrl}/models`;

    const response = await this.fetchWithTimeout(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`
      }
    }, 15000);

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson?.error?.message || response.statusText;
      throw new Error(`Gagal memuat model dari CrowLLM (${response.status}): ${errorMsg}`);
    }

    const json = await response.json();
    if (Array.isArray(json?.data)) {
      const models = json.data
        .map((m: { id?: string }) => m.id)
        .filter((id: unknown): id is string => typeof id === 'string' && Boolean(id.trim()));
      return models.sort();
    }

    return [];
  }

  /**
   * Analyze reference audio to extract Musical DNA using OpenAI-compatible multimodal audio API
   */
  public static async analyzeAudio(
    base64Audio: string,
    mimeType: string,
    fileMeta: { fileName: string; fileSize: number; duration: number },
    onProgress?: (step: string, percentage: number) => void,
    replacementVocal?: string,
    customIntro?: CustomIntroConfig,
    settings?: ApiSettings
  ): Promise<AnalysisResult> {
    if (!settings || !settings.crowllmApiKey || !settings.crowllmApiKey.trim()) {
      throw new Error('Kunci CrowLLM API belum diatur. Silakan buka menu "API & PENGATURAN" untuk memasukkan API Key CrowLLM.');
    }

    const activeModel = (settings.crowllmModelId || 'gpt-4o').trim();
    const cleanUrl = this.cleanBaseUrl(settings.crowllmBaseUrl);
    const endpoint = `${cleanUrl}/chat/completions`;

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

    onProgress?.('Mengirim audio referensi ke CrowLLM API...', 30);

    // Determine audio format for OpenAI input_audio
    const audioFormat = mimeType.toLowerCase().includes('wav') ? 'wav' : 'mp3';

    const systemPrompt = `${SYSTEM_ANALYSIS_INSTRUCTION}${vocalReplacementInstruction}${customIntroInstruction}\n\n[OUTPUT REQUIREMENT]\nRespond strictly with a single JSON object containing exactly two keys: "cover_description" and "style".`;

    const userTextPrompt = `[FILE METADATA]\nFilename: ${fileMeta.fileName}\nDuration: ${Math.round(fileMeta.duration)} seconds\nMIME: ${mimeType}\n\nBegin deep audio listening and output the JSON blueprint now:`;

    const requestPayload = {
      model: activeModel,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userTextPrompt
            },
            {
              type: 'input_audio',
              input_audio: {
                data: base64Audio,
                format: audioFormat
              }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      temperature: settings.temperature || 0.2
    };

    onProgress?.('CrowLLM AI sedang mengekstraksi 9 Dimensi Intelegensi Musikal...', 60);

    let response: Response;
    try {
      response = await this.fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.crowllmApiKey.trim()}`
        },
        body: JSON.stringify(requestPayload)
      }, 120000);
    } catch (netErr: unknown) {
      const msg = netErr instanceof Error ? netErr.message : 'Kesalahan jaringan ke CrowLLM.';
      throw new Error(`Gagal menghubungi server CrowLLM: ${msg}`);
    }

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const msg = errorJson?.error?.message || response.statusText;

      // Handle model limitation (e.g. text-only model rejecting input_audio)
      if (
        response.status === 400 && 
        (msg.toLowerCase().includes('audio') || msg.toLowerCase().includes('input_audio') || msg.toLowerCase().includes('unsupported') || msg.toLowerCase().includes('modality'))
      ) {
        throw new Error(`Model CrowLLM "${activeModel}" tidak mendukung analisis audio multimodal (${msg}). Silakan pilih model yang mendukung input audio atau beralih ke provider Google Gemini.`);
      }

      if (response.status === 401) {
        throw new Error(`Autentikasi CrowLLM gagal (401 Unauthorized): ${msg}`);
      }
      if (response.status === 402) {
        throw new Error(`Saldo akun CrowLLM tidak mencukupi (402 Insufficient Balance): ${msg}`);
      }
      if (response.status === 404) {
        throw new Error(`Model "${activeModel}" tidak ditemukan di CrowLLM: ${msg}`);
      }
      if (response.status === 429) {
        throw new Error(`Batas kuota/rate limit CrowLLM tercapai (429 Too Many Requests): ${msg}`);
      }
      if (response.status >= 500) {
        throw new Error(`Server CrowLLM mengalami gangguan internal (${response.status}): ${msg}`);
      }

      throw new Error(`CrowLLM API Error (${response.status}): ${msg}`);
    }

    const resData = await response.json();
    const rawContent = resData?.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error('Tidak ada respon data analisis yang diterima dari CrowLLM.');
    }

    onProgress?.('Melakukan sintesis internal & validasi output...', 80);

    let parsed: { cover_description?: string; style?: string };
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      const cleanJson = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    let initialDescription = ValidatorService.normalizeCoverDescription(parsed.cover_description || '');
    const cleanStyle = ValidatorService.normalizeStyleTags(parsed.style || '');

    if (!initialDescription) {
      throw new Error('AI CrowLLM gagal menghasilkan COVER DESCRIPTION yang valid.');
    }
    if (!cleanStyle) {
      throw new Error('AI CrowLLM gagal menghasilkan STYLE tags yang valid.');
    }

    // Programmatic character validation loop (<= 1500 chars)
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
      modelUsed: `CrowLLM (${activeModel})`,
      wasOptimized,
      replacementVocal: hasVocalReplacement ? replacementVocal!.trim() : undefined,
      customIntro: isCustomIntroEnabled ? customIntro : undefined,
    };
  }

  /**
   * Re-synthesize and compress COVER DESCRIPTION to guarantee <= 1500 chars using CrowLLM
   */
  public static async optimizeDescription(
    text: string, 
    settings: ApiSettings, 
    replacementVocal?: string,
    customIntro?: CustomIntroConfig
  ): Promise<string> {
    const cleanUrl = this.cleanBaseUrl(settings.crowllmBaseUrl);
    const endpoint = `${cleanUrl}/chat/completions`;
    const model = (settings.crowllmModelId || 'gpt-4o').trim();

    let notes = '';
    if (replacementVocal && replacementVocal.trim()) {
      notes += `\nNote: Ensure the target replacement vocal character ("${replacementVocal.trim()}") remains explicitly intact.`;
    }
    if (customIntro && customIntro.enabled) {
      notes += `\nNote: Ensure the custom intro arrangement elements (${customIntro.atmosphere}, ${customIntro.instruments.slice(0, 3).join(', ')}) and its smooth transition into the original song are preserved.`;
    }

    const payload = {
      model,
      messages: [
        {
          role: 'system',
          content: `${SYSTEM_OPTIMIZATION_INSTRUCTION}${notes}`
        },
        {
          role: 'user',
          content: `ORIGINAL COVER DESCRIPTION TO CONDENSE:\n${text}`
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    };

    try {
      const res = await this.fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.crowllmApiKey.trim()}`
        },
        body: JSON.stringify(payload)
      }, 30000);

      if (res.ok) {
        const data = await res.json();
        const resultText = data?.choices?.[0]?.message?.content;
        if (resultText && resultText.trim()) {
          return resultText.trim();
        }
      }
    } catch (e) {
      console.warn('CrowLLM optimization pass failed:', e);
    }

    // Fallback to sentence boundary trim
    return text.slice(0, 1490);
  }
}
