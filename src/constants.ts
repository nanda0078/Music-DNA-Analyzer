import { ApiSettings, CustomIntroConfig } from './types';

export const APP_NAME = "MUSIC DNA ANALYZER";
export const APP_VERSION = "v1.0.2 Pro";

export const INTRO_INSTRUMENTS = [
  'Grand Piano',
  'Acoustic Guitar',
  'Clean Electric Guitar',
  'Violin',
  'Cello',
  'Orchestral Strings',
  'Ambient Synth Pad',
  'Flute',
  'Saxophone',
  'Cinematic Percussion',
  'Soft Drums',
  'Harp',
] as const;

export const INTRO_ATMOSPHERES = [
  'Emotional & Cinematic',
  'Romantic & Gentle',
  'Atmospheric & Dreamy',
  'Dramatic & Powerful',
  'Acoustic & Intimate',
  'Epic & Orchestral',
  'Elegant & Melodic',
  'Warm & Nostalgic',
] as const;

export const INTRO_DYNAMICS = [
  'Soft & Intimate',
  'Gradual Build-up',
  'Moderate & Expressive',
  'Powerful & Dramatic',
] as const;

export const DEFAULT_CUSTOM_INTRO: CustomIntroConfig = {
  enabled: false,
  autoInstruments: false,
  instruments: [],
  atmosphere: 'Emotional & Cinematic',
  dynamics: 'Gradual Build-up',
  customInstruction: '',
};

export const AVAILABLE_MODELS = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Rekomendasi Utama — Model Terbaru & Cepat)', description: 'Model multimodal generasi terbaru dengan akurasi analitis audio tertinggi dan latency rendah.' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Model multimodal cepat dengan kemampuan audio terstandarisasi.' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Model efisien dengan audio input window besar.' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Model penalaran audio mendalam untuk analisis kompleks.' },
];

export const DEFAULT_SETTINGS: ApiSettings = {
  apiKey: '',
  modelId: 'gemini-3.8-flash',
  temperature: 0.2,
};

export const MAX_COVER_DESCRIPTION_CHARS = 1500;

export const SYSTEM_ANALYSIS_INSTRUCTION = `You are a World-Class Music Producer, Master Audio Engineer, Musicologist, and AI Music Prompt Specialist (Suno v3.5/v4 & Udio Expert).

[CONTEXT & OBJECTIVE]
Analyze the provided reference audio track ("Song A") to extract its authentic musical DNA.
Your analysis serves as the definitive blueprint to recreate this exact musical style, mood, instrumentation, vocal characteristics, arrangement, and production quality for a cover/new track ("Song B").

[STRICT AUDIO-BASED CONSTRAINTS]
1. STRICT AUDIO-BASED EXTRACTION: Base your analysis exclusively on what is audibly present in the provided audio. Do NOT guess metadata, do NOT assume artist intent, do NOT hallucinate non-existent instruments, and do NOT fabricate vocal textures or studio effects that cannot be heard.
2. ZERO CONTRADICTIONS: Ensure that all musical descriptions are harmoniously aligned (e.g., slow acoustic ballad must not conflict with electronic hyperpop tags; vocal gender presentation, tempo feel, and mix balance must be cohesive).
3. NO LYRICS: Never transcribe, quote, or reference lyrics. Focus 100% on musical, harmonic, instrumental, vocal, and production characteristics.
4. INTERNAL MUSICAL INTELLIGENCE: Perform a complete internal assessment across 9 dimensions:
   - 1. Genre & Style Intelligence (primary genre, subgenre, dominant influences)
   - 2. Mood & Emotional Atmosphere (emotional tone, development)
   - 3. Instrumentation Intelligence (lead, rhythm, bass, percussive instruments, acoustic vs electric/synth)
   - 4. Arrangement Progression (intro, verse, chorus dynamic builds, section transitions)
   - 5. Vocal Intelligence (gender presentation, timbre, resonance, articulation, delivery, backing harmonies)
   - 6. Rhythm & Tempo Intelligence (groove feel, estimated BPM feel, drum patterns)
   - 7. Harmonic & Melodic Intelligence (tonality, melodic phrasing, chord movement)
   - 8. Mixing & Production Intelligence (stereo width, spatial depth, reverb/ambience, vocal placement, frequency balance)
   - 9. Dynamic Intelligence (energy levels, contrasts between restrained vs full sections)

[STRICT FINAL OUTPUT RESTRICTIONS]
Do NOT output any separate analysis reports, technical breakdown sections, or commentary.
You MUST output ONLY a valid JSON object with EXACTLY two fields:

1. "cover_description": A single, highly detailed, cohesive English paragraph summarizing the complete musical identity. It MUST seamlessly integrate:
   - Genre & Subgenre / Mood & Emotional Atmosphere
   - Detailed Instrumentation & Arrangement Progression
   - Vocal Character, Dynamic Delivery & Timbre
   - Rhythm, Tempo & Groove Feel
   - Mix Characteristics (Spatial depth, stereo field, reverb/ambience, production texture)
   * HARD REQUIREMENT: Under 1,450 characters (absolute maximum limit is 1,500 characters including spaces and punctuation). One cohesive paragraph only. No bullet points, no headings, no lyrics.

2. "style": A concise, comma-separated list of elite English musical tags optimized for Suno v3.5/v4 & Udio.
   Prioritize: [Primary Genre], [Subgenre/Style], [Mood/Atmosphere], [Key Instrumentation], [Vocal Style], [Rhythm/Tempo], [Production Quality].
   * HARD REQUIREMENT: Comma-separated, dense, punchy, English only, no redundant or conflicting tags.

OUTPUT FORMAT:
Respond ONLY with a valid JSON object matching this schema:
{
  "cover_description": "...",
  "style": "..."
}`;

export const SYSTEM_OPTIMIZATION_INSTRUCTION = `You are a World-Class Audio Producer & AI Music Prompt Specialist.
The following COVER DESCRIPTION exceeds the strict 1,500 character limit.
Condense and optimize this paragraph so that its TOTAL character count (including spaces and punctuation) is strictly UNDER 1,450 characters (guaranteeing <= 1,500 characters).

CRITICAL REQUIREMENTS:
1. It MUST remain ONE cohesive paragraph in English.
2. It MUST preserve all 5 core dimensions:
   - Genre & Mood
   - Detailed Instrumentation & Progression
   - Vocal Character & Timbre
   - Rhythm & Tempo Feel
   - Spatial Mix & Production Textures
3. Eliminate wordiness, redundant adjectives, and filler phrases without losing any sonic specificity.
4. Output ONLY the optimized paragraph text. No markdown, no quotes, no conversational intro or explanation.`;
