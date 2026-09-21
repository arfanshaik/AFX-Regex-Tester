export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function normalizeFlags(flags = '') {
  const allowed = ['d', 'g', 'i', 'm', 's', 'u', 'v', 'y'];
  const unique = [...new Set(String(flags).split(''))].filter(flag => allowed.includes(flag));

  if (unique.includes('u') && unique.includes('v')) {
    throw new SyntaxError('JavaScript RegExp flags "u" and "v" cannot be used together.');
  }

  return unique.join('');
}

export function createRegex(pattern, flags = '', options = {}) {
  const { forceGlobal = false } = options;
  let normalized = normalizeFlags(flags);

  if (forceGlobal && !normalized.includes('g') && !normalized.includes('y')) {
    normalized += 'g';
  }

  return new RegExp(pattern, normalized);
}

export function collectMatches(regex, text, limit = 5000) {
  if (!(regex instanceof RegExp)) {
    throw new TypeError('collectMatches expects a RegExp instance.');
  }

  const source = String(text ?? '');
  const matches = [];
  regex.lastIndex = 0;

  if (!regex.global && !regex.sticky) {
    const singleMatch = regex.exec(source);
    if (singleMatch) matches.push(singleMatch);
    return matches;
  }

  let match;
  let safety = 0;

  while ((match = regex.exec(source)) !== null && safety < limit) {
    matches.push(match);
    safety += 1;

    // Empty matches do not advance lastIndex in every useful case.
    // Force progress so a pattern such as /(?:)/g cannot create an infinite loop.
    if (match[0] === '') {
      regex.lastIndex += 1;
    }
  }

  return matches;
}

export function countCaptureGroups(matches = []) {
  return matches.reduce(
    (total, match) => total + Math.max(0, Number(match?.length ?? 0) - 1),
    0
  );
}

export function replaceMatches(text, regex, replacement = '') {
  if (!(regex instanceof RegExp)) {
    throw new TypeError('replaceMatches expects a RegExp instance.');
  }

  return String(text ?? '').replace(regex, String(replacement ?? ''));
}

export function createShareUrl(baseUrl, state = {}) {
  const url = new URL(baseUrl);
  url.search = '';

  if (state.pattern != null) url.searchParams.set('p', state.pattern);
  if (state.flags != null) url.searchParams.set('f', state.flags);
  if (state.test != null) url.searchParams.set('t', state.test);
  if (state.replacement != null) url.searchParams.set('r', state.replacement);

  return url.toString();
}

export function parseShareState(urlValue) {
  const url = new URL(urlValue);
  const params = url.searchParams;

  if (!params.has('p')) return null;

  return {
    pattern: params.get('p') ?? '',
    flags: params.get('f') ?? 'g',
    test: params.has('t') ? params.get('t') : undefined,
    replacement: params.has('r') ? params.get('r') : undefined
  };
}

export function formatRegexLiteral(pattern, flags = '') {
  return `/${String(pattern)}/${normalizeFlags(flags)}`;
}

export function getPresetLibrary() {
  return [
    {
      name: 'Email',
      pattern: '[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}',
      flags: 'gi',
      sample: 'Contact arfan@example.com or hello@afx.dev for details.'
    },
    {
      name: 'URL',
      pattern: 'https?:\\/\\/[^\\s]+',
      flags: 'gi',
      sample: 'Visit https://github.com and https://example.com/docs today.'
    },
    {
      name: 'IPv4',
      pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
      flags: 'g',
      sample: 'Router: 192.168.1.1  Server: 10.0.0.25'
    },
    {
      name: 'Hex color',
      pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
      flags: 'g',
      sample: 'Colors: #fff, #FF3448 and #0a0b0c.'
    },
    {
      name: 'Phone',
      pattern: '\\+?\\d[\\d\\s()-]{7,}\\d',
      flags: 'g',
      sample: 'Call +91 98765 43210 or (040) 1234 5678.'
    },
    {
      name: 'Date',
      pattern: '\\b\\d{2}[\\/-]\\d{2}[\\/-]\\d{4}\\b',
      flags: 'g',
      sample: 'Hackathon dates: 21/09/2026 and 22-09-2026.'
    },
    {
      name: 'HTML tag',
      pattern: '<([A-Za-z][A-Za-z0-9]*)\\b[^>]*>.*?<\\/\\1>',
      flags: 'gis',
      sample: '<p>Hello AFX</p> <div>Regex Tester</div>'
    },
    {
      name: 'Hashtag',
      pattern: '#[A-Za-z0-9_]+',
      flags: 'g',
      sample: '#JavaScript #Regex #AFXDeveloper'
    }
  ];
}
