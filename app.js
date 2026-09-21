import {
  collectMatches,
  countCaptureGroups,
  createRegex,
  createShareUrl,
  escapeHtml,
  getPresetLibrary,
  parseShareState,
  replaceMatches
} from './src/regex-engine.js';

const regexInput = document.getElementById('regexInput');
const testInput = document.getElementById('testInput');
const highlightLayer = document.getElementById('highlightLayer');
const regexError = document.getElementById('regexError');
const regexEditorWrap = document.getElementById('regexEditorWrap');
const flagSummary = document.getElementById('flagSummary');
const matchCount = document.getElementById('matchCount');
const groupCount = document.getElementById('groupCount');
const charCount = document.getElementById('charCount');
const runTime = document.getElementById('runTime');
const matchesList = document.getElementById('matchesList');
const replacementInput = document.getElementById('replacementInput');
const replacementPreview = document.getElementById('replacementPreview');
const replaceToggle = document.getElementById('replaceToggle');
const presetList = document.getElementById('presetList');
const historyList = document.getElementById('historyList');
const toast = document.getElementById('toast');

let replaceEnabled = true;
let toastTimer;

const presets = getPresetLibrary();

function getFlags() {
  return [...document.querySelectorAll('.flag-chip input:checked')].map(input => input.value).join('');
}

function setFlags(flags) {
  document.querySelectorAll('.flag-chip input').forEach(input => {
    input.checked = flags.includes(input.value);
    input.closest('.flag-chip').classList.toggle('active', input.checked);
  });
  flagSummary.textContent = flags || '—';
}

function buildRegex(forceGlobal = false) {
  return createRegex(regexInput.value, getFlags(), { forceGlobal });
}

function highlightMatches(text, matches) {
  if (!matches.length) {
    highlightLayer.innerHTML = escapeHtml(text) + (text.endsWith('\n') ? '\n ' : '');
    return;
  }

  let output = '';
  let cursor = 0;
  matches.forEach(match => {
    const start = match.index;
    const end = start + match[0].length;
    output += escapeHtml(text.slice(cursor, start));
    if (match[0].length === 0) {
      output += '<mark>​</mark>';
    } else {
      output += `<mark>${escapeHtml(match[0])}</mark>`;
    }
    cursor = end;
  });
  output += escapeHtml(text.slice(cursor));
  highlightLayer.innerHTML = output + (text.endsWith('\n') ? '\n ' : '');
}

function renderMatches(matches) {
  if (!matches.length) {
    matchesList.innerHTML = '<div class="empty-state">No matches yet.<br>Change the pattern or test string.</div>';
    return;
  }

  matchesList.innerHTML = matches.slice(0, 100).map((match, index) => {
    const groups = match.slice(1)
      .map((group, groupIndex) => `<span class="group-pill">$${groupIndex + 1}: ${escapeHtml(String(group ?? 'undefined'))}</span>`)
      .join('');
    return `
      <div class="match-card">
        <div class="match-top">
          <span class="match-value">${escapeHtml(match[0] || '∅ empty match')}</span>
          <span class="match-index">#${index + 1} @ ${match.index}</span>
        </div>
        ${groups ? `<div class="group-row">${groups}</div>` : ''}
      </div>`;
  }).join('');

  if (matches.length > 100) {
    matchesList.insertAdjacentHTML('beforeend', `<div class="empty-state">Showing first 100 of ${matches.length} matches.</div>`);
  }
}

function updateReplacement(regex, text) {
  if (!replaceEnabled) {
    replacementPreview.textContent = 'Replacement preview is disabled.';
    return;
  }
  replacementPreview.textContent = replaceMatches(text, regex, replacementInput.value);
}

function updateTester() {
  const started = performance.now();
  const text = testInput.value;
  charCount.textContent = text.length.toLocaleString();
  flagSummary.textContent = getFlags() || '—';
  regexError.textContent = '';
  regexEditorWrap.classList.remove('invalid');

  try {
    const regex = buildRegex();
    const matches = collectMatches(regex, text);
    highlightMatches(text, matches);
    renderMatches(matches);
    matchCount.textContent = matches.length.toLocaleString();
    const totalGroups = countCaptureGroups(matches);
    groupCount.textContent = totalGroups.toLocaleString();
    updateReplacement(regex, text);
  } catch (error) {
    regexError.textContent = error.message.replace(/^Invalid regular expression:\s*/, '');
    regexEditorWrap.classList.add('invalid');
    highlightLayer.textContent = text;
    matchesList.innerHTML = '<div class="empty-state">Fix the regex error to inspect matches.</div>';
    matchCount.textContent = '0';
    groupCount.textContent = '0';
    replacementPreview.textContent = 'Invalid regular expression.';
  }

  runTime.textContent = (performance.now() - started).toFixed(2);
}

function syncScroll() {
  highlightLayer.scrollTop = testInput.scrollTop;
  highlightLayer.scrollLeft = testInput.scrollLeft;
}

function renderPresets() {
  presetList.innerHTML = presets.map((preset, index) => `
    <button class="preset-btn" type="button" data-preset="${index}">
      <strong>${preset.name}</strong>
      <code>/${escapeHtml(preset.pattern)}/${preset.flags}</code>
    </button>`).join('');
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem('afxRegexHistory') || '[]'); }
  catch { return []; }
}

function renderHistory() {
  const history = getHistory();
  if (!history.length) {
    historyList.innerHTML = '<div class="empty-state">Saved patterns will appear here.</div>';
    return;
  }
  historyList.innerHTML = history.map((item, index) => `
    <div class="history-item">
      <div class="history-pattern">
        <code>/${escapeHtml(item.pattern)}/${item.flags}</code>
        <span>${item.savedAt}</span>
      </div>
      <button class="history-use" type="button" data-history="${index}">USE</button>
    </div>`).join('');
}

function saveHistory() {
  if (!regexInput.value.trim()) return showToast('Enter a pattern first');
  try { buildRegex(); } catch { return showToast('Fix the regex before saving'); }
  const history = getHistory();
  const entry = {
    pattern: regexInput.value,
    flags: getFlags(),
    test: testInput.value,
    replacement: replacementInput.value,
    savedAt: new Date().toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  };
  const unique = history.filter(item => item.pattern !== entry.pattern || item.flags !== entry.flags);
  unique.unshift(entry);
  localStorage.setItem('afxRegexHistory', JSON.stringify(unique.slice(0, 8)));
  renderHistory();
  showToast('Pattern saved');
}

function loadStateFromUrl() {
  const state = parseShareState(location.href);
  if (!state) return;

  regexInput.value = state.pattern;
  setFlags(state.flags);
  if (state.test !== undefined) testInput.value = state.test;
  if (state.replacement !== undefined) replacementInput.value = state.replacement;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1700);
}

async function copyText(value, message = 'Copied') {
  try {
    await navigator.clipboard.writeText(value);
    showToast(message);
  } catch {
    const area = document.createElement('textarea');
    area.value = value;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
    showToast(message);
  }
}

document.querySelectorAll('.flag-chip input').forEach(input => {
  input.addEventListener('change', () => {
    input.closest('.flag-chip').classList.toggle('active', input.checked);
    // JavaScript currently disallows using u and v together.
    if (input.checked && (input.value === 'u' || input.value === 'v')) {
      const other = document.querySelector(`.flag-chip input[value="${input.value === 'u' ? 'v' : 'u'}"]`);
      if (other) {
        other.checked = false;
        other.closest('.flag-chip').classList.remove('active');
      }
    }
    updateTester();
  });
});

regexInput.addEventListener('input', updateTester);
testInput.addEventListener('input', updateTester);
testInput.addEventListener('scroll', syncScroll);
replacementInput.addEventListener('input', updateTester);

replaceToggle.addEventListener('click', () => {
  replaceEnabled = !replaceEnabled;
  replaceToggle.classList.toggle('off', !replaceEnabled);
  replaceToggle.setAttribute('aria-pressed', String(replaceEnabled));
  replaceToggle.lastChild.textContent = replaceEnabled ? ' Enabled' : ' Disabled';
  updateTester();
});

document.getElementById('copyRegexBtn').addEventListener('click', () => copyText(`/${regexInput.value}/${getFlags()}`, 'Regex copied'));
document.getElementById('savePresetBtn').addEventListener('click', saveHistory);
document.getElementById('clearHistoryBtn').addEventListener('click', () => {
  localStorage.removeItem('afxRegexHistory');
  renderHistory();
  showToast('History cleared');
});

document.getElementById('clearBtn').addEventListener('click', () => {
  regexInput.value = '';
  testInput.value = '';
  replacementInput.value = '';
  setFlags('g');
  updateTester();
  regexInput.focus();
});

document.getElementById('shareBtn').addEventListener('click', () => {
  const url = createShareUrl(location.href, {
    pattern: regexInput.value,
    flags: getFlags(),
    test: testInput.value,
    replacement: replacementInput.value
  });

  copyText(url, 'Share link copied');
});

presetList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-preset]');
  if (!button) return;
  const preset = presets[Number(button.dataset.preset)];
  regexInput.value = preset.pattern;
  testInput.value = preset.sample;
  setFlags(preset.flags);
  updateTester();
  showToast(`${preset.name} preset loaded`);
});

historyList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-history]');
  if (!button) return;
  const item = getHistory()[Number(button.dataset.history)];
  if (!item) return;
  regexInput.value = item.pattern;
  setFlags(item.flags);
  testInput.value = item.test || testInput.value;
  replacementInput.value = item.replacement ?? replacementInput.value;
  updateTester();
});

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    saveHistory();
  }
});

renderPresets();
renderHistory();
loadStateFromUrl();
updateTester();
