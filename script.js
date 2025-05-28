// Phase descriptions for each level
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

const levelLabels = [
    "Full Human Work",
    "AI for Insight",
    "AI for Drafting",
    "AI as Co-Creator",
    "AI as Driver"
];

// Function to shade a color
function shadeColor(color, percent) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    R = Math.round(R);
    G = Math.round(G);
    B = Math.round(B);

    const RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}

// Initialize chart
let chart;
const canvas = document.getElementById('ccl-chart');
const ctx = canvas.getContext('2d');

// Function to update the license counter
function updateLicenseCounter() {
    let counter = localStorage.getItem('licenseCounter') || 0;
    counter = parseInt(counter) + 1;
    localStorage.setItem('licenseCounter', counter);
    document.getElementById('license-counter').textContent = counter;
}

function updatePhaseDescription(phaseId) {
    const slider = document.getElementById(phaseId);
    const description = document.getElementById(phaseId + '-desc');
    const level = parseInt(slider.value);
    description.textContent = phaseDescriptions[phaseId][level];
}

function drawChart() {
    const phases = ['research', 'ideation', 'design', 'coding', 'prototyping', 'documentation', 'management', 'reflection'];
    const data = phases.map(phase => parseInt(document.getElementById(phase).value));

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 100;
    const innerRadius = 30;

    // Colors for each level
    const colors = ['#4299e1', '#48bb78', '#f56565', '#9f7aea', '#6b7280'];

    // Draw segments
    const angleStep = (Math.PI * 2) / phases.length;

    phases.forEach((phase, index) => {
        const level = data[index];
        const startAngle = index * angleStep - Math.PI / 2;
        const endAngle = (index + 1) * angleStep - Math.PI / 2;

        // Draw segment
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = colors[level];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw labels
        const labelAngle = startAngle + angleStep / 2;
        const labelRadius = outerRadius + 15;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;

        ctx.fillStyle = '#2d3748';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(phase.charAt(0).toUpperCase(), labelX, labelY);
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center text
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CCL', centerX, centerY - 3);
    ctx.font = '8px sans-serif';
    ctx.fillText('Summary', centerX, centerY + 6);
}

function updateSummary() {
    const phases = ['research', 'ideation', 'design', 'coding', 'prototyping', 'documentation', 'management', 'reflection'];
    const phaseNames = ['Research', 'Ideation', 'Design', 'Coding', 'Prototyping', 'Documentation', 'Management', 'Reflection'];
    const phaseAbbreviations = ['R', 'I', 'D', 'C', 'M', 'O', 'P', 'F'];

    const levels = phases.map(phase => parseInt(document.getElementById(phase).value));
    const projectTitle = document.getElementById('projectTitle').value;
    const yourName = document.getElementById('yourName').value;

    // Level description mapping
    const levelDesc = {
        0: "human-led",
        1: "Drafting Assistant",
        2: "Co-Creator",
        3: "Hybrid AI/Human-led",
        4: "AI-led"
    };

    // Generate CCL code
    const summaryCode = ["AI"];
    const phaseLevels = {};

    levels.forEach((level, index) => {
        const phaseCode = phaseAbbreviations[index];
        phaseLevels[phaseCode] = level;
        if (level > 0) {
            summaryCode.push(`${phaseCode}${level}`);
        }
    });

    // Group phases by level description
    const levelsByRole = {};
    levels.forEach((level, index) => {
        if (level > 0) {
            const desc = levelDesc[level];
            if (!levelsByRole[desc]) levelsByRole[desc] = [];
            levelsByRole[desc].push(phaseNames[index]);
        }
    });

    let summary = "";
    const fullHuman = Object.keys(levelsByRole).length === 0;

    if (fullHuman) {
        summary = "CCL v1.0 — All phases led by humans. AI was not used in any stage of the process.";
    } else {
        const rolePhrases = Object.entries(levelsByRole).map(([role, phaseList]) => {
            const joined = phaseList.length > 1
                ? phaseList.slice(0, -1).join(", ") + " and " + phaseList.slice(-1)
                : phaseList[0];
            return `AI ${role === "Drafting Assistant" ? "contributed as" : "acted as"} ${role} in ${joined}`;
        });

        summary = `CCL v1.0 — ${rolePhrases.join(", ")}.`;

        const totalPhases = phases.length;
        const aiPhases = levels.filter(level => level > 0).length;
        if (aiPhases < totalPhases) {
            summary += " All other phases were fully human-led.";
        }
    }

    // Add short code
    const shortCode = `${summaryCode.join(" ")} – v1.0`;

    // Combine project info with summary
    let finalSummary = "";
    if (projectTitle) {
        finalSummary += `"${projectTitle}"`;
        if (yourName) {
            finalSummary += ` by ${yourName}`;
        }
        finalSummary += "\n\n";
    }

    finalSummary += summary + "\n\n" + shortCode;

    document.getElementById('summary-text').textContent = finalSummary;
}

function downloadBadge() {
    // Create a temporary canvas for the badge
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 400;
    badgeCanvas.height = 200;
    const badgeCtx = badgeCanvas.getContext('2d');

    // Obtener el color del slider seleccionado
    const phases = ['research', 'ideation', 'design', 'coding', 'prototyping', 'documentation', 'management', 'reflection'];
    const colors = ['#4299e1', '#48bb78', '#f56565', '#9f7aea', '#6b7280', '#38b2ac', '#ed8936', '#975a16'];
    const selectedColor = colors[phases.indexOf(document.querySelector('.slider:checked')?.id || 'research')];

    // Draw badge background with the selected color
    badgeCtx.fillStyle = selectedColor;
    badgeCtx.fillRect(0, 0, 400, 200);

    // Draw badge content
    badgeCtx.fillStyle = 'white';
    badgeCtx.font = 'bold 20px sans-serif';
    badgeCtx.textAlign = 'center';
    badgeCtx.fillText('Cognitive Contribution License', 200, 40);

    badgeCtx.font = '14px sans-serif';
    badgeCtx.fillText(document.getElementById('projectTitle').value, 200, 70);
    badgeCtx.fillText('by ' + document.getElementById('yourName').value, 200, 90);

    // Add mini chart
    const miniChart = document.getElementById('ccl-chart');
    badgeCtx.drawImage(miniChart, 250, 100, 70, 70);

    // Add summary
    badgeCtx.font = '10px sans-serif';
    badgeCtx.textAlign = 'left';
    const summaryText = document.getElementById('summary-text').textContent;
    const words = summaryText.split(' ');
    let line = '';
    let y = 120;

    for (let n = 0; n < words.length && y < 180; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = badgeCtx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > 230 && n > 0) {
            badgeCtx.fillText(line, 10, y);
            line = words[n] + ' ';
            y += 12;
        } else {
            line = testLine;
        }
    }
    badgeCtx.fillText(line, 10, y);

    // Download
    const link = document.createElement('a');
    link.download = 'ccl-badge.png';
    link.href = badgeCanvas.toDataURL();
    link.click();

    // Update the license counter
    updateLicenseCounter();
}

function downloadSummary() {
    const summaryText = document.getElementById('summary-text').textContent;

    navigator.clipboard.writeText(summaryText).then(() => {
        alert('CCL Summary copied to clipboard!');
        // Update the license counter
        updateLicenseCounter();
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = summaryText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('CCL Summary copied to clipboard!');
        // Update the license counter
        updateLicenseCounter();
    });
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    const counter = localStorage.getItem('licenseCounter') || 0;
    document.getElementById('license-counter').textContent = counter;

    const phases = ['research', 'ideation', 'design', 'coding', 'prototyping', 'documentation', 'management', 'reflection'];

    // Initialize all phase descriptions and chart
    phases.forEach(phase => {
        updatePhaseDescription(phase);
        const slider = document.getElementById(phase);
        slider.addEventListener('input', function() {
            updatePhaseDescription(phase);
            drawChart();
            updateSummary();
        });
    });

    // Add listeners for project info inputs
    document.getElementById('projectTitle').addEventListener('input', updateSummary);
    document.getElementById('yourName').addEventListener('input', updateSummary);

    // Initial draw
    drawChart();
    updateSummary();
});
