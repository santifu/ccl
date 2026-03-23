// ─── script.js — CCL Generator logic ────────────────────────────────────────

const levelColors = ['#f0ede8', '#e8f0e0', '#f0f0d8', '#f8e8d0', '#f8ddd8'];
const levelTextColors = ['#7a7870', '#3a6020', '#5a5010', '#7a4010', '#8a2010'];

const sliderValues = [0, 0, 0, 0, 0, 0, 0, 0];

// ─── Google Apps Script config ────────────────────────────────────────────────
// ⚠️ PEGA AQUÍ la URL de tu Web App desplegada desde Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzitHS0I3WK1gOH-lm838LsZzhAe-3OXb096az-VlRIVGCQFENV0KF6boZP86QmERKgFQ/exec';

// ─── Save label to Google Sheets ──────────────────────────────────────────────
async function saveLabel() {
  const t = TRANSLATIONS[currentLang];
  const title = document.getElementById('projectTitle').value || t.field_project_ph;
  const author = document.getElementById('authorName').value || t.field_author_ph;
  const code = document.getElementById('badgeCode').textContent;
  const summary = document.getElementById('badgeSummaryText').innerText;

  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        project: title,
        author: author,
        lang: currentLang,
        code: code,
        summary: summary,
        r: sliderValues[0], i: sliderValues[1], d: sliderValues[2],
        c: sliderValues[3], p: sliderValues[4], o: sliderValues[5],
        m: sliderValues[6], f: sliderValues[7]
      })
    });
    // After saving, reload the counter
    setTimeout(loadCounter, 1500);
  } catch (err) {
    console.warn('Could not save to Google Sheets:', err);
  }
}

// ─── Load & display global counter ───────────────────────────────────────────
async function loadCounter() {
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL);
    const data = await res.json();
    if (data.count !== undefined) {
      document.querySelectorAll('.ccl-counter').forEach(el => {
        el.textContent = parseInt(data.count).toLocaleString();
      });
    }
  } catch (err) {
    console.warn('Could not load counter:', err);
  }
}

// ─── Minimal SVG icons per phase ─────────────────────────────────────────────
const phaseIcons = [
  // R — Research: book
  `<svg class="phase-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  // I — Ideation: lightbulb
  `<svg class="phase-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>`,
  // D — Design: pen tool
  `<svg class="phase-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
  // C — Coding: code brackets
  `<svg class="phase-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  // P — Prototyping: tool/wrench
  `<svg class="phase-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  // O — Documentation: file text
  `<svg class="phase-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  // M — Management: layout/grid
  `<svg class="phase-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  // F — Reflection: refresh/loop
  `<svg class="phase-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>`
];

// ─── Render phase cards ───────────────────────────────────────────────────────
function renderPhases() {
  const t = TRANSLATIONS[currentLang];
  const container = document.getElementById('phases-container');
  if (!container) return;
  container.innerHTML = '';

  t.phases.forEach((phase, i) => {
    const val = sliderValues[i];
    const card = document.createElement('div');
    card.className = 'phase-card';
    card.innerHTML = `
      <div class="phase-header">
        <div class="phase-emoji">${phaseIcons[i]}</div>
        <div class="phase-name">${phase.name}</div>
        <div class="phase-code">${phase.code}</div>
      </div>
      <div class="slider-wrap">
        <div class="slider-labels">
          <span>${t.slider_left}</span>
          <span>${t.slider_right}</span>
        </div>
        <input type="range" min="0" max="4" value="${val}"
          oninput="onSlider(${i}, this.value)"
          style="background:${getSliderBg(val)}">
        <div class="phase-level-row">
          <div class="level-pill" style="background:${levelColors[val]};color:${levelTextColors[val]}">
            ${val} — ${t.level_names[val]}
          </div>
          <div class="level-desc-text" id="level-desc-${i}">${phase.levels[val]}</div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function getSliderBg(val) {
  const pct = (val / 4) * 100;
  return `linear-gradient(to right,${levelColors[val]} 0%,${levelColors[val]} ${pct}%,#c8c3b8 ${pct}%,#c8c3b8 100%)`;
}

function onSlider(idx, val) {
  sliderValues[idx] = parseInt(val);
  const cards = document.querySelectorAll('.phase-card');
  const card = cards[idx];
  const t = TRANSLATIONS[currentLang];
  const v = sliderValues[idx];

  card.querySelector('input[type=range]').style.background = getSliderBg(v);

  const pill = card.querySelector('.level-pill');
  pill.style.background = levelColors[v];
  pill.style.color = levelTextColors[v];
  pill.textContent = `${v} — ${t.level_names[v]}`;

  const descEl = document.getElementById(`level-desc-${idx}`);
  descEl.classList.remove('fade-in');
  void descEl.offsetWidth;
  descEl.textContent = t.phases[idx].levels[v];
  descEl.classList.add('fade-in');

  updateSummary();
}

// ─── Update badge & summary ───────────────────────────────────────────────────
function updateSummary() {
  const t = TRANSLATIONS[currentLang];
  const titleEl = document.getElementById('projectTitle');
  const authorEl = document.getElementById('authorName');
  if (!titleEl) return;

  const title = titleEl.value || t.field_project_ph;
  const author = authorEl.value || t.field_author_ph;

  // Phase dots
  const badgePhases = document.getElementById('badgePhases');
  badgePhases.innerHTML = '';
  t.phases.forEach((phase, i) => {
    const v = sliderValues[i];
    const dot = document.createElement('div');
    dot.className = 'badge-phase-dot';
    dot.title = `${phase.name}: ${t.level_names[v]}`;
    dot.style.background = levelColors[v];
    dot.style.color = levelTextColors[v];
    dot.innerHTML = `<span class="dot-code">${phase.code}</span><span class="dot-val">${v}</span>`;
    badgePhases.appendChild(dot);
  });

  // Short code string
  const nonZero = sliderValues
    .map((v, i) => v > 0 ? `${t.phases[i].code}${v}` : null)
    .filter(Boolean);
  const codeStr = nonZero.length ? nonZero.join(' ') + ' – v1.0' : 'CCL v1.0';
  document.getElementById('badgeCode').textContent = codeStr;

  // Human-readable summary
  const lines = [];
  for (let lvl = 4; lvl >= 1; lvl--) {
    const names = t.phases.filter((_, i) => sliderValues[i] === lvl).map(p => p.name);
    if (!names.length) continue;
    const joined = names.length === 1
      ? names[0]
      : names.slice(0, -1).join(', ') + ' ' + t.and_word + ' ' + names[names.length - 1];
    lines.push(`${t.summary_level_labels[lvl]} ${joined}`);
  }

  let summaryText;
  if (!lines.length) {
    summaryText = t.summary_all_human;
  } else if (sliderValues.every(v => v > 0)) {
    summaryText = lines.join('. ') + '.';
  } else {
    summaryText = lines.join('. ') + t.summary_suffix;
  }

  document.getElementById('badgeSummaryText').innerHTML =
    `<strong>"${title}"</strong> ${t.by_word} ${author}<br>${summaryText}`;
}

// ─── Copy to clipboard ────────────────────────────────────────────────────────
function copySummary() {
  const code = document.getElementById('badgeCode').textContent;
  const summary = document.getElementById('badgeSummaryText').innerText;
  navigator.clipboard.writeText(`${code}\n\n${summary}`).then(() => {
    const msg = document.getElementById('copiedMsg');
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 2000);
    saveLabel();
  });
}

// ─── Download badge as PNG ────────────────────────────────────────────────────
function downloadBadge() {
  const t = TRANSLATIONS[currentLang];
  const title = document.getElementById('projectTitle').value || t.field_project_ph;
  const author = document.getElementById('authorName').value || t.field_author_ph;
  const code = document.getElementById('badgeCode').textContent;
  const summary = document.getElementById('badgeSummaryText').innerText;

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 340;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ede9e1';
  ctx.fillRect(0, 0, 800, 340);
  ctx.strokeStyle = '#c8c3b8';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, 798, 338);

  ctx.fillStyle = '#e8441a';
  ctx.fillRect(0, 0, 4, 340);

  ctx.fillStyle = '#6b6760';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('COGNITIVE CONTRIBUTION LABEL · CCL v1.0', 24, 34);

  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 22px serif';
  ctx.fillText(title, 24, 70);

  ctx.fillStyle = '#9c9890';
  ctx.font = '300 14px sans-serif';
  ctx.fillText(author, 24, 92);

  const phases = t.phases;
  const dotW = 70, dotH = 56, startX = 24, startY = 120;
  phases.forEach((phase, i) => {
    const v = sliderValues[i];
    const x = startX + i * (dotW + 8);
    ctx.fillStyle = levelColors[v];
    ctx.beginPath();
    ctx.roundRect(x, startY, dotW, dotH, 4);
    ctx.fill();
    ctx.fillStyle = levelTextColors[v];
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(v, x + dotW / 2, startY + 30);
    ctx.font = '600 10px sans-serif';
    ctx.fillText(phase.code, x + dotW / 2, startY + 46);
    ctx.textAlign = 'left';
  });

  ctx.fillStyle = '#1a1a1a';
  ctx.font = '600 13px sans-serif';
  ctx.fillText(code, 24, 210);

  ctx.fillStyle = '#6b6760';
  ctx.font = '300 12px sans-serif';
  let line = '', y = 236;
  for (const word of summary.split(' ')) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > 752 && line) {
      ctx.fillText(line, 24, y);
      line = word + ' ';
      y += 18;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, 24, y);

  ctx.fillStyle = '#9c9890';
  ctx.font = '300 10px sans-serif';
  ctx.fillText('creativecommons.org/licenses/by-nc-sa/4.0 · santifu.github.io/ccl', 24, 320);

  const link = document.createElement('a');
  link.download = `ccl-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();

  // Save to Supabase after download
  saveLabel();
}
