import assert from 'node:assert/strict';
import {
  collectMatches,
  countCaptureGroups,
  createRegex,
  createShareUrl,
  escapeHtml,
  formatRegexLiteral,
  getPresetLibrary,
  normalizeFlags,
  parseShareState,
  replaceMatches
} from '../src/regex-engine.js';

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

test('escapes unsafe HTML characters', () => {
  assert.equal(
    escapeHtml('<script>alert("x")</script> & text'),
    '&lt;script&gt;alert("x")&lt;/script&gt; &amp; text'
  );
});

test('removes duplicate and unsupported flags', () => {
  assert.equal(normalizeFlags('ggiix'), 'gi');
});

test('rejects u and v together', () => {
  assert.throws(() => normalizeFlags('uv'), SyntaxError);
});

test('creates a working RegExp', () => {
  const regex = createRegex('afx', 'gi');
  assert.equal(regex.global, true);
  assert.equal(regex.ignoreCase, true);
  assert.equal(regex.test('AFX'), true);
});

test('forceGlobal adds g when needed', () => {
  const regex = createRegex('a', 'i', { forceGlobal: true });
  assert.equal(regex.flags.includes('g'), true);
});

test('collects global matches', () => {
  const matches = collectMatches(/a/g, 'banana');
  assert.equal(matches.length, 3);
  assert.deepEqual(matches.map(match => match.index), [1, 3, 5]);
});

test('collects a single match for non-global regex', () => {
  const matches = collectMatches(/a/, 'banana');
  assert.equal(matches.length, 1);
  assert.equal(matches[0].index, 1);
});

test('handles empty global matches without infinite looping', () => {
  const matches = collectMatches(/(?:)/g, 'abc', 100);
  assert.ok(matches.length > 0);
  assert.ok(matches.length <= 100);
});

test('counts capture groups across matches', () => {
  const matches = collectMatches(/(a)(b)/g, 'ab ab');
  assert.equal(countCaptureGroups(matches), 4);
});

test('uses native replacement syntax', () => {
  assert.equal(
    replaceMatches('Arfan Rahul', /([A-Z][a-z]+)/g, '[$1]'),
    '[Arfan] [Rahul]'
  );
});

test('formats a regex literal', () => {
  assert.equal(formatRegexLiteral('abc', 'ig'), '/abc/ig');
});

test('creates and parses share state', () => {
  const url = createShareUrl('https://example.com/tool?old=1', {
    pattern: '\\d+',
    flags: 'g',
    test: 'ID 123',
    replacement: '#'
  });

  const parsed = parseShareState(url);
  assert.deepEqual(parsed, {
    pattern: '\\d+',
    flags: 'g',
    test: 'ID 123',
    replacement: '#'
  });
});

test('preset library contains useful JavaScript regex examples', () => {
  const presets = getPresetLibrary();
  assert.ok(presets.length >= 8);

  for (const preset of presets) {
    const regex = createRegex(preset.pattern, preset.flags);
    assert.ok(regex instanceof RegExp);
    assert.equal(typeof preset.sample, 'string');
  }
});

console.log('\nAFX Regex Tester: all JavaScript tests passed.');
