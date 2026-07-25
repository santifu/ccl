/* ══════════════════════════════════════════════════════════════
   CCL Generator v2 — script_v2.js
   Cognitive Contribution Label · AI-first + Human-first
   Santi Fuentemilla @ Fab Lab Barcelona
   ══════════════════════════════════════════════════════════════ */

'use strict';

// ── CONSTANTS ──────────────────────────────────────────────────
// config.js overrides this if present (local dev); otherwise URL is used directly
const GS_URL = (typeof GOOGLE_SCRIPT_URL !== 'undefined')
  ? GOOGLE_SCRIPT_URL
  : 'https://script.google.com/macros/s/AKfycbziUeI2JKskuJDuRorVzBgl7dG3b7iqFWzCGWkWkCIVIlafnTw7Ji0mpvclj4-NvqwCBQ/exec';
const LANGS  = ['en','es','ca','pt','fr','de'];

// ── STATE ──────────────────────────────────────────────────────
let currentMode = 0;          // 0=AI-first 1=Human-first 2=Both
let currentLang = 'en';
let sliderValues = [0,0,0,0,0,0,0,0];   // AI phases R I D C P O M F
let huValues     = [0,0,0,0,0,0];        // HU dims   E L R B K J
let labelId      = '';                    // unique id per label (CCL-YYYY-XXXXXX)

// ── AI PHASE DATA ──────────────────────────────────────────────
// 8 phases: R I D C P O M F
// Each level (0-4) has a short dynamic description shown under the slider
const AI_DATA = [
  { code:'R', key:'research',
    levels:[
      'All sources found and filtered manually.',
      'AI helped surface references; you evaluated them.',
      'AI generated summaries and literature maps you revised.',
      'Iterative AI search shaped the conceptual frame.',
      'AI drove the literature review; you curated results.'
    ]
  },
  { code:'I', key:'ideation',
    levels:[
      'Ideas emerged from your own thinking.',
      'AI sparked options; you chose the direction.',
      'AI drafts seeded concepts you reworked.',
      'Back-and-forth with AI shaped the core idea.',
      'AI generated the concept; you refined and selected.'
    ]
  },
  { code:'D', key:'design',
    levels:[
      'All aesthetic and structural decisions were yours.',
      'AI offered alternatives; you decided.',
      'AI produced early mockups or layouts you reworked.',
      'Visual language emerged through human-AI iteration.',
      'AI generated the design system; you curated.'
    ]
  },
  { code:'C', key:'coding',
    levels:[
      'Code written entirely by hand.',
      'AI suggested snippets; you wrote and integrated.',
      'AI drafted functions you debugged and rewrote.',
      'Most logic co-developed with AI in conversation.',
      'AI produced the codebase; you reviewed and edited.'
    ]
  },
  { code:'P', key:'prototyping',
    levels:[
      'Built entirely by hand — materials, assembly, iteration.',
      'AI informed decisions; physical making was yours.',
      'AI generated plans or templates you adapted.',
      'Fabrication pipeline co-designed with AI.',
      'AI-driven fabrication (CAM, generative toolpaths); you supervised.'
    ]
  },
  { code:'O', key:'documentation',
    levels:[
      'Written and structured entirely by you.',
      'AI helped structure or proofread; writing was yours.',
      'AI drafted sections you revised substantially.',
      'Documentation co-written with AI in iterations.',
      'AI produced most documentation; you edited and approved.'
    ]
  },
  { code:'M', key:'management',
    levels:[
      'Planning, scheduling, coordination fully manual.',
      'AI suggested timelines or tasks; you organised.',
      'AI drafted plans or briefs you restructured.',
      'Project flow shaped through ongoing AI consultation.',
      'AI managed task breakdown and coordination; you reviewed.'
    ]
  },
  { code:'F', key:'reflection',
    levels:[
      'Evaluation came from your own judgment and feedback.',
      'AI offered criteria; you assessed.',
      'AI generated feedback summaries you interrogated.',
      'Iterative AI critique shaped revisions.',
      'AI evaluated outputs and proposed next steps; you approved.'
    ]
  }
];

// ── HUMAN-FIRST DIMENSION DATA ─────────────────────────────────
// 6 maker dimensions: E L R B K J
const HU_DATA = [
  { code:'E', key:'experience',
    levels:[
      'This project doesn\'t draw on lived experience.',
      'Personal background lightly informs framing.',
      'Lived experience shaped key choices.',
      'The work is substantially grounded in what you have lived.',
      'Only someone who lived this could have made this.'
    ]
  },
  { code:'L', key:'local',
    levels:[
      'No place-specific or community knowledge required.',
      'Some local context informs the work.',
      'Place, language, or community knowledge shaped the outcome.',
      'Deep local knowledge was central — unavailable in training data.',
      'The work is inseparable from a specific place or community.'
    ]
  },
  { code:'R', key:'relationship',
    levels:[
      'No access through personal trust or community.',
      'Some contacts helped; not essential.',
      'Relationships opened doors that changed the project.',
      'The work depends on trust built over time.',
      'Without specific relationships, this project could not exist.'
    ]
  },
  { code:'B', key:'body',
    levels:[
      'Physical presence or touch was not involved.',
      'Making with hands was part of the process.',
      'Embodied skill and tactile judgment shaped the outcome.',
      'The work depends on physical intuition developed over years.',
      'This is fundamentally craft — irreducible to instructions.'
    ]
  },
  { code:'K', key:'risk',
    levels:[
      'No technical risk or irreversibility was involved.',
      'Some decisions had real consequences if wrong.',
      'Critical choices had no undo — skill determined the outcome.',
      'Workmanship of risk was central: failure was visible and personal.',
      'The whole work is a wager — only your skill and judgment stood between success and failure.'
    ]
  },
  { code:'J', key:'judgment',
    levels:[
      'Decisions followed clear criteria or instructions.',
      'Some intuitive calls, but mostly explicable.',
      'Key decisions came from taste or instinct you can partly explain.',
      'Central choices came from judgment you can\'t fully articulate.',
      'The work is held together by phronesis — wisdom you can\'t reduce to rules.'
    ]
  }
];

// ── ARCHETYPES ─────────────────────────────────────────────────
const ARCHETYPES = {
  augmented: {
    key: 'augmented',
    name: { en:'Augmented', es:'Aumentado', ca:'Augmentat', pt:'Aumentado', fr:'Augmenté', de:'Augmentiert' },
    sub:  { en:'High AI + High Human', es:'Alta IA + Alto humano', ca:'Alta IA + Alt humà', pt:'Alta IA + Alto humano', fr:'IA élevée + Humain élevé', de:'Hohe KI + Hoher Mensch' },
    long: { en:'AI handled significant parts of this project, and yet what you brought — lived context, embodied skill, trusted relationships, irreversible judgments — could not have been supplied by any model. This is the productive tension of augmented authorship: tools extend reach while the irreplaceable remains yours.',
            es:'La IA gestionó partes significativas de este proyecto, y aun así lo que aportaste — contexto vivido, habilidad incorporada, relaciones de confianza, juicios irreversibles — ningún modelo podría haberlo proporcionado. Esta es la tensión productiva de la autoría aumentada.',
            ca:'La IA va gestionar parts significatives d\'aquest projecte, i tot i així el que vas aportar — context viscut, habilitat corporal, relacions de confiança, judicis irreversibles — cap model ho podria haver fornit.',
            pt:'A IA tratou de partes significativas deste projecto, e ainda assim o que trouxe — contexto vivido, habilidade incorporada, relações de confiança, julgamentos irreversíveis — nenhum modelo poderia ter fornecido.',
            fr:'L\'IA a traité des parties importantes de ce projet, et pourtant ce que vous avez apporté — contexte vécu, compétence incarnée, relations de confiance, jugements irréversibles — aucun modèle ne pouvait le fournir.',
            de:'KI hat wesentliche Teile dieses Projekts übernommen, und doch konnte das, was Sie einbrachten — gelebten Kontext, verkörperte Fähigkeit, vertrauensvolle Beziehungen, irreversible Urteile — kein Modell liefern.' }
  },
  delegated: {
    key: 'delegated',
    name: { en:'Delegated', es:'Delegado', ca:'Delegat', pt:'Delegado', fr:'Délégué', de:'Delegiert' },
    sub:  { en:'High AI + Low Human', es:'Alta IA + Bajo humano', ca:'Alta IA + Baix humà', pt:'Alta IA + Baixo humano', fr:'IA élevée + Humain faible', de:'Hohe KI + Geringer Mensch' },
    long: { en:'AI did most of the heavy lifting and the work doesn\'t draw heavily on what only you could bring. That\'s not a failure — some tasks are appropriately delegated. But it\'s worth asking: where could your lived experience, local knowledge, or craft have deepened this?',
            es:'La IA hizo gran parte del trabajo y el proyecto no se apoya mucho en lo que solo tú podrías aportar. No es un fracaso — algunas tareas se delegan apropiadamente. Pero vale la pena preguntarse: ¿dónde podría tu experiencia haber profundizado esto?',
            ca:'La IA va fer gran part del treball i el projecte no es recolza molt en el que només tu podries aportar. No és un fracàs — algunes tasques es deleguen adequadament. Però val la pena preguntar-se: on podria la teva experiència haver aprofundit això?',
            pt:'A IA fez grande parte do trabalho e o projecto não se apoia muito no que só você poderia trazer. Não é um fracasso — algumas tarefas são apropriadamente delegadas. Mas vale perguntar: onde a sua experiência poderia ter aprofundado isto?',
            fr:'L\'IA a fait la majeure partie du travail et le projet ne s\'appuie pas beaucoup sur ce que vous seul pourriez apporter. Ce n\'est pas un échec — certaines tâches sont légitimement déléguées. Mais il vaut la peine de se demander : où votre expérience aurait-elle pu approfondir cela ?',
            de:'KI hat den Großteil der Arbeit erledigt und das Projekt stützt sich nicht stark auf das, was nur Sie einbringen können. Das ist kein Versagen — manche Aufgaben werden sinnvoll delegiert. Aber es lohnt sich zu fragen: Wo hätte Ihre Erfahrung dies vertiefen können?' }
  },
  craft: {
    key: 'craft',
    name: { en:'Craft', es:'Artesanía', ca:'Artesania', pt:'Artesanato', fr:'Artisanat', de:'Handwerk' },
    sub:  { en:'Low AI + High Human', es:'Baja IA + Alto humano', ca:'Baixa IA + Alt humà', pt:'Baixa IA + Alto humano', fr:'IA faible + Humain élevé', de:'Geringe KI + Hoher Mensch' },
    long: { en:'AI played a minimal role. What shaped this work was you: your hands, your relationships, your local knowledge, your willingness to stake something on the outcome. In Pye\'s terms: you chose the workmanship of risk over the workmanship of certainty.',
            es:'La IA jugó un papel mínimo. Lo que dio forma a este trabajo fuiste tú: tus manos, tus relaciones, tu conocimiento local, tu disposición a apostar algo en el resultado. En términos de Pye: elegiste el dominio del riesgo sobre el dominio de la certeza.',
            ca:'La IA va tenir un paper mínim. El que va donar forma a aquest treball vas ser tu: les teves mans, les teves relacions, el teu coneixement local, la teva disposició a arriscar alguna cosa en el resultat.',
            pt:'A IA teve um papel mínimo. O que moldou este trabalho foi você: suas mãos, seus relacionamentos, seu conhecimento local, sua disposição de arriscar algo no resultado.',
            fr:'L\'IA a joué un rôle minimal. Ce qui a façonné ce travail, c\'est vous : vos mains, vos relations, votre savoir local, votre volonté d\'engager quelque chose dans le résultat.',
            de:'KI spielte eine minimale Rolle. Was diese Arbeit geprägt hat, waren Sie: Ihre Hände, Ihre Beziehungen, Ihr lokales Wissen, Ihre Bereitschaft, etwas auf das Ergebnis zu setzen.' }
  },
  routine: {
    key: 'routine',
    name: { en:'Routine', es:'Rutina', ca:'Rutina', pt:'Rotina', fr:'Routine', de:'Routine' },
    sub:  { en:'Low AI + Low Human', es:'Baja IA + Bajo humano', ca:'Baixa IA + Baix humà', pt:'Baixa IA + Baixo humano', fr:'IA faible + Humain faible', de:'Geringe KI + Geringer Mensch' },
    long: { en:'Neither AI nor your unique human contribution was strongly present. This is fine — not everything needs to be transformative. Routine tasks are real and necessary. The label is simply honest about what this work was.',
            es:'Ni la IA ni tu contribución humana única estuvieron muy presentes. Está bien — no todo tiene que ser transformador. Las tareas rutinarias son reales y necesarias. La etiqueta simplemente es honesta sobre lo que fue este trabajo.',
            ca:'Ni la IA ni la teva contribució humana única van estar molt presents. Està bé — no tot ha de ser transformador. Les tasques rutinàries són reals i necessàries.',
            pt:'Nem a IA nem a sua contribuição humana única estiveram muito presentes. Está bem — nem tudo precisa ser transformador. Tarefas rotineiras são reais e necessárias.',
            fr:'Ni l\'IA ni votre contribution humaine unique n\'étaient fortement présentes. C\'est acceptable — tout n\'a pas besoin d\'être transformateur. Les tâches routinières sont réelles et nécessaires.',
            de:'Weder KI noch Ihr einzigartiger menschlicher Beitrag waren stark präsent. Das ist in Ordnung — nicht alles muss transformativ sein. Routineaufgaben sind real und notwendig.' }
  }
};

// ── LEVEL NAMES (AI-first) ─────────────────────────────────────
const LEVEL_NAMES = {
  en: ['Full Human','AI for Insight','AI for Drafting','AI as Co-Creator','AI as Driver'],
  es: ['Humano total','IA para inspirar','IA para borradores','IA co-creadora','IA al mando'],
  ca: ['Humà total','IA per inspirar','IA per esborranys','IA co-creadora','IA al comandament'],
  pt: ['Humano total','IA para inspirar','IA para rascunhos','IA co-criadora','IA no comando'],
  fr: ['Humain total','IA pour l\'inspiration','IA pour les ébauches','IA co-créatrice','IA au commande'],
  de: ['Vollständig human','KI für Einsicht','KI für Entwürfe','KI als Mitschöpfer','KI als Treiber']
};

// ── TRANSLATIONS ───────────────────────────────────────────────
const T = {
  en: {
    mode_ai_label:   'AI-first',
    mode_ai_sub:     'How much did AI contribute?\n8 phases · levels 0–4',
    mode_hu_label:   'Human-first',
    mode_hu_sub:     'What only you could bring?\n6 dimensions · levels 0–4',
    mode_both_label: 'Both',
    mode_both_sub:   'Full authorship profile.\n8 + 6 · authorship archetype',
    btn_start:       'Start →',
    btn_back:        '← Back',
    btn_done:        'Done →',
    btn_human_start: 'Human-first →',
    btn_result:      'See result →',
    btn_what_means:  '+ what this means',
    btn_read_summary:'+ read full summary',
    btn_download:    '↓ Download',
    btn_copy:        '⎘ Copy code',
    copied_msg:      'Copied!',
    ai_sec_title:    '8 project phases',
    ai_sec_hint:     '0 = human · 4 = AI driver',
    hu_sec_title:    '6 creator dimensions',
    hu_sec_hint:     '0 = absent · 4 = dominant',
    trans_copy:      "You've assessed AI's contribution.\nNow: what only you could bring?",
    result_label:    'CCL v2 · result',
    field_project_ph:'Project title',
    field_author_ph: 'Your name',
    counter_label:   'Labels generated worldwide',
    footer_by:       'Created by',
    phase_names: ['Research & References','Ideation','Design','Coding','Prototyping','Documentation','Management','Reflection'],
    dim_names:   ['Lived Experience','Local Knowledge','Relationship','Body & Making','Technical Risk','Judgment'],
    summary_prefix: 'CCL v2',
    by_word: 'by',
    archetype_label: 'Archetype',
    ai_code_label:   'AI',
    hu_code_label:   'HU',
    landing_desc: 'Declare how AI and human skill shaped your work — a shared language for authorship in the age of AI.',
    summary_all_human: 'I believe I didn\'t use AI in any phase.',
    summary_all_hu_zero: 'No human-specific dimensions were dominant.'
  },
  es: {
    mode_ai_label:   'IA primero',
    mode_ai_sub:     '¿Cuánto contribuyó la IA?\n8 fases · niveles 0–4',
    mode_hu_label:   'Humano primero',
    mode_hu_sub:     '¿Qué solo tú pudiste aportar?\n6 dimensiones · niveles 0–4',
    mode_both_label: 'Ambos',
    mode_both_sub:   'Perfil completo de autoría.\n8 + 6 · arquetipo de autoría',
    btn_start:       'Empezar →',
    btn_back:        '← Volver',
    btn_done:        'Listo →',
    btn_human_start: 'Humano primero →',
    btn_result:      'Ver resultado →',
    btn_what_means:  '+ qué significa esto',
    btn_read_summary:'+ leer resumen completo',
    btn_download:    '↓ Descargar',
    btn_copy:        '⎘ Copiar código',
    copied_msg:      '¡Copiado!',
    ai_sec_title:    '8 fases del proyecto',
    ai_sec_hint:     '0 = humano · 4 = IA al mando',
    hu_sec_title:    '6 dimensiones del creador',
    hu_sec_hint:     '0 = ausente · 4 = dominante',
    trans_copy:      'Has evaluado la contribución de la IA.\nAhora: ¿qué solo tú pudiste aportar?',
    result_label:    'CCL v2 · resultado',
    field_project_ph:'Título del proyecto',
    field_author_ph: 'Tu nombre',
    counter_label:   'Etiquetas generadas en el mundo',
    footer_by:       'Creado por',
    phase_names: ['Investigación','Ideación','Diseño','Programación','Prototipado','Documentación','Gestión','Reflexión'],
    dim_names:   ['Experiencia vivida','Conocimiento local','Relación','Cuerpo y fabricación','Riesgo técnico','Juicio'],
    summary_prefix: 'CCL v2',
    by_word: 'de',
    archetype_label: 'Arquetipo',
    ai_code_label:   'IA',
    hu_code_label:   'HU',
    landing_desc: 'Declara cómo la IA y la habilidad humana dieron forma a tu trabajo — un lenguaje común para la autoría en la era de la IA.',
    summary_all_human: 'Creo que no usé IA en ninguna fase.',
    summary_all_hu_zero: 'Ninguna dimensión humana fue dominante.'
  },
  ca: {
    mode_ai_label:   'IA primer',
    mode_ai_sub:     'Quant va contribuir la IA?\n8 fases · nivells 0–4',
    mode_hu_label:   'Humà primer',
    mode_hu_sub:     'Què només tu podies aportar?\n6 dimensions · nivells 0–4',
    mode_both_label: 'Tots dos',
    mode_both_sub:   'Perfil complet d\'autoria.\n8 + 6 · arquetip d\'autoria',
    btn_start:       'Comença →',
    btn_back:        '← Enrere',
    btn_done:        'Fet →',
    btn_human_start: 'Humà primer →',
    btn_result:      'Veure resultat →',
    btn_what_means:  '+ què significa això',
    btn_read_summary:'+ llegir resum complet',
    btn_download:    '↓ Descarregar',
    btn_copy:        '⎘ Copiar codi',
    copied_msg:      'Copiat!',
    ai_sec_title:    '8 fases del projecte',
    ai_sec_hint:     '0 = humà · 4 = IA al comandament',
    hu_sec_title:    '6 dimensions del creador',
    hu_sec_hint:     '0 = absent · 4 = dominant',
    trans_copy:      'Has avaluat la contribució de la IA.\nAra: què només tu podies aportar?',
    result_label:    'CCL v2 · resultat',
    field_project_ph:'Títol del projecte',
    field_author_ph: 'El teu nom',
    counter_label:   'Etiquetes generades al món',
    footer_by:       'Creat per',
    phase_names: ['Recerca i referències','Ideació','Disseny','Programació','Prototipatge','Documentació','Gestió','Reflexió'],
    dim_names:   ['Experiència viscuda','Coneixement local','Relació','Cos i fabricació','Risc tècnic','Judici'],
    summary_prefix: 'CCL v2',
    by_word: 'de',
    archetype_label: 'Arquetip',
    ai_code_label:   'IA',
    hu_code_label:   'HU',
    landing_desc: 'Declara com la IA i l\'habilitat humana van donar forma al teu treball — un llenguatge comú per a l\'autoria a l\'era de la IA.',
    summary_all_human: 'Crec que no vaig usar IA en cap fase.',
    summary_all_hu_zero: 'Cap dimensió humana va ser dominant.'
  },
  pt: {
    mode_ai_label:   'IA primeiro',
    mode_ai_sub:     'Quanto a IA contribuiu?\n8 fases · níveis 0–4',
    mode_hu_label:   'Humano primeiro',
    mode_hu_sub:     'O que só você podia trazer?\n6 dimensões · níveis 0–4',
    mode_both_label: 'Ambos',
    mode_both_sub:   'Perfil completo de autoria.\n8 + 6 · arquétipo de autoria',
    btn_start:       'Começar →',
    btn_back:        '← Voltar',
    btn_done:        'Pronto →',
    btn_human_start: 'Humano primeiro →',
    btn_result:      'Ver resultado →',
    btn_what_means:  '+ o que isso significa',
    btn_read_summary:'+ ler resumo completo',
    btn_download:    '↓ Baixar',
    btn_copy:        '⎘ Copiar código',
    copied_msg:      'Copiado!',
    ai_sec_title:    '8 fases do projecto',
    ai_sec_hint:     '0 = humano · 4 = IA no comando',
    hu_sec_title:    '6 dimensões do criador',
    hu_sec_hint:     '0 = ausente · 4 = dominante',
    trans_copy:      'Avaliou a contribuição da IA.\nAgora: o que só você podia trazer?',
    result_label:    'CCL v2 · resultado',
    field_project_ph:'Título do projecto',
    field_author_ph: 'O seu nome',
    counter_label:   'Etiquetas geradas no mundo',
    footer_by:       'Criado por',
    phase_names: ['Pesquisa e referências','Ideação','Design','Programação','Prototipagem','Documentação','Gestão','Reflexão'],
    dim_names:   ['Experiência vivida','Conhecimento local','Relação','Corpo e fabricação','Risco técnico','Julgamento'],
    summary_prefix: 'CCL v2',
    by_word: 'de',
    archetype_label: 'Arquétipo',
    ai_code_label:   'IA',
    hu_code_label:   'HU',
    summary_all_human: 'Acredito que não usei IA em nenhuma fase.',
    summary_all_hu_zero: 'Nenhuma dimensão humana foi dominante.'
  },
  fr: {
    mode_ai_label:   'IA d\'abord',
    mode_ai_sub:     'Quelle a été la contribution de l\'IA ?\n8 phases · niveaux 0–4',
    mode_hu_label:   'Humain d\'abord',
    mode_hu_sub:     'Ce que vous seul pouviez apporter ?\n6 dimensions · niveaux 0–4',
    mode_both_label: 'Les deux',
    mode_both_sub:   'Profil complet d\'auteur.\n8 + 6 · archétype d\'auteur',
    btn_start:       'Commencer →',
    btn_back:        '← Retour',
    btn_done:        'Terminé →',
    btn_human_start: 'Humain d\'abord →',
    btn_result:      'Voir le résultat →',
    btn_what_means:  '+ ce que cela signifie',
    btn_read_summary:'+ lire le résumé complet',
    btn_download:    '↓ Télécharger',
    btn_copy:        '⎘ Copier le code',
    copied_msg:      'Copié !',
    ai_sec_title:    '8 phases du projet',
    ai_sec_hint:     '0 = humain · 4 = IA au commande',
    hu_sec_title:    '6 dimensions du créateur',
    hu_sec_hint:     '0 = absent · 4 = dominant',
    trans_copy:      'Vous avez évalué la contribution de l\'IA.\nMaintenant : ce que vous seul pouviez apporter ?',
    result_label:    'CCL v2 · résultat',
    field_project_ph:'Titre du projet',
    field_author_ph: 'Votre nom',
    counter_label:   'Étiquettes générées dans le monde',
    footer_by:       'Créé par',
    phase_names: ['Recherche et références','Idéation','Design','Programmation','Prototypage','Documentation','Gestion','Réflexion'],
    dim_names:   ['Expérience vécue','Connaissance locale','Relation','Corps et fabrication','Risque technique','Jugement'],
    summary_prefix: 'CCL v2',
    by_word: 'par',
    archetype_label: 'Archétype',
    ai_code_label:   'IA',
    hu_code_label:   'HU',
    summary_all_human: 'Je crois n\'avoir utilisé aucune IA dans aucune phase.',
    summary_all_hu_zero: 'Aucune dimension humaine n\'était dominante.'
  },
  de: {
    mode_ai_label:   'KI zuerst',
    mode_ai_sub:     'Wie viel hat die KI beigetragen?\n8 Phasen · Stufen 0–4',
    mode_hu_label:   'Mensch zuerst',
    mode_hu_sub:     'Was nur Sie einbringen konnten?\n6 Dimensionen · Stufen 0–4',
    mode_both_label: 'Beides',
    mode_both_sub:   'Vollständiges Autorprofil.\n8 + 6 · Autorarchetyp',
    btn_start:       'Starten →',
    btn_back:        '← Zurück',
    btn_done:        'Fertig →',
    btn_human_start: 'Mensch zuerst →',
    btn_result:      'Ergebnis anzeigen →',
    btn_what_means:  '+ was das bedeutet',
    btn_read_summary:'+ vollständige Zusammenfassung lesen',
    btn_download:    '↓ Herunterladen',
    btn_copy:        '⎘ Code kopieren',
    copied_msg:      'Kopiert!',
    ai_sec_title:    '8 Projektphasen',
    ai_sec_hint:     '0 = human · 4 = KI als Treiber',
    hu_sec_title:    '6 Schöpferdimensionen',
    hu_sec_hint:     '0 = abwesend · 4 = dominant',
    trans_copy:      'Sie haben den Beitrag der KI bewertet.\nJetzt: Was nur Sie einbringen konnten?',
    result_label:    'CCL v2 · Ergebnis',
    field_project_ph:'Projekttitel',
    field_author_ph: 'Ihr Name',
    counter_label:   'Weltweit generierte Labels',
    footer_by:       'Erstellt von',
    phase_names: ['Recherche & Referenzen','Ideenfindung','Design','Programmierung','Prototyping','Dokumentation','Projektmanagement','Reflexion'],
    dim_names:   ['Gelebte Erfahrung','Lokales Wissen','Beziehung','Körper & Herstellung','Technisches Risiko','Urteilsvermögen'],
    summary_prefix: 'CCL v2',
    by_word: 'von',
    archetype_label: 'Archetyp',
    ai_code_label:   'KI',
    hu_code_label:   'HU',
    summary_all_human: 'Ich glaube, ich habe in keiner Phase KI verwendet.',
    summary_all_hu_zero: 'Keine menschliche Dimension war dominant.'
  }
};

// ── HELPERS ─────────────────────────────────────────────────────
function t(key) { return (T[currentLang] || T.en)[key] || key; }

// ── Unique label id ─────────────────────────────────────────────
function makeId() {
  const y = new Date().getFullYear();
  const rnd = (Date.now().toString(36) + Math.random().toString(36).slice(2))
                .toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-6);
  return `CCL-${y}-${rnd}`;
}
function ensureId() {
  if (!labelId) labelId = makeId();
  return labelId;
}

function calcArchetype() {
  const aiMean = sliderValues.reduce((a,b)=>a+b,0) / sliderValues.length;
  const huMean = huValues.reduce((a,b)=>a+b,0) / huValues.length;
  const hiAI = aiMean >= 2.0;
  const hiHU = huMean >= 2.0;
  if (hiAI && hiHU)  return ARCHETYPES.augmented;
  if (hiAI && !hiHU) return ARCHETYPES.delegated;
  if (!hiAI && hiHU) return ARCHETYPES.craft;
  return ARCHETYPES.routine;
}

function lastHuScreen() {
  // Back from results: AI-only → s1, Human-only or Both → s3
  return currentMode === 0 ? 1 : 3;
}

function prevHuScreen() {
  // Back button inside s3: Human-only → s0, Both → s2
  return currentMode === 1 ? 0 : 2;
}

function togInfo() {
  document.getElementById('infoOverlay').classList.toggle('on');
}

function togX(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('on');
  const btn = el.previousElementSibling;
  if (btn && btn.classList.contains('expand-btn')) {
    const isOpen = el.classList.contains('on');
    const base = btn.getAttribute('data-i18n');
    const baseText = t(base) || btn.textContent;
    btn.textContent = isOpen ? baseText.replace(/^\+/, '−') : baseText.replace(/^−/, '+');
  }
}

// ── LANGUAGE ────────────────────────────────────────────────────
function setLang(lang) {
  if (!LANGS.includes(lang)) lang = 'en';
  currentLang = lang;
  localStorage.setItem('ccl-lang', lang);
  applyTranslations();
  renderLangBars();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val) el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    const val = t(key);
    if (val) el.placeholder = val;
  });
  // Re-render dynamic phase/dim names inside rows
  document.querySelectorAll('.pr-name[data-phase-idx]').forEach(el => {
    const idx = parseInt(el.getAttribute('data-phase-idx'));
    el.textContent = t('phase_names')[idx] || AI_DATA[idx].key;
  });
  document.querySelectorAll('.pr-name[data-dim-idx]').forEach(el => {
    const idx = parseInt(el.getAttribute('data-dim-idx'));
    el.textContent = t('dim_names')[idx] || HU_DATA[idx].key;
  });
  // Re-render level labels
  document.querySelectorAll('.pr-lvl[data-phase-idx]').forEach(el => {
    const idx = parseInt(el.getAttribute('data-phase-idx'));
    el.textContent = LEVEL_NAMES[currentLang][sliderValues[idx]];
  });
  document.querySelectorAll('.pr-lvl[data-dim-idx]').forEach(el => {
    const idx = parseInt(el.getAttribute('data-dim-idx'));
    el.textContent = LEVEL_NAMES[currentLang][huValues[idx]];
  });
}

function renderLangBars() {
  // langBar0 is now inside s0-header (dark bg), rest are in colored topbars
  ['langBar0','langBar1','langBar3','langBar4'].forEach(id => {
    const bar = document.getElementById(id);
    if (!bar) return;
    bar.innerHTML = '';
    LANGS.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = 'lang-btn' + (lang === currentLang ? ' active' : '');
      btn.textContent = lang.toUpperCase();
      btn.onclick = () => setLang(lang);
      bar.appendChild(btn);
    });
  });
}

// ── BUILD ROWS ──────────────────────────────────────────────────
function buildAllRows() {
  buildAIRows();
  buildHURows();
  buildLiveBars();
}

function buildLiveBars() {
  buildLiveBar('liveBarAI', AI_DATA, sliderValues, 'AI');
  buildLiveBar('liveBarHU', HU_DATA, huValues, 'HU');
}

function buildLiveBar(containerId, data, values, prefix) {
  const bar = document.getElementById(containerId);
  if (!bar) return;
  bar.innerHTML = '';

  const pfx = document.createElement('span');
  pfx.className = 'lb-prefix';
  pfx.textContent = prefix + ':';
  bar.appendChild(pfx);

  data.forEach((item, i) => {
    const chip = document.createElement('div');
    chip.className = 'lb-chip' + (values[i] > 0 ? ' lit' : '');
    chip.id = `${containerId}-chip-${i}`;
    chip.innerHTML = `<span class="lv">${values[i]}</span><span class="lc">${item.code}</span>`;
    bar.appendChild(chip);
  });
}

function buildAIRows() {
  const container = document.getElementById('aiRows');
  if (!container) return;
  container.innerHTML = '';
  AI_DATA.forEach((phase, i) => {
    const row = document.createElement('div');
    row.className = 'phase-row';
    row.innerHTML = `
      <div class="pr-code">${phase.code}</div>
      <div class="pr-body">
        <div class="pr-top">
          <div class="pr-name" data-phase-idx="${i}">${(t('phase_names')||[])[i]||phase.key}</div>
          <div class="pr-slider-wrap">
            <input type="range" min="0" max="4" step="1" value="${sliderValues[i]}"
              oninput="updAI(${i}, +this.value)">
          </div>
          <div class="pr-lvl" data-phase-idx="${i}">${LEVEL_NAMES[currentLang][sliderValues[i]]}</div>
        </div>
        <div class="pr-desc" id="ai-desc-${i}">${phase.levels[sliderValues[i]]}</div>
      </div>`;
    container.appendChild(row);
  });
}

function buildHURows() {
  const container = document.getElementById('huRows');
  if (!container) return;
  container.innerHTML = '';
  HU_DATA.forEach((dim, i) => {
    const row = document.createElement('div');
    row.className = 'phase-row';
    row.innerHTML = `
      <div class="pr-code">${dim.code}</div>
      <div class="pr-body">
        <div class="pr-top">
          <div class="pr-name" data-dim-idx="${i}">${(t('dim_names')||[])[i]||dim.key}</div>
          <div class="pr-slider-wrap">
            <input type="range" min="0" max="4" step="1" value="${huValues[i]}"
              oninput="updHU(${i}, +this.value)">
          </div>
          <div class="pr-lvl" data-dim-idx="${i}">${LEVEL_NAMES[currentLang][huValues[i]]}</div>
        </div>
        <div class="pr-desc" id="hu-desc-${i}">${dim.levels[huValues[i]]}</div>
      </div>`;
    container.appendChild(row);
  });
}

// ── SLIDER UPDATES ──────────────────────────────────────────────
function updAI(i, v) {
  sliderValues[i] = v;
  const lvlEl = document.querySelector(`.pr-lvl[data-phase-idx="${i}"]`);
  if (lvlEl) lvlEl.textContent = LEVEL_NAMES[currentLang][v];
  const descEl = document.getElementById(`ai-desc-${i}`);
  if (descEl) descEl.textContent = AI_DATA[i].levels[v];
  // Live bar update
  const chip = document.getElementById(`liveBarAI-chip-${i}`);
  if (chip) {
    chip.querySelector('.lv').textContent = v;
    chip.classList.toggle('lit', v > 0);
  }
}

function updHU(i, v) {
  huValues[i] = v;
  const lvlEl = document.querySelector(`.pr-lvl[data-dim-idx="${i}"]`);
  if (lvlEl) lvlEl.textContent = LEVEL_NAMES[currentLang][v];
  const descEl = document.getElementById(`hu-desc-${i}`);
  if (descEl) descEl.textContent = HU_DATA[i].levels[v];
  // Live bar update
  const chip = document.getElementById(`liveBarHU-chip-${i}`);
  if (chip) {
    chip.querySelector('.lv').textContent = v;
    chip.classList.toggle('lit', v > 0);
  }
}

// ── DOTS ────────────────────────────────────────────────────────
function renderDots() {
  // screens: 0=mode, 1=ai, 2=trans, 3=hu, 4=result
  const totalSteps = currentMode === 0 ? 2 : currentMode === 1 ? 2 : 4;
  // Map screenId to dot index
  const dotConfigs = {
    dots0: { total: 1, current: 0 },
    dots1: { total: currentMode===2?4:2, current: 1 },
    dots2: { total: 4, current: 2 },
    dots3: { total: currentMode===1?2:4, current: currentMode===1?1:3 },
    dots4: { total: currentMode===0?2: currentMode===1?2:4, current: currentMode===0?1:currentMode===1?1:3 }
  };
  Object.entries(dotConfigs).forEach(([id, cfg]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < cfg.total; i++) {
      const d = document.createElement('div');
      d.className = 'tb-dot' + (i === cfg.current ? ' on' : i < cfg.current ? ' done' : '');
      el.appendChild(d);
    }
  });
}

// ── NAVIGATION ──────────────────────────────────────────────────
let _currentScreenIdx = 0;

function go(screenIdx) {
  const prev = document.getElementById('s' + _currentScreenIdx);
  const next = document.getElementById('s' + screenIdx);
  if (!next) return;

  const goingForward = screenIdx > _currentScreenIdx
    || (_currentScreenIdx === 3 && screenIdx === 4)
    || (_currentScreenIdx === 0); // always animate leaving landing

  // Hide current
  if (prev) prev.classList.remove('active');

  // Show next with animation if going forward
  next.classList.remove('slide-in');
  // Force reflow so animation re-triggers
  void next.offsetWidth;
  next.classList.add('active');
  if (goingForward) next.classList.add('slide-in');

  // Remove animation class after it's done
  next.addEventListener('animationend', () => next.classList.remove('slide-in'), { once: true });

  _currentScreenIdx = screenIdx;
  window.scrollTo(0, 0);
}

function goBack() { go(0); }

function pickMode(idx) {
  currentMode = idx;
}

function pickAndStart(idx) {
  currentMode = idx;
  renderDots();
  _currentScreenIdx = 0; // coming from landing
  if (idx === 0) go(1);
  else if (idx === 1) go(3);
  else go(1); // Both: start with AI-first
}

function startFlow() {
  renderDots();
  if (currentMode === 0) go(1);
  else if (currentMode === 1) go(3);
  else go(1);
}

function aiDone() {
  if (currentMode === 2) {
    go(2); // Both → transition screen → human-first
  } else {
    // AI-only (mode 0): skip HU
    huValues = [0,0,0,0,0,0];
    showResult();
  }
}

function showResult() {
  updateResult();
  go(4);
}

// ── RESULT ──────────────────────────────────────────────────────
function updateResult() {
  const arch = calcArchetype();
  ensureId();   // assign a stable id for this label

  // Archetype name + description
  document.getElementById('archetypeName').textContent = arch.name[currentLang] || arch.name.en;
  document.getElementById('archetypeDesc').textContent = arch.sub[currentLang]  || arch.sub.en;
  document.getElementById('archX').textContent         = arch.long[currentLang] || arch.long.en;

  // Quadrant dot
  updateQuadrant();

  // Badge codes
  renderBadgeCodes();

  // All dots
  renderAllDots();

  // Full text summary
  renderSummary();
}

function updateQuadrant() {
  const aiMean = sliderValues.reduce((a,b)=>a+b,0) / sliderValues.length;
  const huMean = huValues.reduce((a,b)=>a+b,0) / huValues.length;

  // Quadrant cells: TL=Craft, TR=Augmented, BL=Routine, BR=Delegated
  const arch = calcArchetype();
  const cells = {
    qTL: { label:'Craft',     active: arch.key==='craft' },
    qTR: { label:'Augmented', active: arch.key==='augmented' },
    qBL: { label:'Routine',   active: arch.key==='routine' },
    qBR: { label:'Delegated', active: arch.key==='delegated' }
  };
  Object.entries(cells).forEach(([id, cfg]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = cfg.label;
    el.className = 'qc2 ' + (cfg.active ? 'hi' : 'lo');
  });

  // Dot position: X=AI(0→right), Y=HU(0→bottom)
  const dot = document.getElementById('qdot');
  if (dot) {
    const pct = (v) => (v / 4) * 100;
    const left = pct(aiMean / 4 * 4);   // 0-100% left = low AI to high AI
    const top  = 100 - pct(huMean / 4 * 4); // invert: high HU = top
    dot.style.left = `calc(${left}% - 6px)`;
    dot.style.top  = `calc(${top}%  - 6px)`;
  }
}

function renderBadgeCodes() {
  const container = document.getElementById('badgeCodes');
  if (!container) return;
  container.innerHTML = '';

  // AI code
  const aiCode = sliderValues.map((v,i) => v > 0 ? AI_DATA[i].code + v : null).filter(Boolean).join(' ');
  if (aiCode || currentMode !== 1) {
    const aiSpan = document.createElement('div');
    aiSpan.className = 'bcode ai';
    aiSpan.textContent = 'AI: ' + (aiCode || '—') + ' – v2.0';
    container.appendChild(aiSpan);
  }

  // HU code
  const huCode = huValues.map((v,i) => v > 0 ? HU_DATA[i].code + v : null).filter(Boolean).join(' ');
  if (huCode || currentMode !== 0) {
    const huSpan = document.createElement('div');
    huSpan.className = 'bcode hu';
    huSpan.textContent = 'HU: ' + (huCode || '—') + ' – v2.0';
    container.appendChild(huSpan);
  }

  // Label ID
  if (labelId) {
    const idSpan = document.createElement('div');
    idSpan.className = 'bcode';
    idSpan.style.borderColor = '#ccc';
    idSpan.style.color = '#888';
    idSpan.textContent = labelId;
    container.appendChild(idSpan);
  }
}

function renderAllDots() {
  const container = document.getElementById('allDots');
  if (!container) return;
  container.innerHTML = '';

  if (currentMode !== 1) {
    // AI dots
    sliderValues.forEach((v,i) => {
      const dot = document.createElement('div');
      dot.className = 'bdot ai';
      dot.innerHTML = `<span class="bv">${v}</span><span class="bc">${AI_DATA[i].code}</span>`;
      container.appendChild(dot);
    });
    // Separator
    if (currentMode === 2) {
      const sep = document.createElement('div');
      sep.className = 'sep-v';
      container.appendChild(sep);
    }
  }

  if (currentMode !== 0) {
    // HU dots
    huValues.forEach((v,i) => {
      const dot = document.createElement('div');
      dot.className = 'bdot hu';
      dot.innerHTML = `<span class="bv">${v}</span><span class="bc">${HU_DATA[i].code}</span>`;
      container.appendChild(dot);
    });
  }
}

function renderSummary() {
  const el = document.getElementById('sumX');
  if (!el) return;
  const lang = currentLang;
  const project = document.getElementById('projectTitle')?.value || '—';
  const author  = document.getElementById('authorName')?.value  || '—';
  const arch    = calcArchetype();

  let lines = [`${t('summary_prefix')} — "${project}" ${t('by_word')} ${author}`];
  lines.push(`${t('archetype_label')}: ${arch.name[lang] || arch.name.en}`);
  lines.push('');

  if (currentMode !== 1) {
    const aiParts = sliderValues.map((v,i)=>v>0 ? `${AI_DATA[i].code}${v}` : null).filter(Boolean);
    lines.push('AI: ' + (aiParts.length ? aiParts.join(' ') : t('summary_all_human')));
  }
  if (currentMode !== 0) {
    const huParts = huValues.map((v,i)=>v>0 ? `${HU_DATA[i].code}${v}` : null).filter(Boolean);
    lines.push('HU: ' + (huParts.length ? huParts.join(' ') : t('summary_all_hu_zero')));
  }

  el.textContent = lines.join('\n');
}

// ── COPY ────────────────────────────────────────────────────────
function copySummary() {
  renderSummary();
  const text = document.getElementById('sumX')?.textContent || '';
  navigator.clipboard.writeText(text).then(() => {
    const msg = document.getElementById('copiedMsg');
    if (msg) { msg.style.display = 'inline'; setTimeout(()=>{ msg.style.display='none'; }, 2000); }
    saveLabel(); // same as original script.js
  });
}

// ── SAVE TO GOOGLE SHEETS ───────────────────────────────────────
function saveLabel() {
  const project = document.getElementById('projectTitle')?.value || '';
  const author  = document.getElementById('authorName')?.value  || '';
  const arch    = calcArchetype();

  const aiCode = sliderValues.map((v,i)=>v>0?AI_DATA[i].code+v:null).filter(Boolean).join(' ');
  const huCode = huValues.map((v,i)=>v>0?HU_DATA[i].code+v:null).filter(Boolean).join(' ');

  // Human-readable summary from the rendered text (not the code string)
  renderSummary();
  const textSummary = document.getElementById('sumX')?.textContent || '';

  const payload = {
    id: ensureId(),
    project, author,
    url: document.getElementById('projectUrl')?.value || '',
    lang: currentLang, mode: currentMode,
    archetype: arch.key,
    // code = both AI and HU together
    code: [
      aiCode ? `AI: ${aiCode}` : null,
      huCode ? `HU: ${huCode}` : null
    ].filter(Boolean).join(' | ') + ' – v2.0',
    r: sliderValues[0], i: sliderValues[1], d: sliderValues[2], c: sliderValues[3],
    p: sliderValues[4], o: sliderValues[5], m: sliderValues[6], f: sliderValues[7],
    summary: textSummary,
    // HU dimensions
    hu_code: huCode ? `${huCode} – v2.0` : '',
    e: huValues[0], l: huValues[1], rh: huValues[2], b: huValues[3],
    k: huValues[4], j: huValues[5],
    hu_summary: textSummary
  };

  // Use 'text/plain' to match what the Google Apps Script doPost() expects
  fetch(GS_URL, {
    method: 'POST',
    mode:   'no-cors',
    headers:{ 'Content-Type': 'text/plain' },
    body:   JSON.stringify(payload)
  })
  .then(() => setTimeout(loadCounter, 1500))
  .catch(()=>{});
}

// ── COUNTER ─────────────────────────────────────────────────────
function loadCounter() {
  // GET to same URL — Apps Script doGet() returns {count: N}
  fetch(GS_URL)
    .then(r => r.json())
    .then(data => {
      if (data.count !== undefined) {
        document.querySelectorAll('.ccl-counter').forEach(el => {
          el.textContent = parseInt(data.count).toLocaleString();
        });
      }
    })
    .catch(()=>{});
}

// ── DOWNLOAD BADGE (Canvas) ─────────────────────────────────────
function downloadBadge() {
  // Save to sheets first
  saveLabel();

  const project = document.getElementById('projectTitle')?.value || 'Project';
  const author  = document.getElementById('authorName')?.value  || 'Author';
  const projUrl = document.getElementById('projectUrl')?.value   || '';
  const arch    = calcArchetype();
  ensureId();

  const W = 600, H = 280;
  const canvas = document.createElement('canvas');
  canvas.width  = W * 2; // retina
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  const orange = '#E8441A';
  const teal   = '#1D9E75';
  const ink    = '#0a0a0a';
  const border = '#e0e0e0';

  // Background
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = border;
  ctx.lineWidth   = 1;
  ctx.strokeRect(.5, .5, W-1, H-1);

  // Left strip (archetype color)
  const stripColor = arch.key === 'augmented' ? '#333'
                   : arch.key === 'delegated'  ? orange
                   : arch.key === 'craft'       ? teal
                   : '#aaa';
  ctx.fillStyle = stripColor;
  ctx.fillRect(0, 0, 8, H);

  // Archetype
  ctx.font = 'normal 36px Helvetica, Arial, sans-serif';
  ctx.fillStyle = ink;
  ctx.fillText(arch.name[currentLang] || arch.name.en, 24, 52);

  // Sub
  ctx.font = 'normal 11px Helvetica, Arial, sans-serif';
  ctx.fillStyle = '#888';
  ctx.fillText(arch.sub[currentLang] || arch.sub.en, 24, 70);

  // Label ID (top-right)
  ctx.font = 'normal 9px Helvetica, Arial, sans-serif';
  ctx.fillStyle = '#bbb';
  ctx.textAlign = 'right';
  ctx.fillText(labelId, W - 24, 30);
  ctx.textAlign = 'left';

  // Project + author
  ctx.font = 'normal 12px Helvetica, Arial, sans-serif';
  ctx.fillStyle = ink;
  ctx.fillText(`"${project}" ${T[currentLang].by_word} ${author}`, 24, 95);

  // Divider
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(24, 108); ctx.lineTo(W-24, 108); ctx.stroke();

  // AI dots row
  if (currentMode !== 1) {
    ctx.font = 'bold 10px Helvetica, Arial, sans-serif';
    ctx.fillStyle = orange;
    ctx.fillText('AI', 24, 128);
    sliderValues.forEach((v, i) => {
      const x = 50 + i * 62;
      const y = 115;
      ctx.strokeStyle = '#eee';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, 54, 28);
      ctx.font = 'normal 18px Helvetica, Arial, sans-serif';
      ctx.fillStyle = v > 0 ? orange : '#ccc';
      ctx.fillText(String(v), x + 8, y + 20);
      ctx.font = 'normal 8px Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#bbb';
      ctx.fillText(AI_DATA[i].code, x + 36, y + 20);
    });
  }

  // HU dots row
  if (currentMode !== 0) {
    const yOff = currentMode === 2 ? 160 : 115;
    ctx.font = 'bold 10px Helvetica, Arial, sans-serif';
    ctx.fillStyle = teal;
    ctx.fillText('HU', 24, yOff + 13);
    huValues.forEach((v, i) => {
      const x = 50 + i * 62;
      const y = yOff;
      ctx.strokeStyle = '#eee';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, 54, 28);
      ctx.font = 'normal 18px Helvetica, Arial, sans-serif';
      ctx.fillStyle = v > 0 ? teal : '#ccc';
      ctx.fillText(String(v), x + 8, y + 20);
      ctx.font = 'normal 8px Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#bbb';
      ctx.fillText(HU_DATA[i].code, x + 36, y + 20);
    });
  }

  // CCL footer
  ctx.font = 'normal 9px Helvetica, Arial, sans-serif';
  ctx.fillStyle = '#bbb';
  ctx.fillText('CCL v2 · santifu.github.io/ccl · CC BY-NC-SA 4.0', 24, H - 14);

  // Project URL (optional, bottom-right)
  if (projUrl) {
    ctx.textAlign = 'right';
    ctx.fillText(projUrl, W - 24, H - 14);
    ctx.textAlign = 'left';
  }

  // Download
  const link = document.createElement('a');
  link.download = `CCL_${project.replace(/\s+/g,'_')}_${author.replace(/\s+/g,'_')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
