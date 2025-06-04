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

// Base colors for each phase - matching the slider colors
const phaseBaseColors = {
    research: '#3b82f6',      // Blue
    ideation: '#10b981',      // Green
    design: '#f59e0b',        // Amber
    coding: '#ef4444',        // Red
    prototyping: '#8b5cf6',   // Purple
    documentation: '#06b6d4', // Cyan
    management: '#f97316',    // Orange
    reflection: '#84cc16'     // Lime
};

// Function to create gradient colors based on level (0-4)
function getPhaseColor(phase, level) {
    const baseColor = phaseBaseColors[phase];
    
    if (level === 0) {
        // Very light version for "Full Human Work"
        return lightenColor(baseColor, 80);
    } else if (level === 1) {
        return lightenColor(baseColor, 50);
    } else if (level === 2) {
        return lightenColor(baseColor, 20);
    } else if (level === 3) {
        return baseColor;
    } else if (level === 4) {
        // Darker version for "AI as Driver"
        return darkenColor(baseColor, 20);
    }
    return baseColor;
}

// Function to lighten a color
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Function to darken a color
function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
        (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
        (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
}

// Initialize chart
let chart;
const canvas = document.getElementById('ccl-chart');
const ctx = canvas.getContext('2d');

// Function to update the license counter (using in-memory storage instead of localStorage)
let licenseCounter = 0;
function updateLicenseCounter() {
    licenseCounter += 1;
    document.getElementById('license-counter').textContent = licenseCounter;
}

function updatePhaseDescription(phaseId) {
    const slider = document.getElementById(phaseId);
    const description = document.getElementById(phaseId + '-desc');
    const level = parseInt(slider.value);
    description.textContent = phaseDescriptions[phaseId][level];
}

function drawChart() {
    const phases = ['research', 'ideation', 'design', 'coding', 'prototyping', 'documentation', 'management', 'reflection'];
    const phaseLabels = ['Research', 'Ideation', 'Design', 'Coding', 'Prototyping', 'Documentation', 'Management', 'Reflection'];
    const data = phases.map(phase => parseInt(document.getElementById(phase).value));

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 100;
    const innerRadius = 30;

    // Draw segments
    const angleStep = (Math.PI * 2) / phases.length;

    phases.forEach((phase, index) => {
        const level = data[index];
        const startAngle = index * angleStep - Math.PI / 2;
        const endAngle = (index + 1) * angleStep - Math.PI / 2;

        // Get color based on phase and level
        const segmentColor = getPhaseColor(phase, level);

        // Draw segment
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = segmentColor;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw phase label inside the segment
        const labelAngle = startAngle + angleStep / 2;
        const labelRadius = (outerRadius + innerRadius) / 2;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;

        // Set text style
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add text shadow for better readability
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        // Draw the first letter of each phase
        ctx.fillText(phaseLabels[index].charAt(0), labelX, labelY);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center text
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CCL', centerX, centerY - 5);
    ctx.font = '8px sans-serif';
    ctx.fillText('v1.0', centerX, centerY + 8);
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
    // Create a temporary canvas for the badge with transparent background
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 400;
    badgeCanvas.height = 200;
    const badgeCtx = badgeCanvas.getContext('2d');

    // Don't fill background - keep it transparent for PNG

    // Draw mini chart (enlarged)
    const phases = ['research', 'ideation', 'design', 'coding', 'prototyping', 'documentation', 'management', 'reflection'];
    const phaseLabels = ['Research', 'Ideation', 'Design', 'Coding', 'Prototyping', 'Documentation', 'Management', 'Reflection'];
    const data = phases.map(phase => parseInt(document.getElementById(phase).value));

    const centerX = 200;
    const centerY = 100;
    const outerRadius = 80;
    const innerRadius = 25;
    const angleStep = (Math.PI * 2) / phases.length;

    // Draw chart segments
    phases.forEach((phase, index) => {
        const level = data[index];
        const startAngle = index * angleStep - Math.PI / 2;
        const endAngle = (index + 1) * angleStep - Math.PI / 2;

        // Get color based on phase and level
        const segmentColor = getPhaseColor(phase, level);

        // Draw segment
        badgeCtx.beginPath();
        badgeCtx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        badgeCtx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        badgeCtx.closePath();
        badgeCtx.fillStyle = segmentColor;
        badgeCtx.fill();
        badgeCtx.strokeStyle = '#fff';
        badgeCtx.lineWidth = 2;
        badgeCtx.stroke();

        // Draw phase label inside the segment
        const labelAngle = startAngle + angleStep / 2;
        const labelRadius = (outerRadius + innerRadius) / 2;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;

        // Set text style
        badgeCtx.fillStyle = '#ffffff';
        badgeCtx.font = 'bold 12px sans-serif';
        badgeCtx.textAlign = 'center';
        badgeCtx.textBaseline = 'middle';
        
        // Add text shadow for better readability
        badgeCtx.shadowColor = 'rgba(0,0,0,0.7)';
        badgeCtx.shadowBlur = 3;
        badgeCtx.shadowOffsetX = 1;
        badgeCtx.shadowOffsetY = 1;
        
        // Draw the first letter of each phase
        badgeCtx.fillText(phaseLabels[index].charAt(0), labelX, labelY);
        
        // Reset shadow
        badgeCtx.shadowColor = 'transparent';
        badgeCtx.shadowBlur = 0;
        badgeCtx.shadowOffsetX = 0;
        badgeCtx.shadowOffsetY = 0;
    });

    // Draw center circle
    badgeCtx.beginPath();
    badgeCtx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    badgeCtx.fillStyle = '#f8fafc';
    badgeCtx.fill();
    badgeCtx.strokeStyle = '#e2e8f0';
    badgeCtx.lineWidth = 2;
    badgeCtx.stroke();

    // Center text
    badgeCtx.fillStyle = '#2d3748';
    badgeCtx.font = 'bold 14px sans-serif';
    badgeCtx.textAlign = 'center';
    badgeCtx.textBaseline = 'middle';
    badgeCtx.fillText('CCL', centerX, centerY - 3);
    badgeCtx.font = '10px sans-serif';
    badgeCtx.fillText('v1.0', centerX, centerY + 10);

    // Download as PNG with transparent background
    const link = document.createElement('a');
    link.download = 'ccl-badge.png';
    link.href = badgeCanvas.toDataURL('image/png');
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
    document.getElementById('license-counter').textContent = licenseCounter;

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