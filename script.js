// ─── script.js — CCL Generator logic ───────────────────────────────────────

const levelColors    = ['#f0ede8','#e8f0e0','#f0f0d8','#f8e8d0','#f8ddd8'];
const levelTextColors= ['#7a7870','#3a6020','#5a5010','#7a4010','#8a2010'];

const sliderValues = [0, 0, 0, 0, 0, 0, 0, 0];

// ─── Render phase cards ──────────────────────────────────────────────────────
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
        <div class="phase-emoji">${phase.emoji}</div>
        <div class="phase-name">${phase.name}</div>
        <div class="phase-code">${phase.code}</div>
      </div>
      <div class="phase-desc">${phase.desc}</div>
      <div class="slider-wrap">
        <div class="slider-labels">
          <span>${t.slider_left}</span>
          <span>${t.slider_right}</span>
        </div>
        <input type="range" min="0" max="4" value="${val}"
          oninput="onSlider(${i}, this.value)"
          style="background:${getSliderBg(val)}">
        <div class="current-level-tag">
          <div class="level-pill" style="background:${levelColors[val]};color:${levelTextColors[val]}">
            ${val} — ${t.level_names[val]}
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function getSliderBg(val) {
  const pct = (val / 4) * 100;
  return `linear-gradient(to right,${levelColors[val]} 0%,${levelColors[val]} ${pct}%,#2a2a2a ${pct}%,#2a2a2a 100%)`;
}

function onSlider(idx, val) {
  sliderValues[idx] = parseInt(val);
  const cards = document.querySelectorAll('.phase-card');
  const card = cards[idx];
  const t = TRANSLATIONS[currentLang];
  const v = sliderValues[idx];
  card.querySelector('input[type=range]').style.background = getSliderBg(v);
  const pill = card.querySelector('.level-pill');
  pill.style.background   = levelColors[v];
  pill.style.color        = levelTextColors[v];
  pill.textContent        = `${v} — ${t.level_names[v]}`;
  updateSummary();
}

// ─── Update badge & summary ──────────────────────────────────────────────────
function updateSummary() {
  const t      = TRANSLATIONS[currentLang];
  const titleEl  = document.getElementById('projectTitle');
  const authorEl = document.getElementById('authorName');
  if (!titleEl) return;

  const title  = titleEl.value  || t.field_project_ph;
  const author = authorEl.value || t.field_author_ph;

  // Phase dots
  const badgePhases = document.getElementById('badgePhases');
  badgePhases.innerHTML = '';
  t.phases.forEach((phase, i) => {
    const v   = sliderValues[i];
    const dot = document.createElement('div');
    dot.className   = 'badge-phase-dot';
    dot.title       = `${phase.name}: ${t.level_names[v]}`;
    dot.style.background = levelColors[v];
    dot.style.color      = levelTextColors[v];
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
      : names.slice(0,-1).join(', ') + ' ' + t.and_word + ' ' + names[names.length-1];
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

// ─── Copy to clipboard ───────────────────────────────────────────────────────
function copySummary() {
  const code    = document.getElementById('badgeCode').textContent;
  const summary = document.getElementById('badgeSummaryText').innerText;
  navigator.clipboard.writeText(`${code}\n\n${summary}`).then(() => {
    const msg = document.getElementById('copiedMsg');
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 2000);
  });
}

// ─── Download badge as PNG ───────────────────────────────────────────────────
function downloadBadge() {
  const t      = TRANSLATIONS[currentLang];
  const title  = document.getElementById('projectTitle').value  || t.field_project_ph;
  const author = document.getElementById('authorName').value    || t.field_author_ph;
  const code   = document.getElementById('badgeCode').textContent;
  const summary= document.getElementById('badgeSummaryText').innerText;

  const canvas = document.createElement('canvas');
  canvas.width  = 800;
  canvas.height = 340;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#f5f4f0';
  ctx.fillRect(0, 0, 800, 340);
  ctx.strokeStyle = '#d8d6cf';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, 798, 338);

  // Accent bar
  ctx.fillStyle = '#e8441a';
  ctx.fillRect(0, 0, 4, 340);

  // Header
  ctx.fillStyle = '#7a7870';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('COGNITIVE CONTRIBUTION LABEL · CCL v1.0', 24, 34);

  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 22px serif';
  ctx.fillText(title, 24, 70);

  ctx.fillStyle = '#a8a69e';
  ctx.font = '300 14px sans-serif';
  ctx.fillText(author, 24, 92);

  // Phase dots
  const phases = t.phases;
  const dotW = 70, dotH = 56, startX = 24, startY = 120;
  phases.forEach((phase, i) => {
    const v = sliderValues[i];
    const x = startX + i * (dotW + 8);
    ctx.fillStyle = levelColors[v];
    ctx.beginPath();
    ctx.roundRect(x, startY, dotW, dotH, 6);
    ctx.fill();
    ctx.fillStyle = levelTextColors[v];
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(v, x + dotW/2, startY + 30);
    ctx.font = '600 10px sans-serif';
    ctx.fillText(phase.code, x + dotW/2, startY + 46);
    ctx.textAlign = 'left';
  });

  // Code string
  ctx.fillStyle = '#1a1a1a';
  ctx.font = '500 13px sans-serif';
  ctx.fillText(code, 24, 210);

  // Summary (wrapped)
  ctx.fillStyle = '#7a7870';
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

  // Footer
  ctx.fillStyle = '#b0aea6';
  ctx.font = '300 10px sans-serif';
  ctx.fillText('creativecommons.org/licenses/by-nc-sa/4.0 · santifu.github.io/ccl', 24, 320);

  const link = document.createElement('a');
  link.download = `ccl-${title.toLowerCase().replace(/\s+/g,'-')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
