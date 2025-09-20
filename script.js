
// --------------------
// CCL Script.js - versión con Supabase Client

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------- Configuración Supabase ----------
const SUPABASE_URL = "https://iezdsseiuskiszarpneh.supabase.co"; // tu proyecto
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllemRzc2VpdXNraXN6YXJwbmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNDg1MDgsImV4cCI6MjA3MzgyNDUwOH0.9xDWRDr6wKckkK5VtgrCi6cPCAv0nyTfT_MLEMmkY0s"; // pega tu anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------- Descripciones de fases ----------
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
    "AI managed most project elements with human oversight"
  ],
  reflection: [
    "All reflection and analysis done independently by human.",
    "AI provided prompts or questions for reflection.",
    "AI generated initial reflection drafts for refinement.",
    "Insights emerged through reflective loops with AI.",
    "AI conducted most analysis with human validation."
  ]
};

// ---------- Abreviaturas de fases ----------
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

// ---------- Colores base ----------
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

// ---------- Niveles ----------
const levelDescriptions = [
  "Full Human Work",
  "AI for Insight",
  "AI for Drafting",
  "AI as Co-Creator",
  "AI as Driver"
];

// ---------- Ajuste de color ----------
function adjustColor(color, level) {
  let baseR = parseInt(color.substring(1,3),16);
  let baseG = parseInt(color.substring(3,5),16);
  let baseB = parseInt(color.substring(5,7),16);
  const mixFactor = level/4;
  let r = Math.round(255*(1-mixFactor)+baseR*mixFactor);
  let g = Math.round(255*(1-mixFactor)+baseG*mixFactor);
  let b = Math.round(255*(1-mixFactor)+baseB*mixFactor);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ---------- Inicialización ----------
const canvas = document.getElementById('ccl-chart');
const ctx = canvas.getContext('2d');

// ---------- Contador local ----------
function updateLicenseCounter() {
  let counter = localStorage.getItem('licenseCounter') || 0;
  counter = parseInt(counter) + 1;
  localStorage.setItem('licenseCounter', counter);
  document.getElementById('license-counter').textContent = counter;
}

// ---------- Actualizar descripción fase ----------
function updatePhaseDescription(phaseId) {
  const slider = document.getElementById(phaseId);
  const descEl = document.getElementById(`${phaseId}-desc`);
  if(descEl) descEl.textContent = phaseDescriptions[phaseId][parseInt(slider.value)];
}

// ---------- Dibujar gráfico ----------
function drawChart() {
  const phases = ['reflection','research','ideation','design','coding','prototyping','documentation','management'];
  const data = phases.map(p => parseInt(document.getElementById(p).value));
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const centerX = canvas.width/2;
  const centerY = canvas.height/2;
  const outerRadius = 100;
  const innerRadius = 30;
  const angleStep = (Math.PI*2)/phases.length;

  phases.forEach((phase,index)=>{
    const startAngle = index*angleStep - Math.PI/2;
    const endAngle = (index+1)*angleStep - Math.PI/2;
    const level = data[index];
    const color = adjustColor(sliderColors[phase], level);
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle=color;
    ctx.fill();
    ctx.strokeStyle='#fff';
    ctx.lineWidth=1;
    ctx.stroke();

    const labelAngle = startAngle + angleStep/2;
    const labelRadius = (outerRadius+innerRadius)/2;
    const labelX = centerX + Math.cos(labelAngle)*labelRadius;
    const labelY = centerY + Math.sin(labelAngle)*labelRadius;
    ctx.fillStyle='#2d3748';
    ctx.font='bold 12px sans-serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText(phaseAbbreviations[phase],labelX,labelY);
  });

  ctx.beginPath();
  ctx.arc(centerX,centerY,innerRadius,0,Math.PI*2);
  ctx.fillStyle='#f8fafc';
  ctx.fill();
  ctx.strokeStyle='#e2e8f0';
  ctx.stroke();
  ctx.fillStyle='#2d3748';
  ctx.font='bold 10px sans-serif';
  ctx.fillText('CCL',centerX,centerY-3);
  ctx.font='8px sans-serif';
  ctx.fillText('Summary',centerX,centerY+6);
}

// ---------- Actualizar summary ----------
function updateSummary() {
  const phases = ['research','ideation','design','coding','prototyping','documentation','management','reflection'];
  const levels = phases.map(p=>parseInt(document.getElementById(p).value));
  const projectTitle = document.getElementById('projectTitle').value;
  const yourName = document.getElementById('yourName').value;

  let licenseParts = [];
  let licenseCode = "CCL ";

  phases.forEach((phase,index)=>{
    const level = levels[index];
    if(level>0) licenseCode += `${phaseAbbreviations[phase]}${level} `;
  });

  phases.forEach((phase,index)=>{
    const level = levels[index];
    if(level>0){
      const description = levelDescriptions[level];
      licenseParts.push(`AI acted as ${description} in ${phase}`);
    }
  });

  let licenseText = licenseCode.trim()+"v1.0 — "+licenseParts.join(", ") + ". All other phases were fully human-led.";

  let finalSummary="";
  if(projectTitle){
    finalSummary += `"${projectTitle}"`;
    if(yourName) finalSummary += ` by ${yourName}`;
    finalSummary += "\n\n";
  }
  finalSummary += licenseText;

  document.getElementById('summary-text').textContent = finalSummary;
}

// ---------- User ID ----------
function getUserId(){
  let id = localStorage.getItem('ccl_client_id');
  if(!id){
    id='u_'+crypto.randomUUID();
    localStorage.setItem('ccl_client_id',id);
  }
  return id;
}

// ---------- Guardar badge en Supabase ----------
async function saveLabel() {
  const userId = getUserId();
  const projectTitle = document.getElementById('projectTitle').value;
  const yourName = document.getElementById('yourName').value;
  const phases = ['research','ideation','design','coding','prototyping','documentation','management','reflection'];
  const levels = {};
  phases.forEach(p => levels[p] = parseInt(document.getElementById(p).value));

  let country = 'Unknown';
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    country = data.country_code || 'Unknown';
  } catch {}

  const payload = { 
    user_id: userId, 
    project_title: projectTitle, 
    your_name: yourName, 
    levels, 
    country, 
    timestamp: new Date().toISOString() 
  };

  const { data, error } = await supabase
    .from('badges')   // 👈 nombre de tu tabla
    .insert([payload]);

  if (error) {
    console.error("❌ Error saving badge:", error);
  } else {
    console.log("✅ Badge saved:", data);
  }
}

// ---------- Copiar summary ----------
async function downloadSummary() {
  const summaryText = document.getElementById('summary-text').textContent;
  try{
    await navigator.clipboard.writeText(summaryText);
  }catch{
    const ta = document.createElement('textarea');
    ta.value = summaryText;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  alert('CCL Summary copied!');
  updateLicenseCounter();
  await saveLabel();
}

// ---------- Descargar badge ----------
async function downloadBadge() {
  const badgeCanvas = document.createElement('canvas');
  const size=400;
  badgeCanvas.width=size;
  badgeCanvas.height=size;
  const ctxB = badgeCanvas.getContext('2d');

  const phases=['reflection','research','ideation','design','coding','prototyping','documentation','management'];
  const colors=['#cbabd1','#6f1926','#de324c','#f4895f','#f8e16f','#95cf92','#369acc','#9656a2'];
  const levels = {};
  phases.forEach(p => levels[p] = parseInt(document.getElementById(p).value));
  const centerX=size/2, centerY=size/2, outerRadius=size/2-20, innerRadius=size/2-120;
  const angleStep=(Math.PI*2)/phases.length;

  phases.forEach((phase,index)=>{
    const startAngle=index*angleStep - Math.PI/2;
    const endAngle=(index+1)*angleStep - Math.PI/2;
    const color = adjustColor(colors[index], levels[phase]);
    ctxB.beginPath();
    ctxB.moveTo(centerX,centerY);
    ctxB.arc(centerX,centerY,outerRadius,startAngle,endAngle);
    ctxB.lineTo(centerX,centerY);
    ctxB.closePath();
    ctxB.fillStyle=color;
    ctxB.fill();
    ctxB.strokeStyle='#fff';
    ctxB.stroke();

    const labelAngle=startAngle+angleStep/2;
    const labelRadius=(outerRadius+innerRadius)/2;
    const labelX=centerX+Math.cos(labelAngle)*labelRadius;
    const labelY=centerY+Math.sin(labelAngle)*labelRadius;
    ctxB.fillStyle='#2d3748';
    ctxB.font='bold 16px sans-serif';
    ctxB.textAlign='center';
    ctxB.textBaseline='middle';
    ctxB.fillText(phaseAbbreviations[phase],labelX,labelY);
  });

  ctxB.beginPath();
  ctxB.arc(centerX,centerY,innerRadius,0,Math.PI*2);
  ctxB.fillStyle='white';
  ctxB.fill();
  ctxB.strokeStyle='#e2e8f0';
  ctxB.stroke();
  ctxB.fillStyle='#2d3748';
  ctxB.font='bold 12px sans-serif';
  ctxB.fillText('COGNITIVE CONTRIBUTION',centerX,centerY-15);
  ctxB.fillText('LICENSE',centerX,centerY+5);
  ctxB.font='10px sans-serif';
  ctxB.fillText('v1.0 (CCL)',centerX,centerY+20);

  const link=document.createElement('a');
  link.download='ccl-badge.png';
  link.href=badgeCanvas.toDataURL('image/png');
  link.click();

  updateLicenseCounter();
  await saveLabel();
}

// ---------- Event listeners ----------
document.addEventListener('DOMContentLoaded',()=>{
  const phases = ['research','ideation','design','coding','prototyping','documentation','management','reflection'];
  phases.forEach(p=>{
    updatePhaseDescription(p);
    const el = document.getElementById(p);
    if(el){
      el.addEventListener('input',()=>{
        updatePhaseDescription(p);
        drawChart();
        updateSummary();
      });
    }
  });
  drawChart();
  updateSummary();

  document.getElementById('download-summary-btn').addEventListener('click', downloadSummary);
  document.getElementById('download-badge-btn').addEventListener('click', downloadBadge);
});

