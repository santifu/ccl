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
    levels:{
      en:['All sources found and filtered manually.','AI helped surface references; you evaluated them.','AI generated summaries and literature maps you revised.','Iterative AI search shaped the conceptual frame.','AI drove the literature review; you curated results.'],
      es:['Todas las fuentes encontradas y filtradas manualmente.','La IA ayudó a encontrar referencias; tú las evaluaste.','La IA generó resúmenes y mapas bibliográficos que revisaste.','Una búsqueda iterativa con IA dio forma al marco conceptual.','La IA dirigió la revisión bibliográfica; tú curaste los resultados.'],
      ca:['Totes les fonts trobades i filtrades manualment.','La IA va ajudar a trobar referències; tu les vas avaluar.','La IA va generar resums i mapes bibliogràfics que vas revisar.','Una cerca iterativa amb IA va donar forma al marc conceptual.','La IA va dirigir la revisió bibliogràfica; tu vas curar els resultats.'],
      pt:['Todas as fontes encontradas e filtradas manualmente.','A IA ajudou a encontrar referências; você as avaliou.','A IA gerou resumos e mapas bibliográficos que você revisou.','Uma pesquisa iterativa com IA moldou o quadro conceptual.','A IA conduziu a revisão bibliográfica; você curou os resultados.'],
      fr:['Toutes les sources trouvées et filtrées manuellement.','L\'IA a aidé à trouver des références ; vous les avez évaluées.','L\'IA a généré des résumés et des cartes bibliographiques que vous avez révisés.','Une recherche itérative avec l\'IA a façonné le cadre conceptuel.','L\'IA a mené la revue de littérature ; vous avez sélectionné les résultats.'],
      de:['Alle Quellen wurden manuell gefunden und gefiltert.','KI half, Referenzen zu finden; Sie haben sie bewertet.','KI erstellte Zusammenfassungen und Literaturkarten, die Sie überarbeitet haben.','Eine iterative KI-Suche prägte den konzeptionellen Rahmen.','KI leitete die Literaturrecherche; Sie haben die Ergebnisse kuratiert.']
    }
  },
  { code:'I', key:'ideation',
    levels:{
      en:['Ideas emerged from your own thinking.','AI sparked options; you chose the direction.','AI drafts seeded concepts you reworked.','Back-and-forth with AI shaped the core idea.','AI generated the concept; you refined and selected.'],
      es:['Las ideas surgieron de tu propio pensamiento.','La IA propuso opciones; tú elegiste la dirección.','Los borradores de la IA sembraron conceptos que reelaboraste.','El ir y venir con la IA dio forma a la idea central.','La IA generó el concepto; tú lo refinaste y seleccionaste.'],
      ca:['Les idees van sorgir del teu propi pensament.','La IA va proposar opcions; tu vas triar la direcció.','Els esborranys de la IA van sembrar conceptes que vas reelaborar.','L\'anada i tornada amb la IA va donar forma a la idea central.','La IA va generar el concepte; tu el vas refinar i seleccionar.'],
      pt:['As ideias surgiram do seu próprio pensamento.','A IA propôs opções; você escolheu a direção.','Os rascunhos da IA semearam conceitos que você reformulou.','O vaivém com a IA moldou a ideia central.','A IA gerou o conceito; você refinou e selecionou.'],
      fr:['Les idées sont nées de votre propre réflexion.','L\'IA a suggéré des options ; vous avez choisi la direction.','Les ébauches de l\'IA ont semé des concepts que vous avez retravaillés.','Les allers-retours avec l\'IA ont façonné l\'idée centrale.','L\'IA a généré le concept ; vous l\'avez affiné et sélectionné.'],
      de:['Ideen entstanden aus Ihrem eigenen Denken.','KI lieferte Anstöße; Sie wählten die Richtung.','KI-Entwürfe säten Konzepte, die Sie überarbeitet haben.','Der Austausch mit der KI prägte die Kernidee.','KI erzeugte das Konzept; Sie haben verfeinert und ausgewählt.']
    }
  },
  { code:'D', key:'design',
    levels:{
      en:['All aesthetic and structural decisions were yours.','AI offered alternatives; you decided.','AI produced early mockups or layouts you reworked.','Visual language emerged through human-AI iteration.','AI generated the design system; you curated.'],
      es:['Todas las decisiones estéticas y estructurales fueron tuyas.','La IA ofreció alternativas; tú decidiste.','La IA produjo maquetas o diseños iniciales que reelaboraste.','El lenguaje visual surgió mediante iteración humano-IA.','La IA generó el sistema de diseño; tú lo curaste.'],
      ca:['Totes les decisions estètiques i estructurals van ser teves.','La IA va oferir alternatives; tu vas decidir.','La IA va produir maquetes o dissenys inicials que vas reelaborar.','El llenguatge visual va sorgir mitjançant iteració humà-IA.','La IA va generar el sistema de disseny; tu el vas curar.'],
      pt:['Todas as decisões estéticas e estruturais foram suas.','A IA ofereceu alternativas; você decidiu.','A IA produziu maquetes ou layouts iniciais que você reformulou.','A linguagem visual surgiu através da iteração humano-IA.','A IA gerou o sistema de design; você curou.'],
      fr:['Toutes les décisions esthétiques et structurelles étaient les vôtres.','L\'IA a proposé des alternatives ; vous avez décidé.','L\'IA a produit des maquettes ou mises en page initiales que vous avez retravaillées.','Le langage visuel est né d\'une itération humain-IA.','L\'IA a généré le système de design ; vous l\'avez sélectionné.'],
      de:['Alle ästhetischen und strukturellen Entscheidungen waren Ihre eigenen.','KI bot Alternativen an; Sie haben entschieden.','KI erstellte erste Mockups oder Layouts, die Sie überarbeitet haben.','Die visuelle Sprache entstand durch Mensch-KI-Iteration.','KI erzeugte das Designsystem; Sie haben kuratiert.']
    }
  },
  { code:'C', key:'coding',
    levels:{
      en:['Code written entirely by hand.','AI suggested snippets; you wrote and integrated.','AI drafted functions you debugged and rewrote.','Most logic co-developed with AI in conversation.','AI produced the codebase; you reviewed and edited.'],
      es:['Código escrito enteramente a mano.','La IA sugirió fragmentos; tú escribiste e integraste.','La IA redactó funciones que depuraste y reescribiste.','La mayor parte de la lógica se co-desarrolló con la IA en conversación.','La IA produjo la base de código; tú revisaste y editaste.'],
      ca:['Codi escrit íntegrament a mà.','La IA va suggerir fragments; tu vas escriure i integrar.','La IA va redactar funcions que vas depurar i reescriure.','La major part de la lògica es va co-desenvolupar amb la IA en conversa.','La IA va produir la base de codi; tu vas revisar i editar.'],
      pt:['Código escrito inteiramente à mão.','A IA sugeriu trechos; você escreveu e integrou.','A IA redigiu funções que você depurou e reescreveu.','A maior parte da lógica foi co-desenvolvida com a IA em conversa.','A IA produziu a base de código; você revisou e editou.'],
      fr:['Code entièrement écrit à la main.','L\'IA a suggéré des extraits ; vous avez écrit et intégré.','L\'IA a rédigé des fonctions que vous avez déboguées et réécrites.','La majeure partie de la logique a été co-développée avec l\'IA en conversation.','L\'IA a produit la base de code ; vous avez révisé et édité.'],
      de:['Code vollständig von Hand geschrieben.','KI schlug Code-Schnipsel vor; Sie haben geschrieben und integriert.','KI entwarf Funktionen, die Sie debuggt und neu geschrieben haben.','Der Großteil der Logik wurde im Gespräch mit der KI gemeinsam entwickelt.','KI erzeugte die Codebasis; Sie haben überprüft und bearbeitet.']
    }
  },
  { code:'P', key:'prototyping',
    levels:{
      en:['Built entirely by hand — materials, assembly, iteration.','AI informed decisions; physical making was yours.','AI generated plans or templates you adapted.','Fabrication pipeline co-designed with AI.','AI-driven fabrication (CAM, generative toolpaths); you supervised.'],
      es:['Construido enteramente a mano — materiales, montaje, iteración.','La IA informó decisiones; la fabricación física fue tuya.','La IA generó planos o plantillas que adaptaste.','El flujo de fabricación se co-diseñó con la IA.','Fabricación dirigida por IA (CAM, trayectorias generativas); tú supervisaste.'],
      ca:['Construït íntegrament a mà — materials, muntatge, iteració.','La IA va informar decisions; la fabricació física va ser teva.','La IA va generar plànols o plantilles que vas adaptar.','El flux de fabricació es va co-dissenyar amb la IA.','Fabricació dirigida per IA (CAM, trajectòries generatives); tu vas supervisar.'],
      pt:['Construído inteiramente à mão — materiais, montagem, iteração.','A IA informou decisões; a fabricação física foi sua.','A IA gerou plantas ou modelos que você adaptou.','O fluxo de fabricação foi co-desenhado com a IA.','Fabricação conduzida por IA (CAM, trajetórias generativas); você supervisionou.'],
      fr:['Construit entièrement à la main — matériaux, assemblage, itération.','L\'IA a éclairé les décisions ; la fabrication physique était la vôtre.','L\'IA a généré des plans ou des modèles que vous avez adaptés.','Le pipeline de fabrication a été co-conçu avec l\'IA.','Fabrication pilotée par l\'IA (CAM, trajectoires génératives) ; vous avez supervisé.'],
      de:['Vollständig von Hand gebaut — Materialien, Montage, Iteration.','KI informierte Entscheidungen; die physische Herstellung war Ihre.','KI erzeugte Pläne oder Vorlagen, die Sie angepasst haben.','Die Fertigungspipeline wurde gemeinsam mit der KI entworfen.','KI-gesteuerte Fertigung (CAM, generative Werkzeugwege); Sie haben beaufsichtigt.']
    }
  },
  { code:'O', key:'documentation',
    levels:{
      en:['Written and structured entirely by you.','AI helped structure or proofread; writing was yours.','AI drafted sections you revised substantially.','Documentation co-written with AI in iterations.','AI produced most documentation; you edited and approved.'],
      es:['Escrito y estructurado enteramente por ti.','La IA ayudó a estructurar o corregir; la escritura fue tuya.','La IA redactó secciones que revisaste sustancialmente.','La documentación se co-escribió con la IA en iteraciones.','La IA produjo la mayor parte de la documentación; tú editaste y aprobaste.'],
      ca:['Escrit i estructurat íntegrament per tu.','La IA va ajudar a estructurar o corregir; l\'escriptura va ser teva.','La IA va redactar seccions que vas revisar substancialment.','La documentació es va co-escriure amb la IA en iteracions.','La IA va produir la major part de la documentació; tu vas editar i aprovar.'],
      pt:['Escrito e estruturado inteiramente por você.','A IA ajudou a estruturar ou rever; a escrita foi sua.','A IA redigiu secções que você reviu substancialmente.','A documentação foi co-escrita com a IA em iterações.','A IA produziu a maior parte da documentação; você editou e aprovou.'],
      fr:['Rédigé et structuré entièrement par vous.','L\'IA a aidé à structurer ou relire ; la rédaction était la vôtre.','L\'IA a rédigé des sections que vous avez largement révisées.','La documentation a été co-rédigée avec l\'IA par itérations.','L\'IA a produit l\'essentiel de la documentation ; vous avez édité et approuvé.'],
      de:['Vollständig von Ihnen geschrieben und strukturiert.','KI half beim Strukturieren oder Korrekturlesen; das Schreiben war Ihres.','KI entwarf Abschnitte, die Sie wesentlich überarbeitet haben.','Die Dokumentation wurde in Iterationen gemeinsam mit der KI verfasst.','KI erstellte den Großteil der Dokumentation; Sie haben bearbeitet und freigegeben.']
    }
  },
  { code:'M', key:'management',
    levels:{
      en:['Planning, scheduling, coordination fully manual.','AI suggested timelines or tasks; you organised.','AI drafted plans or briefs you restructured.','Project flow shaped through ongoing AI consultation.','AI managed task breakdown and coordination; you reviewed.'],
      es:['Planificación, calendario y coordinación totalmente manuales.','La IA sugirió plazos o tareas; tú organizaste.','La IA redactó planes o briefs que reestructuraste.','El flujo del proyecto se dio forma mediante consulta continua con la IA.','La IA gestionó el desglose de tareas y la coordinación; tú revisaste.'],
      ca:['Planificació, calendari i coordinació totalment manuals.','La IA va suggerir terminis o tasques; tu vas organitzar.','La IA va redactar plans o briefs que vas reestructurar.','El flux del projecte es va donar forma mitjançant consulta contínua amb la IA.','La IA va gestionar el desglossament de tasques i la coordinació; tu vas revisar.'],
      pt:['Planeamento, calendarização e coordenação totalmente manuais.','A IA sugeriu prazos ou tarefas; você organizou.','A IA redigiu planos ou briefs que você reestruturou.','O fluxo do projecto foi moldado através de consulta contínua com a IA.','A IA geriu a divisão de tarefas e a coordenação; você revisou.'],
      fr:['Planification, calendrier et coordination entièrement manuels.','L\'IA a suggéré des échéanciers ou des tâches ; vous avez organisé.','L\'IA a rédigé des plans ou des briefs que vous avez restructurés.','Le déroulement du projet s\'est dessiné via une consultation continue de l\'IA.','L\'IA a géré la répartition des tâches et la coordination ; vous avez révisé.'],
      de:['Planung, Terminierung und Koordination vollständig manuell.','KI schlug Zeitpläne oder Aufgaben vor; Sie haben organisiert.','KI entwarf Pläne oder Briefings, die Sie umstrukturiert haben.','Der Projektverlauf wurde durch fortlaufende KI-Beratung geprägt.','KI verwaltete die Aufgabenaufteilung und Koordination; Sie haben überprüft.']
    }
  },
  { code:'F', key:'reflection',
    levels:{
      en:['Evaluation came from your own judgment and feedback.','AI offered criteria; you assessed.','AI generated feedback summaries you interrogated.','Iterative AI critique shaped revisions.','AI evaluated outputs and proposed next steps; you approved.'],
      es:['La evaluación provino de tu propio juicio y retroalimentación.','La IA ofreció criterios; tú evaluaste.','La IA generó resúmenes de retroalimentación que cuestionaste.','La crítica iterativa de la IA dio forma a las revisiones.','La IA evaluó los resultados y propuso próximos pasos; tú aprobaste.'],
      ca:['L\'avaluació va provenir del teu propi judici i retroalimentació.','La IA va oferir criteris; tu vas avaluar.','La IA va generar resums de retroalimentació que vas qüestionar.','La crítica iterativa de la IA va donar forma a les revisions.','La IA va avaluar els resultats i va proposar els següents passos; tu vas aprovar.'],
      pt:['A avaliação veio do seu próprio julgamento e feedback.','A IA ofereceu critérios; você avaliou.','A IA gerou resumos de feedback que você questionou.','A crítica iterativa da IA moldou as revisões.','A IA avaliou os resultados e propôs próximos passos; você aprovou.'],
      fr:['L\'évaluation venait de votre propre jugement et retour d\'expérience.','L\'IA a proposé des critères ; vous avez évalué.','L\'IA a généré des synthèses de retours que vous avez interrogées.','La critique itérative de l\'IA a façonné les révisions.','L\'IA a évalué les résultats et proposé les prochaines étapes ; vous avez approuvé.'],
      de:['Die Bewertung entstammte Ihrem eigenen Urteil und Feedback.','KI bot Kriterien an; Sie haben bewertet.','KI erzeugte Feedback-Zusammenfassungen, die Sie hinterfragt haben.','Iterative KI-Kritik prägte die Überarbeitungen.','KI bewertete die Ergebnisse und schlug nächste Schritte vor; Sie haben zugestimmt.']
    }
  }
];

// ── HUMAN-FIRST DIMENSION DATA ─────────────────────────────────
// 6 maker dimensions: E L R B K J
const HU_DATA = [
  { code:'E', key:'experience',
    levels:{
      en:['This project doesn\'t draw on lived experience.','Personal background lightly informs framing.','Lived experience shaped key choices.','The work is substantially grounded in what you have lived.','Only someone who lived this could have made this.'],
      es:['Este proyecto no se basa en experiencia vivida.','Tu trasfondo personal influye ligeramente en el enfoque.','La experiencia vivida dio forma a decisiones clave.','El trabajo está sustancialmente fundamentado en lo que has vivido.','Solo alguien que hubiera vivido esto podría haberlo hecho.'],
      ca:['Aquest projecte no es basa en experiència viscuda.','El teu bagatge personal influeix lleugerament en l\'enfocament.','L\'experiència viscuda va donar forma a decisions clau.','El treball està substancialment fonamentat en el que has viscut.','Només algú que ho hagués viscut podria haver-ho fet.'],
      pt:['Este projecto não se baseia em experiência vivida.','O seu histórico pessoal influencia ligeiramente a abordagem.','A experiência vivida moldou decisões-chave.','O trabalho está substancialmente fundamentado no que viveu.','Só alguém que tivesse vivido isto poderia tê-lo feito.'],
      fr:['Ce projet ne repose pas sur une expérience vécue.','Votre parcours personnel influence légèrement l\'approche.','L\'expérience vécue a façonné des choix clés.','Le travail est substantiellement ancré dans ce que vous avez vécu.','Seule une personne ayant vécu cela aurait pu le réaliser.'],
      de:['Dieses Projekt stützt sich nicht auf gelebte Erfahrung.','Ihr persönlicher Hintergrund beeinflusst die Herangehensweise leicht.','Gelebte Erfahrung prägte wichtige Entscheidungen.','Die Arbeit ist wesentlich in dem verankert, was Sie erlebt haben.','Nur jemand, der dies erlebt hat, hätte es machen können.']
    }
  },
  { code:'L', key:'local',
    levels:{
      en:['No place-specific or community knowledge required.','Some local context informs the work.','Place, language, or community knowledge shaped the outcome.','Deep local knowledge was central — unavailable in training data.','The work is inseparable from a specific place or community.'],
      es:['No se requiere conocimiento específico de lugar o comunidad.','Algo de contexto local influye en el trabajo.','El lugar, el idioma o el conocimiento comunitario dieron forma al resultado.','Un conocimiento local profundo fue central — no disponible en datos de entrenamiento.','El trabajo es inseparable de un lugar o comunidad específicos.'],
      ca:['No cal coneixement específic de lloc o comunitat.','Una mica de context local influeix en el treball.','El lloc, la llengua o el coneixement comunitari van donar forma al resultat.','Un coneixement local profund va ser central — no disponible en dades d\'entrenament.','El treball és inseparable d\'un lloc o comunitat específics.'],
      pt:['Não é necessário conhecimento específico de lugar ou comunidade.','Algum contexto local influencia o trabalho.','O lugar, a língua ou o conhecimento comunitário moldaram o resultado.','Um conhecimento local profundo foi central — indisponível em dados de treino.','O trabalho é inseparável de um lugar ou comunidade específicos.'],
      fr:['Aucune connaissance spécifique d\'un lieu ou d\'une communauté n\'est requise.','Un certain contexte local influence le travail.','Le lieu, la langue ou la connaissance communautaire ont façonné le résultat.','Une connaissance locale approfondie était centrale — indisponible dans les données d\'entraînement.','Le travail est indissociable d\'un lieu ou d\'une communauté spécifiques.'],
      de:['Kein ortsspezifisches oder gemeinschaftliches Wissen erforderlich.','Etwas lokaler Kontext fließt in die Arbeit ein.','Ort, Sprache oder Gemeinschaftswissen prägten das Ergebnis.','Tiefes lokales Wissen war zentral — in Trainingsdaten nicht verfügbar.','Die Arbeit ist untrennbar mit einem bestimmten Ort oder einer Gemeinschaft verbunden.']
    }
  },
  { code:'R', key:'relationship',
    levels:{
      en:['No access through personal trust or community.','Some contacts helped; not essential.','Relationships opened doors that changed the project.','The work depends on trust built over time.','Without specific relationships, this project could not exist.'],
      es:['Sin acceso mediante confianza personal o comunidad.','Algunos contactos ayudaron; no fueron esenciales.','Las relaciones abrieron puertas que cambiaron el proyecto.','El trabajo depende de una confianza construida con el tiempo.','Sin relaciones específicas, este proyecto no podría existir.'],
      ca:['Sense accés mitjançant confiança personal o comunitat.','Alguns contactes van ajudar; no van ser essencials.','Les relacions van obrir portes que van canviar el projecte.','El treball depèn d\'una confiança construïda amb el temps.','Sense relacions específiques, aquest projecte no podria existir.'],
      pt:['Sem acesso através de confiança pessoal ou comunidade.','Alguns contactos ajudaram; não foram essenciais.','As relações abriram portas que mudaram o projecto.','O trabalho depende de confiança construída ao longo do tempo.','Sem relações específicas, este projecto não poderia existir.'],
      fr:['Aucun accès par la confiance personnelle ou la communauté.','Certains contacts ont aidé ; sans être essentiels.','Les relations ont ouvert des portes qui ont changé le projet.','Le travail dépend d\'une confiance construite dans le temps.','Sans relations spécifiques, ce projet ne pourrait pas exister.'],
      de:['Kein Zugang durch persönliches Vertrauen oder Gemeinschaft.','Einige Kontakte halfen; sie waren nicht wesentlich.','Beziehungen öffneten Türen, die das Projekt veränderten.','Die Arbeit beruht auf über Zeit aufgebautem Vertrauen.','Ohne bestimmte Beziehungen könnte dieses Projekt nicht existieren.']
    }
  },
  { code:'B', key:'body',
    levels:{
      en:['Physical presence or touch was not involved.','Making with hands was part of the process.','Embodied skill and tactile judgment shaped the outcome.','The work depends on physical intuition developed over years.','This is fundamentally craft — irreducible to instructions.'],
      es:['No hubo presencia física ni contacto directo.','Hacer con las manos formó parte del proceso.','La habilidad corporal y el juicio táctil dieron forma al resultado.','El trabajo depende de una intuición física desarrollada durante años.','Esto es fundamentalmente artesanía — irreducible a instrucciones.'],
      ca:['No hi va haver presència física ni contacte directe.','Fer amb les mans va formar part del procés.','L\'habilitat corporal i el judici tàctil van donar forma al resultat.','El treball depèn d\'una intuïció física desenvolupada durant anys.','Això és fonamentalment artesania — irreductible a instruccions.'],
      pt:['Não houve presença física nem contacto directo.','Fazer com as mãos fez parte do processo.','A habilidade corporal e o julgamento táctil moldaram o resultado.','O trabalho depende de uma intuição física desenvolvida ao longo de anos.','Isto é fundamentalmente artesanato — irredutível a instruções.'],
      fr:['Aucune présence physique ni contact direct n\'était impliqué.','Faire de ses mains faisait partie du processus.','Le savoir-faire incarné et le jugement tactile ont façonné le résultat.','Le travail dépend d\'une intuition physique développée au fil des années.','C\'est fondamentalement de l\'artisanat — irréductible à des instructions.'],
      de:['Physische Präsenz oder Berührung war nicht beteiligt.','Arbeiten mit den Händen war Teil des Prozesses.','Verkörpertes Können und taktiles Urteilsvermögen prägten das Ergebnis.','Die Arbeit beruht auf über Jahre entwickelter körperlicher Intuition.','Dies ist grundlegend Handwerk — nicht auf Anweisungen reduzierbar.']
    }
  },
  { code:'K', key:'risk',
    levels:{
      en:['No technical risk or irreversibility was involved.','Some decisions had real consequences if wrong.','Critical choices had no undo — skill determined the outcome.','Workmanship of risk was central: failure was visible and personal.','The whole work is a wager — only your skill and judgment stood between success and failure.'],
      es:['No hubo riesgo técnico ni irreversibilidad.','Algunas decisiones tuvieron consecuencias reales si fallaban.','Las elecciones críticas no tenían deshacer — la habilidad determinó el resultado.','El dominio del riesgo fue central: el fallo era visible y personal.','Todo el trabajo es una apuesta — solo tu habilidad y juicio se interponían entre el éxito y el fracaso.'],
      ca:['No hi va haver risc tècnic ni irreversibilitat.','Algunes decisions van tenir conseqüències reals si fallaven.','Les eleccions crítiques no tenien desfer — l\'habilitat va determinar el resultat.','El domini del risc va ser central: la fallada era visible i personal.','Tot el treball és una aposta — només la teva habilitat i judici es van interposar entre l\'èxit i el fracàs.'],
      pt:['Não houve risco técnico nem irreversibilidade.','Algumas decisões tiveram consequências reais se erradas.','As escolhas críticas não tinham desfazer — a habilidade determinou o resultado.','O domínio do risco foi central: a falha era visível e pessoal.','Todo o trabalho é uma aposta — só a sua habilidade e julgamento se interpuseram entre o sucesso e o fracasso.'],
      fr:['Aucun risque technique ni irréversibilité n\'était impliqué.','Certaines décisions avaient de vraies conséquences en cas d\'erreur.','Les choix critiques n\'avaient pas de retour en arrière — le savoir-faire déterminait le résultat.','Le métier du risque était central : l\'échec était visible et personnel.','Tout le travail est un pari — seuls votre savoir-faire et votre jugement se dressaient entre la réussite et l\'échec.'],
      de:['Kein technisches Risiko oder Unumkehrbarkeit war beteiligt.','Einige Entscheidungen hatten bei Fehlern echte Konsequenzen.','Kritische Entscheidungen hatten kein Rückgängig — Können bestimmte das Ergebnis.','Das Handwerk des Risikos war zentral: Scheitern war sichtbar und persönlich.','Die ganze Arbeit ist eine Wette — nur Ihr Können und Urteilsvermögen standen zwischen Erfolg und Scheitern.']
    }
  },
  { code:'J', key:'judgment',
    levels:{
      en:['Decisions followed clear criteria or instructions.','Some intuitive calls, but mostly explicable.','Key decisions came from taste or instinct you can partly explain.','Central choices came from judgment you can\'t fully articulate.','The work is held together by phronesis — wisdom you can\'t reduce to rules.'],
      es:['Las decisiones siguieron criterios o instrucciones claras.','Algunas decisiones intuitivas, pero mayormente explicables.','Las decisiones clave vinieron del gusto o instinto que puedes explicar en parte.','Las elecciones centrales vinieron de un juicio que no puedes articular del todo.','El trabajo se sostiene por phronesis — una sabiduría que no se reduce a reglas.'],
      ca:['Les decisions van seguir criteris o instruccions clares.','Algunes decisions intuïtives, però majoritàriament explicables.','Les decisions clau van venir del gust o instint que pots explicar en part.','Les eleccions centrals van venir d\'un judici que no pots articular del tot.','El treball es manté unit per la phronesis — una saviesa que no es redueix a regles.'],
      pt:['As decisões seguiram critérios ou instruções claras.','Algumas decisões intuitivas, mas maioritariamente explicáveis.','As decisões-chave vieram do gosto ou instinto que consegue explicar em parte.','As escolhas centrais vieram de um julgamento que não consegue articular por completo.','O trabalho mantém-se unido pela phronesis — uma sabedoria que não se reduz a regras.'],
      fr:['Les décisions suivaient des critères ou des instructions claires.','Quelques choix intuitifs, mais globalement explicables.','Les décisions clés venaient d\'un goût ou d\'un instinct que vous pouvez en partie expliquer.','Les choix centraux venaient d\'un jugement que vous ne pouvez pas pleinement articuler.','Le travail tient grâce à la phronesis — une sagesse qui ne se réduit pas à des règles.'],
      de:['Entscheidungen folgten klaren Kriterien oder Anweisungen.','Einige intuitive Entscheidungen, aber meist erklärbar.','Wichtige Entscheidungen kamen aus Geschmack oder Instinkt, den Sie teilweise erklären können.','Zentrale Entscheidungen kamen aus einem Urteilsvermögen, das Sie nicht vollständig artikulieren können.','Die Arbeit wird durch Phronesis zusammengehalten — Weisheit, die sich nicht auf Regeln reduzieren lässt.']
    }
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
    el.textContent = LEVEL_NAMES[currentLang][4 - huValues[idx]];
  });
  // Re-render slider position descriptions
  AI_DATA.forEach((phase, i) => {
    const descEl = document.getElementById(`ai-desc-${i}`);
    if (descEl) descEl.textContent = phase.levels[currentLang][sliderValues[i]];
  });
  HU_DATA.forEach((dim, i) => {
    const descEl = document.getElementById(`hu-desc-${i}`);
    if (descEl) descEl.textContent = dim.levels[currentLang][huValues[i]];
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
        <div class="pr-desc" id="ai-desc-${i}">${phase.levels[currentLang][sliderValues[i]]}</div>
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
          <div class="pr-lvl" data-dim-idx="${i}">${LEVEL_NAMES[currentLang][4 - huValues[i]]}</div>
        </div>
        <div class="pr-desc" id="hu-desc-${i}">${dim.levels[currentLang][huValues[i]]}</div>
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
  if (descEl) descEl.textContent = AI_DATA[i].levels[currentLang][v];
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
  if (lvlEl) lvlEl.textContent = LEVEL_NAMES[currentLang][4 - v];
  const descEl = document.getElementById(`hu-desc-${i}`);
  if (descEl) descEl.textContent = HU_DATA[i].levels[currentLang][v];
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
