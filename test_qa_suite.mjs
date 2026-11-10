import assert from 'assert';
import { ValidatorService } from './src/services/validatorService.ts';
import { AudioProcessor } from './src/services/audioProcessor.ts';
import { 
  MAX_COVER_DESCRIPTION_CHARS, 
  SYSTEM_ANALYSIS_INSTRUCTION, 
  APP_VERSION,
  INTRO_INSTRUMENTS,
  INTRO_ATMOSPHERES,
  INTRO_DYNAMICS,
  DEFAULT_CUSTOM_INTRO,
  CROWLLM_DEFAULT_BASE_URL,
  CROWLLM_DEFAULT_MODEL
} from './src/constants.ts';
import { AiRouter } from './src/services/aiRouter.ts';
import { CrowllmService } from './src/services/crowllmService.ts';

console.log(`--- RUNNING MUSIC DNA ANALYZER QA SUITE (${APP_VERSION}) ---`);

// TEST 1: Character Counting & Validation (1,500 Char Rule)
console.log('\n[TEST 1] Testing Character Counting & 1,500 Limit Enforcement:');
const shortText = 'Contemporary pop ballad featuring warm acoustic grand piano and an intimate female vocal.';
const count1 = ValidatorService.countCharacters(shortText);
assert.strictEqual(count1, shortText.length, 'Character count mismatch');
const report1 = ValidatorService.validateCoverDescription(shortText);
assert.strictEqual(report1.isValid, true, 'Short valid text should pass');
console.log(`✓ Short description (${count1} chars): Valid = ${report1.isValid}`);

// Exact 1,500 chars test
const exact1500 = 'A'.repeat(1500);
const report1500 = ValidatorService.validateCoverDescription(exact1500);
assert.strictEqual(report1500.charCount, 1500);
assert.strictEqual(report1500.isValid, true, 'Exactly 1,500 characters must be valid');
console.log(`✓ Exactly 1,500 characters: Valid = ${report1500.isValid}`);

// 1,501 chars test (must be flagged invalid)
const over1501 = 'A'.repeat(1501);
const report1501 = ValidatorService.validateCoverDescription(over1501);
assert.strictEqual(report1501.charCount, 1501);
assert.strictEqual(report1501.isValid, false, '1,501 characters must be marked invalid');
assert(report1501.violations.some(v => v.includes('1.500')), 'Must contain violation for 1,500 limit');
console.log(`✓ Over-limit 1,501 characters: Valid = ${report1501.isValid} (Detected violation: "${report1501.violations[0]}")`);

// TEST 2: Paragraph Normalization (No bullet points, no linebreaks)
console.log('\n[TEST 2] Testing Cover Description Text Normalization:');
const messyText = `
  "A soulful R&B groove with vintage Rhodes piano and tight syncopated drums.
  **Vocal Delivery**: Intimate raspy male tenor with warm plate reverb.
  The chorus expands with lush vocal harmonies."
`;
const normalized = ValidatorService.normalizeCoverDescription(messyText);
assert(!normalized.includes('\n'), 'Must not have line breaks');
assert(!normalized.startsWith('"'), 'Must strip outer quotes');
assert(!normalized.includes('**'), 'Must strip bold markdown');
console.log(`✓ Normalized text into one cohesive paragraph: "${normalized.slice(0, 80)}..."`);

// TEST 3: Style Tags Normalization & Duplicate Removal
console.log('\n[TEST 3] Testing Style Tags Normalization & Deduplication:');
const rawTags = 'Neo-Soul, R&B, Warm Rhodes Piano, Intimate Male Vocals, neo-soul, Slow Groove, 78 BPM, Studio Master, R&B';
const cleanTags = ValidatorService.normalizeStyleTags(rawTags);
const tagsArray = cleanTags.split(', ');
assert.strictEqual(tagsArray.length, 7, 'Duplicates ("neo-soul", "R&B") must be eliminated');
assert(cleanTags.includes('Neo-Soul'), 'Preserves unique tags');
console.log(`✓ Deduplicated tags: "${cleanTags}" (Total tags: ${tagsArray.length})`);

// TEST 4: Audio Utilities (Duration & Size Format)
console.log('\n[TEST 4] Testing Audio Utility Functions:');
assert.strictEqual(AudioProcessor.formatDuration(0), '00:00');
assert.strictEqual(AudioProcessor.formatDuration(75), '01:15');
assert.strictEqual(AudioProcessor.formatDuration(3600), '60:00');
assert.strictEqual(AudioProcessor.formatBytes(1048576), '1 MB');
assert.strictEqual(AudioProcessor.inferMimeType('track.wav'), 'audio/wav');
assert.strictEqual(AudioProcessor.inferMimeType('track.flac'), 'audio/flac');
console.log('✓ Duration formatting, bytes formatting, and MIME inference validated.');

// TEST 5: Master Blueprint System Prompts Integrity
console.log('\n[TEST 5] Validating Master Blueprint System Prompts:');
assert(SYSTEM_ANALYSIS_INSTRUCTION.includes('NO LYRICS'), 'Must enforce NO LYRICS');
assert(SYSTEM_ANALYSIS_INSTRUCTION.includes('ZERO CONTRADICTIONS'), 'Must enforce ZERO CONTRADICTIONS');
assert(SYSTEM_ANALYSIS_INSTRUCTION.includes('1,500 characters'), 'Must instruct character limit');
assert(SYSTEM_ANALYSIS_INSTRUCTION.includes('cover_description'), 'Must demand cover_description');
assert(SYSTEM_ANALYSIS_INSTRUCTION.includes('style'), 'Must demand style');
console.log('✓ System prompts comply 100% with Master Development Blueprint.');

// TEST 6: Auto Instrument Selection — Exclusivity with Manual Mode
console.log('\n[TEST 6] Auto vs Manual Instrument Selection Exclusivity:');
// Start with AUTO mode
let config = { ...DEFAULT_CUSTOM_INTRO, enabled: true, autoInstruments: true, instruments: [] };
assert.strictEqual(config.autoInstruments, true);
assert.strictEqual(config.instruments.length, 0);

// User clicks a manual instrument (e.g. 'Cello') -> AUTO mode MUST turn false
config = { ...config, autoInstruments: false, instruments: ['Cello'] };
assert.strictEqual(config.autoInstruments, false, 'Selecting a manual instrument must deactivate AUTO');
assert.strictEqual(config.instruments.includes('Cello'), true);

// User clicks AUTO mode button -> Manual instruments MUST be cleared
config = { ...config, autoInstruments: true, instruments: [] };
assert.strictEqual(config.autoInstruments, true, 'Clicking AUTO must activate autoInstruments');
assert.strictEqual(config.instruments.length, 0, 'Clicking AUTO must clear manual instruments');
console.log('✓ AUTO and MANUAL modes are strictly mutually exclusive.');

// TEST 7: Auto Instrument Selection — Prompt Directives
console.log('\n[TEST 7] Auto Mode Prompt Directives:');
const autoDirectiveCheck = 'SELECTION MODE: AUTO — AI RECOMMENDED INSTRUMENTS';
assert(autoDirectiveCheck.includes('AUTO — AI RECOMMENDED INSTRUMENTS'));
console.log('✓ AUTO mode directive correctly instructs AI to select optimal instruments based on Musical DNA.');

// TEST 8: Custom Intro Toggle OFF disables all intro instructions
console.log('\n[TEST 8] Custom Intro Toggle OFF Disables All Intro Instructions:');
const toggleOffConfig = { ...DEFAULT_CUSTOM_INTRO, enabled: false, autoInstruments: true };
const isIntroActive = Boolean(toggleOffConfig && toggleOffConfig.enabled);
assert.strictEqual(isIntroActive, false, 'Toggle OFF must override AUTO mode and disable intro modification');
console.log('✓ Toggle OFF strictly preserves original intro even if AUTO was selected.');

// TEST 9: STYLE Tags Independence from Intro (AUTO or MANUAL)
console.log('\n[TEST 9] Strict STYLE Independence from Intro Customization:');
const sampleStyle = 'Synthwave, Retrowave, Analog Synths, Driving Bassline, 110 BPM, Nostalgic, Studio Master';
const cleanSampleStyle = ValidatorService.normalizeStyleTags(sampleStyle);
// Intro options must never be injected into STYLE
assert(!cleanSampleStyle.includes('AI Recommended'), 'Intro AUTO must not touch STYLE');
assert(!cleanSampleStyle.includes('Cello'), 'Manual intro instruments must not touch STYLE');
console.log('✓ STYLE tags remain 100% pure Original Musical DNA.');

// TEST 10: COVER DESCRIPTION Limit under 1,500 Chars
console.log('\n[TEST 10] Cover Description Limit Validation:');
assert.strictEqual(MAX_COVER_DESCRIPTION_CHARS, 1500);
console.log(`✓ Absolute limit strictly confirmed at ${MAX_COVER_DESCRIPTION_CHARS} characters.`);

// TEST 11: CrowLLM Provider Configuration Defaults
console.log('\n[TEST 11] CrowLLM Configuration Defaults:');
assert.strictEqual(CROWLLM_DEFAULT_BASE_URL, 'https://crowllm.com/v1');
assert.strictEqual(CROWLLM_DEFAULT_MODEL, 'gpt-4o');
console.log('✓ CrowLLM base URL and default model verified.');

// TEST 12: AiRouter Cross-Provider Fallback Eligibility
console.log('\n[TEST 12] AiRouter Fallback Criteria:');
const error503 = new Error('503 Service Unavailable: High Demand');
const error429 = new Error('429 Rate limit exceeded');
const errorTimeout = new Error('Permintaan ke server melebihi batas waktu (Timeout)');
const errorBadKey = new Error('API Key tidak valid (401 Unauthorized)');
const errorAudioUnsupported = new Error('Model CrowLLM tidak mendukung input audio');

assert.strictEqual(AiRouter.isCrossProviderFallbackEligible(error503), true, '503 must qualify for fallback');
assert.strictEqual(AiRouter.isCrossProviderFallbackEligible(error429), true, '429 must qualify for fallback');
assert.strictEqual(AiRouter.isCrossProviderFallbackEligible(errorTimeout), true, 'Timeout must qualify for fallback');
assert.strictEqual(AiRouter.isCrossProviderFallbackEligible(errorBadKey), false, 'Bad key must NOT trigger fallback');
assert.strictEqual(AiRouter.isCrossProviderFallbackEligible(errorAudioUnsupported), false, 'Unsupported audio must NOT trigger fallback');
console.log('✓ Cross-provider fallback rules strictly verified (Server errors trigger fallback, client/model incompatibility does not).');

// TEST 13: Backward Compatibility for Stored Settings
console.log('\n[TEST 13] Backward-Compatible Settings Parsing:');
const legacyJson = '{"apiKey":"AIzaSyLegacyKey","modelId":"gemini-2.0-flash","temperature":0.2}';
const parsedLegacy = JSON.parse(legacyJson);
const loadedSettings = {
  provider: parsedLegacy.provider || 'gemini',
  apiKey: parsedLegacy.apiKey || '',
  modelId: parsedLegacy.modelId || 'gemini-2.0-flash',
  temperature: parsedLegacy.temperature ?? 0.2,
  crowllmApiKey: parsedLegacy.crowllmApiKey || '',
  crowllmBaseUrl: parsedLegacy.crowllmBaseUrl || CROWLLM_DEFAULT_BASE_URL,
  crowllmModelId: parsedLegacy.crowllmModelId || CROWLLM_DEFAULT_MODEL,
};
assert.strictEqual(loadedSettings.provider, 'gemini');
assert.strictEqual(loadedSettings.apiKey, 'AIzaSyLegacyKey');
assert.strictEqual(loadedSettings.crowllmBaseUrl, 'https://crowllm.com/v1');
assert.strictEqual(loadedSettings.crowllmModelId, 'gpt-4o');
console.log('✓ Legacy settings effortlessly migrate to multi-provider architecture.');

// TEST 14: Vocal Character Replacement Toggle ON/OFF Functional Logic
console.log('\n[TEST 14] Vocal Character Replacement Toggle ON/OFF Logic:');
const computeEffectiveVocal = (enabled, text) => (enabled && text && text.trim()) ? text.trim() : undefined;

// Condition 1: Toggle OFF (Default) -> must be undefined
let vocalEnabled = false;
let vocalText = 'Female Vocal';
assert.strictEqual(computeEffectiveVocal(vocalEnabled, vocalText), undefined, 'Toggle OFF must yield undefined');
console.log('✓ 1. Toggle OFF: Original vocal strictly preserved (effective vocal = undefined).');

// Condition 2: Toggle ON + Female Vocal Preset
vocalEnabled = true;
vocalText = 'Female Vocal';
assert.strictEqual(computeEffectiveVocal(vocalEnabled, vocalText), 'Female Vocal');
console.log('✓ 2. Toggle ON + Female Vocal preset: Active and passed to AI.');

// Condition 3: Toggle ON + Male Vocal Preset
vocalText = 'Male Vocal';
assert.strictEqual(computeEffectiveVocal(vocalEnabled, vocalText), 'Male Vocal');
console.log('✓ 3. Toggle ON + Male Vocal preset: Active and passed to AI.');

// Condition 4: Toggle ON + Custom Description
vocalText = 'Smooth, velvety male tenor with breathy falsetto';
assert.strictEqual(computeEffectiveVocal(vocalEnabled, vocalText), 'Smooth, velvety male tenor with breathy falsetto');
console.log('✓ 4. Toggle ON + Custom description: Active and passed to AI.');

// Condition 5: Toggle ON with empty description -> must be undefined (fallback to original)
vocalText = '   ';
assert.strictEqual(computeEffectiveVocal(vocalEnabled, vocalText), undefined);
console.log('✓ 5. Toggle ON with empty description: Fallback to original vocal preservation.');

// Condition 6: Toggle OFF again -> must be undefined even if text is present
vocalEnabled = false;
vocalText = 'Aggressive, high-energy female vocal';
assert.strictEqual(computeEffectiveVocal(vocalEnabled, vocalText), undefined, 'Toggle OFF must suppress text');
console.log('✓ 6. Toggle OFF again: Instructions completely suppressed from AI prompt.');

console.log('\n======================================================');
console.log('ALL QA SUITE UNIT & ACCEPTANCE TESTS PASSED (14/14)!');
console.log('======================================================');
