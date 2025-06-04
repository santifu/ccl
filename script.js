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

// Etiquetas de nivel
const levelLabels = [
    "Full Human Work",
    "AI for Insight",
    "AI for Drafting",
    "AI as Co-Creator",
    "AI as Driver"
];

// Abreviaturas de las fases
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

// Descripciones de los niveles
const levelDescriptions = {
    1: "Drafting Assistant",
    2: "Co-Creator",
    3: "Hybrid AI/Human-led",
    4: "AI-led"
};

// Función para ajustar la intensidad del color
function adjustColor(color, level) {
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);

    const factor = 0.2 * level;
    r = Math.min(255, r + (255 - r) * factor);
    g = Math.min(255, g + (255 - g) * factor);
    b = Math.min(255, b + (255 - b) * factor);

    const adjustedColor = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;

    return adjustedColor;
}

// Inicializar el gráfico
let chart;
const canvas = document.getElementById('ccl-chart');
const ctx = canvas.getContext('2d');

// Función para actualizar el contador de licencias
function updateLicenseCounter() {
    let counter = localStorage.getItem('licenseCounter') || 0;
    counter = parseInt(counter) + 1;
    localStorage.setItem('licenseCounter', counter);
    document.getElementById('license-counter').textContent = counter;
}

// Función para actualizar la descripción de la fase
function updatePhaseDescription(phaseId) {
    const slider = document.getElementById(phaseId);
    const description = document.getElementById(`${phaseId}-desc`);
    const level = parseInt(slider.value);
    description.textContent = phaseDescriptions[phaseId][level];
}

// Función para dibujar el gráfico
function drawChart() {
    const phases = ['reflection', 'research', 'ideation', 'design', 'coding', 'prototyping', 'documentation', 'management'];
    const phaseAbbreviations = ['F', 'R', 'I', 'D', 'C', 'P', 'O', 'M'];
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

        const baseColor = sliderColors[phase];
        const adjustedColor = adjustColor(baseColor, level);

        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = adjustedColor;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Posición de la letra en el centro del segmento
        const labelAngle = startAngle + angleStep / 2;
        const labelRadius = (outerRadius + innerRadius) / 2;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;

        ctx.fillStyle = '#2d3748';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(phaseAbbreviations[index], labelX, labelY);
    });

    // Dibujar círculo central
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Texto central
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CCL', centerX, centerY - 3);
    ctx.font = '8px sans-serif';
    ctx.fillText('Summary', centerX, centerY + 6);
}



// Colores de los sliders
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

// Función para actualizar el resumen
function updateSummary() {
    const phases = ['research', 'ideation', 'design', 'coding', 'prototyping', 'documentation', 'management', 'reflection'];
    const phaseNames = {
        R: 'Research',
        I: 'Ideation',
        D: 'Design',
        C: 'Coding',
        P: 'Prototyping',
        O: 'Documentation',
        M: 'Management',
        F: 'Reflection'
    };

    const levels = phases.map(phase => parseInt(document.getElementById(phase).value));
    const projectTitle = document.getElementById('projectTitle').value;
    const yourName = document.getElementById('yourName').value;

    let licenseParts = [];
    let licenseCode = "CCL ";

    // Generar el código de licencia
    phases.forEach((phase, index) => {
        const level = levels[index];
        if (level > 0) {
            const abbreviation = phaseAbbreviations[phase];
            licenseCode += `${abbreviation}${level} `;
        }
    });

    // Generar las descripciones de la licencia
    phases.forEach((phase, index) => {
        const level = levels[index];
        if (level > 0) {
            const phaseAbbrev = phaseAbbreviations[phase];
            const phaseName = phaseNames[phaseAbbrev];
            const description = levelDescriptions[level];
            const action = level === 1 ? 'contributed as' : 'acted as';
            licenseParts.push(`AI ${action} ${description} in ${phaseName}`);
        }
    });

    // Combinar todo en una sola cadena
    let licenseText = licenseCode.trim() + "v1.0 — " + licenseParts.join(", ") + ". All other phases were fully human-led.";

    // Combinar información del proyecto con el resumen
    let finalSummary = "";
    if (projectTitle) {
        finalSummary += `"${projectTitle}"`;
        if (yourName) {
            finalSummary += ` by ${yourName}`;
        }
        finalSummary += "\n\n";
    }

    finalSummary += licenseText;

    document.getElementById('summary-text').textContent = finalSummary;
}

// Función para descargar la insignia
function downloadBadge() {
    const badgeCanvas = document.createElement('canvas');
    const badgeSize = 400;
    badgeCanvas.width = badgeSize;
    badgeCanvas.height = badgeSize;
    const badgeCtx = badgeCanvas.getContext('2d');

    // Hacer el fondo transparente
    badgeCtx.clearRect(0, 0, badgeCanvas.width, badgeCanvas.height);

    const centerX = badgeCanvas.width / 2;
    const centerY = badgeCanvas.height / 2;
    const outerRadius = badgeSize / 2 - 20;
    const innerRadius = badgeSize / 2 - 120;

    const phases = ['reflection', 'research', 'ideation', 'design', 'coding', 'prototyping', 'documentation', 'management'];
    const phaseAbbreviations = ['F', 'R', 'I', 'D', 'C', 'P', 'O', 'M'];
    const colors = ['#cbabd1', '#6f1926', '#de324c', '#f4895f', '#f8e16f', '#95cf92', '#369acc', '#9656a2'];

    const angleStep = (Math.PI * 2) / phases.length;

    phases.forEach((phase, index) => {
        const level = parseInt(document.getElementById(phases[index]).value);
        const startAngle = index * angleStep - Math.PI / 2;
        const endAngle = (index + 1) * angleStep - Math.PI / 2;

        const adjustedColor = adjustColor(colors[index], level);

        badgeCtx.beginPath();
        badgeCtx.moveTo(centerX, centerY);
        badgeCtx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        badgeCtx.lineTo(centerX, centerY);
        badgeCtx.closePath();
        badgeCtx.fillStyle = adjustedColor;
        badgeCtx.fill();
        badgeCtx.strokeStyle = '#fff';
        badgeCtx.stroke();

        // Posición de la letra en el centro del segmento
        const labelAngle = startAngle + angleStep / 2;
        const labelRadius = (outerRadius + innerRadius) / 2;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;

        badgeCtx.fillStyle = '#2d3748';
        badgeCtx.font = 'bold 16px sans-serif';
        badgeCtx.textAlign = 'center';
        badgeCtx.textBaseline = 'middle';
        badgeCtx.fillText(phaseAbbreviations[index], labelX, labelY);
    });

    // Dibujar el círculo interior
    badgeCtx.beginPath();
    badgeCtx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    badgeCtx.fillStyle = 'white';
    badgeCtx.fill();
    badgeCtx.strokeStyle = '#e2e8f0';
    badgeCtx.stroke();

    // Dibujar el texto en el centro
    badgeCtx.fillStyle = '#2d3748';
    badgeCtx.font = 'bold 12px sans-serif';
    badgeCtx.textAlign = 'center';
    badgeCtx.fillText('COGNITIVE CONTRIBUTION', centerX, centerY - 15);
    badgeCtx.fillText('LICENSE', centerX, centerY + 5);
    badgeCtx.font = '10px sans-serif';
    badgeCtx.fillText('v1.0 (CCL)', centerX, centerY + 20);

    // Crear un enlace para descargar el badge como PNG
    const link = document.createElement('a');
    link.download = 'ccl-badge.png';
    link.href = badgeCanvas.toDataURL('image/png');
    link.click();

    // Actualizar el contador de licencias
    updateLicenseCounter();
}

// Función para copiar el resumen al portapapeles
function downloadSummary() {
    const summaryText = document.getElementById('summary-text').textContent;

    navigator.clipboard.writeText(summaryText).then(() => {
        alert('CCL Summary copied to clipboard!');
        updateLicenseCounter();
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = summaryText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('CCL Summary copied to clipboard!');
        updateLicenseCounter();
    });
}

// Añadir event listeners
document.addEventListener('DOMContentLoaded', function() {
    const counter = localStorage.getItem('licenseCounter') || 0;
    document.getElementById('license-counter').textContent = counter;

    const phases = ['research', 'ideation', 'design', 'coding', 'prototyping', 'documentation', 'management', 'reflection'];

    phases.forEach(phase => {
        updatePhaseDescription(phase);
        const slider = document.getElementById(phase);
        slider.addEventListener('input', function() {
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
