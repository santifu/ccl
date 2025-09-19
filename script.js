// =======================
// CONFIGURACIÓN PRINCIPAL
// =======================

// Descripciones de las fases para cada nivel
const phaseDescriptions = {
    research: [
        "All research was conducted manually (e.g., Google Scholar, physical books).",
        "AI assisted with search queries or source recommendations.",
        "AI generated initial research summaries or bibliographies.",
        "AI and human collaborated on research strategy and analysis.",
        "AI conducted most research with human oversight and selection."
    ],
    ideation: [
        "Ideas emerged from personal reflection, discussion, or sketching.",
        "AI provided inspiration or brainstorming prompts.",
        "AI generated initial concept drafts for refinement.",
        "AI and human co-developed ideas through iterative feedback.",
        "AI generated most ideas with human curation and selection."
    ],
    design: [
        "All design work created manually by human.",
        "AI provided design inspiration or suggestions.",
        "AI generated rough layouts, wireframes, or 3D sketches.",
        "AI and human collaborated on design iterations.",
        "AI created most designs with human selection and minor edits."
    ],
    coding: [
        "All code written manually by human.",
        "AI provided coding suggestions or debugging help.",
        "AI produced code snippets or logic flows, later edited.",
        "AI and human collaborated on code development.",
        "AI wrote most code with human review and integration."
    ],
    prototyping: [
        "Materials and components chosen and assembled manually.",
        "AI suggested materials or assembly approaches.",
        "AI generated prototyping plans or component specifications.",
        "AI and human collaborated on prototype development.",
        "AI designed most prototype elements with human assembly."
    ],
    documentation: [
        "All documentation written manually by human.",
        "AI helped with formatting or structural suggestions.",
        "AI created draft texts, web pages, diagrams.",
        "AI and human collaborated on documentation development.",
        "AI generated most documentation with human editing."
    ],
    management: [
        "All project management done manually by human.",
        "AI provided scheduling or organizational suggestions.",
        "AI created schedules, content drafts, or social media posts.",
        "AI and human collaborated on project coordination.",
        "AI managed most project elements with human oversight."
    ],
    reflection: [
        "All reflection and analysis done independently by human.",
        "AI provided prompts or questions for reflection.",
        "AI generated initial reflection drafts for refinement.",
        "Insights emerged through reflective loops with AI.",
        "AI conducted most analysis with human validation."
    ]
};

// Abreviaturas consistentes
const phaseAbbreviations = {
    research: 'R',
    ideation: 'I',
    design: 'D',
    coding: 'C',
    prototyping: 'P',
    documentation: 'O',
    management: 'M',
    reflection: 'F'
};

// Colores de las fases
const sliderColors = {
    research: '#6f1926',
    ideation: '#de324c',
    design: '#f4895f',
    coding: '#f8e16f',
    prototyping: '#95cf92',
    documentation: '#369acc',
    management: '#9656a2',
    reflection: '#cbabd1'
};

// Nombres completos de fases
const phaseNames = {
    R: "Research",
    I: "Ideation",
    D: "Design",
    C: "Coding",
    P: "Prototyping",
    O: "Documentation",
    M: "Management",
    F: "Reflection"
};

// Descripciones de niveles
const levelDescriptions = {
    1: "Full Human Work",
    2: "AI for Insight",
    3: "AI for Drafting",
    4: "AI as Co-Creator",
    5: "AI as Driver"
};

// ============================
// FUNCIONES DE UTILIDAD
// ============================

function adjustColor(color, level) {
    let baseR = parseInt(color.substring(1, 3), 16);
    let baseG = parseInt(color.substring(3, 5), 16);
    let baseB = parseInt(color.substring(5, 7), 16);

    const mixFactor = level / 5;

    let r = Math.round(255 * (1 - mixFactor) + baseR * mixFactor);
    let g = Math.round(255 * (1 - mixFactor) + baseG * mixFactor);
    let b = Math.round(255 * (1 - mixFactor) + baseB * mixFactor);

    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ============================
// FUNCIONES DE INTERFAZ
// ============================

function updateLicenseCounter() {
    let counter = localStorage.getItem('licenseCounter') || 0;
    counter = parseInt(counter) + 1;
    localStorage.setItem('licenseCounter', counter);
    document.getElementById('license-counter').textContent = counter;
}

function updatePhaseDescription(phaseId) {
    const slider = document.getElementById(phaseId);
    const description = document.getElementById(`${phaseId}-desc`);
    const level = parseInt(slider.value);
    description.textContent = phaseDescriptions[phaseId][level];
}

function drawChart() {
    const canvas = document.getElementById('ccl-chart');
    const ctx = canvas.getContext('2d');

    const phases = Object.keys(phaseAbbreviations);
    const data = phases.map(phase => parseInt(document.getElementById(phase).value));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 100;
    const innerRadius = 30;
    const angleStep = (Math.PI * 2) / phases.length;

    phases.forEach((phase, index) => {
        const level = data[index];
        const startAngle = index * angleStep - Math.PI / 2;
        const endAngle = (index + 1) * angleStep - Math.PI / 2;

        const adjustedColor = adjustColor(sliderColors[phase], level);

        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = adjustedColor;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        const labelAngle = startAngle + angleStep / 2;
        const labelRadius = (outerRadius + innerRadius) / 2;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;

        ctx.fillStyle = '#2d3748';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(phaseAbbreviations[phase], labelX, labelY);
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CCL', centerX, centerY - 3);
    ctx.font = '8px sans-serif';
    ctx.fillText('Summary', centerX, centerY + 6);
}

function updateSummary() {
    const phases = Object.keys(phaseAbbreviations);
    const levels = phases.map(phase => parseInt(document.getElementById(phase).value));
    const projectTitle = document.getElementById('projectTitle').value;
    const yourName = document.getElementById('yourName').value;

    let licenseCode = "CCL ";
    let licenseParts = [];

    phases.forEach((phase, index) => {
        const level = levels[index];
        if (level > 0) {
            const abbr = phaseAbbreviations[phase];
            licenseCode += `${abbr}${level} `;
            licenseParts.push(`AI contributed as ${levelDescriptions[level]} in ${phaseNames[abbr]}`);
        }
    });

    let licenseText = licenseCode.trim() + "v1.0 — " + licenseParts.join(", ") + ".";
    let finalSummary = "";

    if (projectTitle) {
        finalSummary += `"${projectTitle}"`;
        if (yourName) finalSummary += ` by ${yourName}`;
        finalSummary += "\n\n";
    }
    finalSummary += licenseText;

    document.getElementById('summary-text').textContent = finalSummary;
    return finalSummary;
}

// ============================
// SUPABASE
// ============================

const SUPABASE_URL = "https://TU-PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "tu-public-anon-key";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getUserId() {
  let id = localStorage.getItem('ccl_client_id');
  if (!id) {
    id = 'u_' + crypto.randomUUID();
    localStorage.setItem('ccl_client_id', id);
  }
  return id;
}

async function saveLabel(labelData) {
  const userId = getUserId();
  const { error } = await supabase
    .from('labels')
    .insert([{ user_id: userId, payload: labelData }]);
  if (error) console.error('Error insertando label:', error.message);
  else console.log('Label registrado en Supabase ✅');
}

// ============================
// DESCARGAS + SUPABASE
// ============================

async function downloadSummary() {
    const summaryText = updateSummary();
    const projectTitle = document.getElementById('projectTitle').value;
    const yourName = document.getElementById('yourName').value;
    const phases = Object.keys(phaseAbbreviations);
    const levels = phases.map(phase => parseInt(document.getElementById(phase).value));

    // Guardar en Supabase
    await saveLabel({ projectTitle, yourName, levels, summaryText });

    const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "CCL_Summary.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    updateLicenseCounter();
}

async function downloadBadge() {
    const canvas = document.getElementById('ccl-chart');
    const projectTitle = document.getElementById('projectTitle').value;
    const yourName = document.getElementById('yourName').value;
    const phases = Object.keys(phaseAbbreviations);
    const levels = phases.map(phase => parseInt(document.getElementById(phase).value));

    // Guardar en Supabase
    await saveLabel({ projectTitle, yourName, levels, badge: true });

    const link = document.createElement('a');
    link.download = "CCL_Badge.png";
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    updateLicenseCounter();
}

// ============================
// EVENTOS
// ============================

document.addEventListener('DOMContentLoaded', () => {
    const counter = localStorage.getItem('licenseCounter') || 0;
    document.getElementById('license-counter').textContent = counter;

    const phases = Object.keys(phaseAbbreviations);

    phases.forEach(phase => {
        updatePhaseDescription(phase);
        const slider = document.getElementById(phase);
        slider.addEventListener('input', () => {
            updatePhaseDescription(phase);
            drawChart();
            updateSummary();
        });
    });

    document.getElementById('projectTitle').addEventListener('input', updateSummary);
    document.getElementById('yourName').addEventListener('input', updateSummary);

    drawChart();
    updateSummary();
});
