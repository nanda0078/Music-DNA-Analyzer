import assert from 'assert';
import { ValidatorService } from './src/services/validatorService.ts';
import { AudioProcessor } from './src/services/audioProcessor.ts';
import { MAX_COVER_DESCRIPTION_CHARS, SYSTEM_ANALYSIS_INSTRUCTION, SYSTEM_OPTIMIZATION_INSTRUCTION } from './src/constants.ts';

console.log('--- RUNNING MUSIC DNA ANALYZER QA SUITE ---');

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
assert(!SYSTEM_ANALYSIS_INSTRUCTION.includes('Musical DNA Report'), 'Must not include extraneous report requests');
console.log('✓ System prompts comply 100% with Master Development Blueprint.');

console.log('\n=========================================');
console.log('ALL QA SUITE UNIT TESTS PASSED (5/5)!');
console.log('=========================================');
