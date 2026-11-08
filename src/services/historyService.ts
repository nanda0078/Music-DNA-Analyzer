import { AnalysisResult } from '../types';

const STORAGE_KEY = 'music_dna_analyzer_history_v1';
const MAX_HISTORY_ITEMS = 50;

export class HistoryService {
  /**
   * Get all history items sorted newest first
   */
  public static getHistory(): AnalysisResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
      return [];
    }
  }

  /**
   * Save a new analysis result
   */
  public static saveResult(result: AnalysisResult): void {
    try {
      const history = this.getHistory();
      // Remove any duplicate with same ID
      const filtered = history.filter(item => item.id !== result.id);
      filtered.unshift(result);
      if (filtered.length > MAX_HISTORY_ITEMS) {
        filtered.splice(MAX_HISTORY_ITEMS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to save result to localStorage', e);
    }
  }

  /**
   * Delete an item by ID
   */
  public static deleteItem(id: string): void {
    try {
      const history = this.getHistory();
      const updated = history.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete item', e);
    }
  }

  /**
   * Clear all history
   */
  public static clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  }

  /**
   * Export an individual analysis result as a formatted .TXT file
   */
  public static exportToTxt(item: AnalysisResult): void {
    const dateStr = new Date(item.timestamp).toLocaleString('id-ID', {
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    const content = `===============================================================
MUSIC DNA ANALYZER — AI MUSIC PROMPT BLUEPRINT
===============================================================
Audio Reference : ${item.fileName}
Tanggal Analisis : ${dateStr}
AI Engine        : ${item.modelUsed}
Vocal Character  : ${item.replacementVocal ? `Replacement (${item.replacementVocal})` : 'Original Vocal Preserved'}
Custom Intro     : ${item.customIntro?.enabled ? `ON (${item.customIntro.atmosphere} | ${item.customIntro.instruments.join(', ') || 'Enriched'})` : 'OFF (Original Intro Preserved)'}
Panjang Karakter : ${item.charCount} / 1.500 Karakter
Status Optimasi  : ${item.wasOptimized ? 'Teroptimasi Otomatis (<= 1.500)' : 'Lolos Validasi Langsung'}
===============================================================

01. COVER DESCRIPTION
---------------------------------------------------------------
${item.coverDescription}

---------------------------------------------------------------
02. STYLE
---------------------------------------------------------------
${item.style}

===============================================================
Dihasilkan oleh MUSIC DNA ANALYZER (Suno v3.5/v4 & Udio Ready)
===============================================================
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const cleanName = item.fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    link.href = url;
    link.download = `MUSIC_DNA_${cleanName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
