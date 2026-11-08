import { MAX_COVER_DESCRIPTION_CHARS } from '../constants';

export interface ValidationReport {
  isValid: boolean;
  charCount: number;
  maxChars: number;
  hasProhibitedElements: boolean;
  violations: string[];
}

export class ValidatorService {
  /**
   * Calculate exact character count
   */
  public static countCharacters(text: string): number {
    if (!text) return 0;
    return text.length;
  }

  /**
   * Validate COVER DESCRIPTION
   */
  public static validateCoverDescription(text: string): ValidationReport {
    const charCount = this.countCharacters(text);
    const violations: string[] = [];

    if (charCount > MAX_COVER_DESCRIPTION_CHARS) {
      violations.push(`Deskripsi melebihi batas 1.500 karakter (${charCount} karakter).`);
    }

    if (charCount < 80) {
      violations.push('Deskripsi terlalu pendek untuk mencakup 5 pilar identitas musikal.');
    }

    // Check for prohibited bullet points or headers
    if (/^(\s*[-*•\d+.]\s+|\s*#{1,6}\s+)/m.test(text)) {
      violations.push('Format harus satu paragraf utuh tanpa bullet point atau heading.');
    }

    // Check for lyrics indicators
    if (/\b(verse \d|chorus|lyrics?:\s*|verse:\s*|outro:\s*)/i.test(text) && text.includes('"')) {
      // Possible lyric transcription detected
      violations.push('Terdeteksi kemungkinan transkripsi lirik. Harap fokus pada atribut musikal.');
    }

    return {
      isValid: violations.length === 0,
      charCount,
      maxChars: MAX_COVER_DESCRIPTION_CHARS,
      hasProhibitedElements: violations.length > 0,
      violations
    };
  }

  /**
   * Clean and normalize COVER DESCRIPTION text
   * Ensure it is a single cohesive paragraph without line breaks or markdown asterisks
   */
  public static normalizeCoverDescription(text: string): string {
    if (!text) return '';
    return text
      .trim()
      .replace(/\r\n/g, ' ')
      .replace(/[\n\r]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^["'`]|["'`]$/g, '') // remove wrapping quotes
      .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold asterisks if model added them
      .trim();
  }

  /**
   * Clean and normalize STYLE tags
   * Ensure comma-separated, distinct, well-trimmed tags
   */
  public static normalizeStyleTags(styleText: string): string {
    if (!styleText) return '';
    
    // Split by comma or semicolon
    const tags = styleText
      .split(/[,;]/)
      .map(tag => tag.trim().replace(/^["'`]|["'`]$/g, '').replace(/^[#]/, ''))
      .filter(tag => tag.length > 1);

    // Remove duplicates case-insensitively
    const seen = new Set<string>();
    const uniqueTags: string[] = [];

    for (const tag of tags) {
      const lower = tag.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueTags.push(tag);
      }
    }

    return uniqueTags.join(', ');
  }
}
