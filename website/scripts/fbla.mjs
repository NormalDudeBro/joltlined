import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const escapeHTML = text => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const source = fileURLToPath(new URL('../public/notes/fbla/ipv4-subnetting.txt', import.meta.url));
const events = [
  {
    name: 'Networking Infrastructures', file: 'Networking-Infrastructures', id: 'networking', edition: 'National 2026–27',
    domains: [['Networking basics', 20], ['Topologies and architecture', 20], ['Network security', 25], ['Protocols and standards', 20], ['Hardware and connectivity', 15]],
    action: 'Connect your networking knowledge to the detailed objectives; test unfamiliar addressing, protocol, media, and troubleshooting decisions.',
  },
  {
    name: 'Cybersecurity', file: 'Cybersecurity', id: 'cybersecurity', edition: 'National 2026–27',
    domains: [['Fundamentals', 15], ['Threats and vulnerabilities', 20], ['Security and design', 20], ['Network and data security', 15], ['Operations and management', 10], ['Protocols and threat mitigation', 20]],
    action: 'Distinguish similar controls and attacks. Explain why a protection works, its limits, and which evidence would change your response.',
  },
  {
    name: 'Network Design', file: 'Network-Design', id: 'network-design', edition: 'National 2026–27',
    domains: [['Installation and configuration', 25], ['Security and recovery', 20], ['Administration', 20], ['Planning', 15], ['Protocols, services, and access', 20]],
    action: 'Practice the technical test and spoken recommendations separately: requirements, alternatives, implementation, costs, recovery, and verification.',
  },
  {
    name: 'Sales Presentation', file: 'Sales-Presentation', id: 'sales', edition: 'National 2026–27', domains: [],
    action: 'Develop a complete, truthful pitch: discover needs, demonstrate relevant value, handle objections, explain scope and costs, and request an appropriate next step.',
  },
];

const course = fileURLToPath(new URL('./fbla-content/', import.meta.url));
export const fblaModules = ['ni-foundations','ni-security-protocols','ni-hardware','cs-fundamentals-threats','cs-design-data','cs-operations-mitigation','nd-installation-security','nd-administration-planning','nd-protocols-roleplay','sales-course'].map(file => JSON.parse(readFileSync(`${course}${file}.json`, 'utf8')));
const expectedObjectives = new Set([
  ['NI-NB', 9], ['NI-NTA', 9], ['NI-NS', 10], ['NI-NPS', 9], ['NI-NHC', 7],
  ['CS-SF', 7], ['CS-CTV', 9], ['CS-SD', 8], ['CS-NDS', 7], ['CS-SOM', 6], ['CS-SPM', 8],
  ['ND-NIC', 12], ['ND-NSR', 11], ['ND-NA', 10], ['ND-NP', 9], ['ND-NPSA', 11], ['ND-RP', 7],
  ['SP-R', 10], ['SP-P', 1],
].flatMap(([prefix, count]) => Array.from({ length: count }, (_, index) => `${prefix}-${String(index + 1).padStart(2, '0')}`)));
const eventInfo = {
  networking: { name: 'Networking Infrastructures', slug: 'networking', url: 'https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/Individual%20Guidelines/Objective%20Tests/Networking-Infrastructures.pdf' },
  cybersecurity: { name: 'Cybersecurity', slug: 'cybersecurity', url: 'https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/Individual%20Guidelines/Objective%20Tests/Cybersecurity.pdf' },
  'network-design': { name: 'Network Design', slug: 'network-design', url: 'https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/Individual%20Guidelines/Role%20Play%20Events/Network-Design.pdf' },
  sales: { name: 'Sales Presentation', slug: 'sales', url: 'https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/Individual%20Guidelines/Presentation%20Events/Sales-Presentation.pdf' },
};

export function renderCourseSheets(modules = fblaModules, palette = {}) {
  const moduleIds = new Set();
  const sheetIds = new Set();
  const objectiveIds = new Set();
  const sourceIds = new Set();
  const sheets = [];
  for (const module of modules) {
    assert.ok(module && typeof module.id === 'string' && !moduleIds.has(module.id), `duplicate or missing module id: ${module?.id}`);
    moduleIds.add(module.id);
    assert.ok(eventInfo[module.event], `${module.id}: unknown event`);
    assert.ok(Array.isArray(module.sources) && module.sources.length, `${module.id}: missing sources`);
    const sources = new Map();
    for (const source of module.sources) {
      assert.ok(source.id && !sources.has(source.id) && /^https:\/\//.test(source.url), `${module.id}: invalid/duplicate source`);
      sources.set(source.id, source);
      sourceIds.add(`${module.id}:${source.id}`);
    }
    assert.ok(Array.isArray(module.sheets) && module.sheets.length, `${module.id}: missing sheets`);
    const moduleObjectives = new Set(module.sheets.flatMap(sheet => sheet.pages.flatMap(page => page.flatMap(section => section.objectives))));
    for (const sheet of module.sheets) {
      assert.ok(sheet.id && !sheetIds.has(sheet.id), `duplicate or missing sheet id: ${sheet.id}`);
      assert.ok(typeof sheet.id === 'string' && /^(ni|cs|nd|sp)-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sheet.id), `unsafe sheet id: ${sheet.id}`);
      sheetIds.add(sheet.id);
      assert.ok(Array.isArray(sheet.pages) && sheet.pages.length === 2, `${sheet.id}: expected two pages`);
      const titles = [];
      const body = [];
      for (const [pageIndex, page] of sheet.pages.entries()) {
        body.push('o Overview');
        assert.ok(Array.isArray(page) && page.length === 2, `${sheet.id}: page must have two sections`);
        const overviewTitles = page.map(section => section.title);
        body.push(...overviewTitles.map(title => `-> ${title}`));
        for (let sectionIndex = 0; sectionIndex < page.length; sectionIndex++) {
          const section = page[sectionIndex];
          const expected = sectionIndex === 0 ? 9 : 10;
          assert.ok(typeof section.title === 'string' && /^[\x20-\x7e]+$/.test(section.title) && section.title.length <= 62, `${sheet.id}: invalid title`);
          assert.ok(Array.isArray(section.notes) && section.notes.length === expected, `${sheet.id}/${section.title}: expected ${expected} notes`);
          assert.ok(Array.isArray(section.objectives) && section.objectives.length, `${sheet.id}/${section.title}: missing objectives`);
          assert.ok(Array.isArray(section.sources) && section.sources.length, `${sheet.id}/${section.title}: missing sources`);
          for (const id of section.objectives) {
            assert.ok(typeof id === 'string' && /^(NI|CS|ND|SP)-[A-Z0-9]+-\d{2}$/.test(id), `${sheet.id}: invalid local objective ID ${id}`);
            assert.ok(expectedObjectives.has(id), `${sheet.id}: unknown local objective ID ${id}`);
            assert.ok(id.startsWith(({ networking: 'NI-', cybersecurity: 'CS-', 'network-design': 'ND-', sales: 'SP-' })[module.event]), `${sheet.id}: objective ${id} does not belong to ${module.event}`);
            objectiveIds.add(id);
          }
          for (const id of section.sources) assert.ok(sources.has(id), `${sheet.id}/${section.title}: unknown source ${id}`);
          assert.ok(section.sources.some(id => sources.get(id).reading === 'fetched'), `${sheet.id}/${section.title}: no fetched evidence`);
          assert.ok(section.notes.every(note => typeof note === 'string' && note.length <= 62 && /^[\x20-\x7e]+$/.test(note) && note.trim() === note), `${sheet.id}/${section.title}: notes must be trimmed ASCII <=62 chars`);
          assert.ok(section.notes.every(note => /[.!?]$/.test(note)), `${sheet.id}/${section.title}: complete note required; do not truncate text to satisfy length`);
          titles.push(section.title);
          body.push(`o ${section.title}`, ...section.notes.map(note => `-> ${note}`));
        }
        assert.equal(body.length, (pageIndex + 1) * 24, `${sheet.id}: page line accounting`);
      }
      assert.ok(Array.isArray(sheet.practice) && sheet.practice.length >= 2, `${sheet.id}: needs two practice questions`);
      for (const practice of sheet.practice) {
        assert.ok(practice.prompt && practice.answer && practice.objectives?.length, `${sheet.id}: invalid practice item`);
        assert.ok(practice.objectives.every(id => moduleObjectives.has(id)), `${sheet.id}: practice references unknown objective`);
      }
      const plain = body.slice(0, 25).join('\n') + '\n' + body.slice(25).join('\n') + '\n';
      sheets.push({ module, sheet, titles, plain });
    }
    assert.ok(module.lab?.title && module.lab.steps?.length && module.lab.expected?.length, `${module.id}: missing lab`);
    assert.ok(Array.isArray(module.limitations), `${module.id}: missing limitations`);
  }
  const objectiveList = [...objectiveIds].sort();
  assert.deepEqual(objectiveList, [...expectedObjectives].sort(), 'complete current objective/rubric manifest');
  assert.equal(sheetIds.size, 44, `expected 44 sheets, got ${sheetIds.size}`);
  return { sheets, objectiveList, sourceIds: [...sourceIds].sort() };
}

export function colorSheet(plain, palette, sheetId) {
  assert.ok(palette && palette.pen && Object.keys(palette).length >= 10, 'complete supplied color palette required');
  const colors = ['g', 'pu', 'br', 'or', 'y', 'hp', 'p', 'li'];
  const rows = plain.split('\n');
  const titles = new Map();
  const keywords = new Map();
  const generic = new Set(['a', 'an', 'the', 'and', 'or', 'to', 'of', 'in', 'for', 'with', 'from', 'on', 'by', 'how', 'what', 'using']);
  for (const row of rows) {
    if (!row.startsWith('o ') || row === 'o Overview') continue;
    const title = row.slice(2);
    const ink = titles.get(title) ?? colors[titles.size % colors.length];
    titles.set(title, ink);
    for (const [word] of title.matchAll(/[A-Za-z]+(?:['-][A-Za-z]+)*/g)) {
      const key = word.toLowerCase();
      if (!generic.has(key) && (word.length > 3 || /^[A-Z]{2,}$/.test(word)) && !keywords.has(key)) keywords.set(key, ink);
    }
  }
  const paint = (text, ink) => text.replace(/[A-Za-z]+/g, word => `(${ink})${word}(pen)`);
  return rows.map(line => {
    if (!line) return '';
    if (line === 'o Overview') return `(pen)${line}`;
    const prefix = line.startsWith('o ') ? 2 : 3;
    const title = line.slice(prefix);
    if (titles.has(title)) return `(pen)${line.slice(0, prefix)}${paint(title, titles.get(title))}`;
    const chosen = [...line.matchAll(/[A-Za-z]+(?:['-][A-Za-z]+)*/g)]
      .filter(match => match.index >= prefix && keywords.has(match[0].toLowerCase())).slice(0, 2);
    let output = '(pen)';
    let cursor = 0;
    chosen.forEach(match => {
      output += `${line.slice(cursor, match.index)}${paint(match[0], keywords.get(match[0].toLowerCase()))}`;
      cursor = match.index + match[0].length;
    });
    return output + line.slice(cursor);
  }).join('\n');
}

export function renderEvent(event, rendered, palette) {
  const info = eventInfo[event];
  const list = rendered.sheets.filter(item => item.module.event === event);
  assert.ok(info && list.length, `no sheets for event ${event}`);
  const toc = list.map(({ sheet }) => `<li><a href="#${escapeHTML(sheet.id)}">${escapeHTML(sheet.title)}</a></li>`).join('');
  const sections = list.map(({ module, sheet, plain, titles }) => {
    const colored = colorSheet(plain, palette, sheet.id);
    return `<section class="course-sheet" id="${escapeHTML(sheet.id)}"><h2>${escapeHTML(sheet.title)}</h2><p>${escapeHTML(sheet.domain)}</p><div class="course-download"><a download="${escapeHTML(sheet.id)}.txt" href="data:text/plain;charset=utf-8;base64,${Buffer.from(plain).toString('base64')}">Download plain</a> · <a download="${escapeHTML(sheet.id)}-colored.txt" href="data:text/plain;charset=utf-8;base64,${Buffer.from(colored).toString('base64')}">Download colored</a></div><div class="course-pages">${[0,1].map(page => `<article aria-label="${escapeHTML(sheet.title)} page ${page+1}"><h3>${escapeHTML(sheet.title)}</h3><p class="course-page-label">Page ${page+1} · Lines ${page*24+1}–${page*24+24}</p>${colored.split('\n').slice(page*24,page*24+24).map((line,index) => `<div class="line"><span class="number" aria-hidden="true">${page*24+index+1}</span><span class="note">${renderCourseLine(line)}</span></div>`).join('')}</article>`).join('')}</div><details><summary>Sources, practice, lab and scope notes</summary><h3>Objectives</h3><ul>${[...new Set(sheet.pages.flatMap(page=>page.flatMap(section=>section.objectives)))].map(id=>`<li>${escapeHTML(id)}</li>`).join('')}</ul><h3>Sources</h3><ul>${module.sources.map(source=>`<li><a href="${escapeHTML(source.url)}">${escapeHTML(source.title)}</a> — ${escapeHTML(source.reading)}; ${escapeHTML(source.scope)}</li>`).join('')}</ul><h3>Practice (answers below)</h3>${sheet.practice.map((item,index)=>`<details><summary>${index+1}. ${escapeHTML(item.prompt)}</summary><p>${escapeHTML(item.answer)}</p></details>`).join('')}<h3>${escapeHTML(module.lab.title)}</h3><ol>${module.lab.steps.map(step=>`<li>${escapeHTML(step)}</li>`).join('')}</ol><p>Expected: ${module.lab.expected.map(escapeHTML).join(' ')}</p><p>Limitations: ${module.limitations.map(escapeHTML).join(' ')}</p></details></section>`;
  }).join('');
  const ambiguous = event === 'network-design' ? '<p>Guideline ambiguity: flipchart/visual-aid language conflicts with no-visuals direction; SMP is undefined. Confirm with adviser; no resolution inferred.</p>' : event === 'sales' ? '<p>Guideline ambiguity: final electricity requirement is unclear. Confirm with adviser. Competitors must prepare their own actual entry; these materials are not a ready-to-submit pitch.</p>' : '';
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${info.name} 2026–27 | FBLA</title><link rel="stylesheet" href="styles/site.css"><style>:root{${Object.entries(palette).map(([k,v])=>`--${k}:${v}`).join(';')}}${Object.entries(palette).map(([k])=>`.ink-${k}{color:var(--${k})}`).join('')}.course-intro{padding:36px 0}.course-toc{columns:2}.course-sheet{border-top:1px solid var(--rule);padding:24px 0;scroll-margin-top:12px}.course-pages{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}.course-pages article{break-inside:avoid}.course-pages h3{display:none}.course-pages .line{display:grid;grid-template-columns:22px 1fr;min-height:37px}.course-pages .number{color:var(--muted);text-align:right}.course-pages .note{white-space:pre-wrap;font:14px/26px system-ui;color:#62615e;border-bottom:1px solid #eee;padding:5px}.course-download,.course-page-label{font:12px/1.6 system-ui;color:var(--muted)}.course-sheet details{margin:18px 0}@media(max-width:700px){.course-pages{grid-template-columns:1fr}.course-toc{columns:1}}@media print{.subjects,.course-download,.course-toc,.course-intro,.course-sheet>h2,.course-sheet>p,.course-sheet>details{display:none!important}.course-pages{display:block}.course-pages article{break-after:page;break-inside:avoid}.course-pages h3{display:block}.course-pages .line{height:8.8mm;min-height:0}.course-pages .note{font-size:12px;line-height:3.8mm;padding:.6mm 0}.course-page-label{display:block}*{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body><div class="wrap"><header><div class="masthead"><p class="wordmark">Joltlined</p><p class="masthead-note">Notes &amp; literary analysis</p></div><nav class="subjects" aria-label="Subjects"><a href="index.html">Home</a><a href="ap-lang.html">AP Lang Notes</a><a href="ap-world.html">AP World History Notes</a><a href="algebra-2.html">Algebra 2 Notes</a><a href="fbla.html" aria-current="page">FBLA Study Plan</a><a href="out-of-my-mind.html">Out Of My Mind Analysis</a><a href="of-mice-and-men.html">Of Mice And Men Analysis</a><a href="fahrenheit-451.html">Fahrenheit 451 Analysis</a></nav></header><main><section class="course-intro"><p>FBLA · National 2026–27</p><h1>${escapeHTML(info.name)}</h1><p>Official scope: <a href="${escapeHTML(info.url)}">2026–27 CONNECT guideline</a>. Content has been reviewed and mapped to 160 locally assigned objectives. Source reading scopes and unresolved guideline ambiguities are listed; this is not an exam-readiness certification. Full deck audit remains pending. Objective IDs are not official FBLA/AP numbers, and linked technical readings are not represented as exhaustive or independently normative verification of every note.</p><p>National Leadership Conference participation is limited to one individual/team entry per event and one event per chapter; studying four events does not make a competitor eligible for all four at one NLC. Confirm current rules with the adviser.</p>${ambiguous}<a href="fbla.html">FBLA course hub</a></section><h2>Course contents</h2><ol class="course-toc">${toc}</ol>${sections}</main></div></body></html>`;
}

export function renderCourseHub(rendered) {
  const coverage = rendered.sheets.flatMap(({ module, sheet }) => sheet.pages.flatMap((page, pageIndex) => page.map((section, sectionIndex) => {
    const start = pageIndex * 24 + (sectionIndex === 0 ? 5 : 15);
    return `<li><strong>${escapeHTML(sheet.id)}</strong>, ${escapeHTML(section.title)} · lines ${start}–${start + section.notes.length - 1} · ${section.objectives.map(escapeHTML).join(', ')} · ${section.sources.map(id => { const source = module.sources.find(item => item.id === id); return `<a href="${escapeHTML(source.url)}">${escapeHTML(source.title)}</a>`; }).join(', ')}</li>`;
  })));
  const limitations = [...new Set(rendered.sheets.flatMap(({ module }) => module.limitations))];
  const sources = [...new Map(rendered.sheets.flatMap(({ module }) => module.sources.map(source => [`${module.id}:${source.id}`, { module, source }]))).values()];
  return `<section class="fbla-courses"><h2>Complete event study courses</h2><p>Four events · 44 sheets · 88 printable pages. Content-reviewed and mapped to 160 locally assigned objectives. Source reading scopes and unresolved guideline ambiguities are listed in the ledger; this is not an exam-readiness certification. Companion deck review is complete as a separate workstream; neither review certifies individual mastery or exam readiness. Linked technical readings do not claim exhaustive or independently normative verification of every fact.</p><ul>${Object.entries(eventInfo).map(([id,info])=>`<li><a href="fbla-${id}.html">${info.name} — National 2026–27</a></li>`).join('')}</ul><p><a href="#source-ledger">Source ledger and objective coverage</a> · <a href="fbla-sources.json">JSON ledger</a> · ${rendered.sheets.length} sheets mapped to ${rendered.objectiveList.length} local objectives.</p><section id="source-ledger"><h2>Objective and source ledger</h2><p>Coverage ranges refer to the numbered, 48-line printable sheets. Objective IDs are locally assigned mappings, not official identifiers.</p><details><summary>Show ${coverage.length} coverage mappings and ${sources.length} source records</summary><h3>Coverage and supporting sources</h3><ol>${coverage.join('')}</ol><h3>Source ledger with reading scope</h3><ul>${sources.map(({ module, source }) => `<li>${escapeHTML(module.title)}: <a href="${escapeHTML(source.url)}">${escapeHTML(source.title)}</a> · ${escapeHTML(source.reading)} · ${escapeHTML(source.scope)}</li>`).join('')}</ul><h3>Limitations</h3><ul>${limitations.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul></details></section></section>`;
}

function renderCourseLine(line) {
  let ink = 'pen';
  return line.split(/(\((?:pen|g|li|pu|br|or|y|p|lb|hp)\))/).map(part => {
    const marker = part.match(/^\((pen|g|li|pu|br|or|y|p|lb|hp)\)$/);
    if (!marker) return ink === 'pen' ? escapeHTML(part) : `<span class="ink-${ink}">${escapeHTML(part)}</span>`;
    ink = marker[1];
    return '';
  }).join('');
}

export function renderFbla(note = readFileSync(source, 'utf8'), courseHTML = '') {
  const sections = note.trim().split(/\r?\n\r?\n+/);
  assert.ok(sections[0].startsWith('# '), 'FBLA source begins with a title');
  const article = sections.map(block => {
    const heading = block.match(/^(#{1,2}) ([^\n]+)(?:\n([\s\S]*))?$/);
    if (heading) {
      const level = heading[1].length + 1;
      const title = escapeHTML(heading[2]);
      const rest = heading[3] ? renderBlock(heading[3]) : '';
      return `<h${level}>${title}</h${level}>${rest}`;
    }
    return renderBlock(block);
  });
  // Keep the authored answer-key section behind a native disclosure. It is
  // usable without JavaScript; the following section remains outside it.
  const answer = article.findIndex(block => block.startsWith('<h3>Answer key</h3>'));
  assert.ok(answer >= 0, 'FBLA source contains a separate answer key');
  const next = article.findIndex((block, index) => index > answer && block.startsWith('<h3>'));
  const end = next < 0 ? article.length : next;
  article.splice(answer, end - answer, `<details class="answer-key" id="pilot-answer-key"><summary>Answer key — reveal after attempting the questions</summary>${article.slice(answer, end).join('\n')}</details>`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Four FBLA National 2026–27 study courses: 44 source-grounded two-page sheets, original practice and labs, printable notes, and an objective/source ledger.">
  <title>FBLA Study Plan | Joltlined</title>
  <link rel="stylesheet" href="styles/site.css">
  <style>
    .fbla-intro { padding-block: 42px 28px; }
    .fbla-intro h1 { font-size: clamp(36px, 5vw, 58px); font-weight: normal; line-height: 1.12; margin: 0 0 16px; }
    .fbla-intro p { max-width: 80ch; color: var(--muted); line-height: 1.75; }
    .fbla-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-block: 24px 38px; }
    .fbla-card { min-width: 0; border: 1px solid var(--rule); padding: 20px; background: #fffefb; }
    .fbla-card h2 { font-size: 22px; font-weight: normal; margin: 0 0 10px; }
    .fbla-card p, .fbla-card li { line-height: 1.65; }
    .fbla-card ul { padding-inline-start: 20px; }
    .fbla-note { max-width: 82ch; padding-block: 8px 42px; line-height: 1.75; overflow-wrap: anywhere; }
    .fbla-note h2 { margin-block: 36px 12px; padding-block-start: 14px; border-block-start: 1px solid var(--rule); font-size: 27px; font-weight: normal; }
    .fbla-note h3 { font-size: 20px; font-weight: normal; margin-block: 24px 8px; }
    .fbla-note ul, .fbla-note ol { padding-inline-start: 26px; }
    .fbla-note p { margin-block: 10px 16px; }
    .fbla-download { font: 13px/1.6 system-ui, sans-serif; }
    .fbla-caveat { border-inline-start: 3px solid var(--accent); padding-inline-start: 16px; }
    .answer-key { border: 1px solid var(--rule); padding: 14px 18px; margin-block: 24px; }
    .answer-key summary { cursor: pointer; font-weight: bold; }
    @media (max-width: 650px) { .fbla-grid { grid-template-columns: minmax(0, 1fr); } .fbla-intro { padding-block: 30px 16px; } }
    @media print {
      .subjects, .skip, .fbla-download { display: none; }
      .fbla-grid { display: block; }
      .fbla-card { break-inside: avoid; margin-block-end: 10px; }
      .answer-key:not([open]) > :not(summary) { display: block !important; }
      .fbla-note h3 { break-after: avoid; }
    }
  </style>
</head>
<body>
  <a class="skip" href="#fbla-main">Skip to FBLA study plan</a>
  <div class="wrap">
    <header>
      <div class="masthead"><p class="wordmark">Joltlined</p><p class="masthead-note">Notes &amp; literary analysis</p></div>
      <nav class="subjects" aria-label="Subjects"><a href="index.html">Home</a><a href="ap-lang.html">AP Lang Notes</a><a href="ap-world.html">AP World History Notes</a><a href="algebra-2.html">Algebra 2 Notes</a><a href="fbla.html" aria-current="page">FBLA Study Plan</a><a href="out-of-my-mind.html">Out Of My Mind Analysis</a><a href="of-mice-and-men.html">Of Mice And Men Analysis</a><a href="fahrenheit-451.html">Fahrenheit 451 Analysis</a></nav>
    </header>
    <main id="fbla-main" tabindex="-1">
      <section class="fbla-intro">
        <p class="eyebrow">Business &amp; technology competitions</p>
        <h1>FBLA Study Plan</h1>
        <p>Study all four events through 44 two-page sheets mapped to the 2026–27 knowledge areas and rating criteria. Use explanations to understand, recall to remember, and unfamiliar applications to test your reasoning. The source ledger records coverage and limits; the full flashcard audit remains a separate next phase, not an exam-readiness certification.</p>
        <p class="fbla-caveat"><strong>Edition:</strong> These four courses follow the National 2026–27 CONNECT guidelines. All 160 objective entries have been content-reviewed and mapped using locally assigned—not official—IDs. Source scopes and unresolved guideline ambiguities are listed; this is not an exam-readiness certification. Companion deck review is complete as a separate workstream; neither review certifies individual mastery or exam readiness. Confirm division-specific rules with your adviser.</p>
        <p><a href="#ipv4-pilot">Study IPv4 subnetting and VLSM</a> · <a href="https://www.fbla.org/hs-ce-26-27/">National event resources</a></p>
      </section>
      <div class="fbla-grid">
        ${events.map(event => `<section class="fbla-card" id="${event.id}"><h2>${event.name}</h2><p><strong>${event.edition}.</strong> <a href="${eventInfo[event.id].url}">Official CONNECT guideline PDF</a> · <a href="fbla-${event.id}.html">Open complete course</a></p>${event.domains.length ? `<p>Test items by knowledge area in that document:</p><ul>${event.domains.map(([name, count]) => `<li>${name}: ${count} of 100</li>`).join('')}</ul>` : '<p>Interactive presentation: study the rating criteria for discovery, product knowledge, objections, related offerings, closing, follow-up, organization, delivery, and interaction.</p>'}<p>${event.action}</p></section>`).join('\n        ')}
      </div>
       ${courseHTML}
       <section class="fbla-note" id="ipv4-pilot" aria-label="IPv4 subnetting study pilot">
        <p class="fbla-download"><a href="notes/fbla/ipv4-subnetting.txt" download>Download printable plain-text note</a> · <a href="notes/fbla/ipv4-subnetting.txt">Open plain-text source</a></p>
        ${article.join('\n        ')}
      </section>
    </main>
    <footer><p>Joltlined · Original study explanations, not official FBLA questions or guaranteed results.</p><p>Keep personal scores and mistake logs private. No account or JavaScript is required to read these notes.</p></footer>
  </div>
</body>
</html>
`;
}

function renderBlock(text) {
  const list = text.split('\n');
  if (list.every(line => /^- /.test(line))) return `<ul>${list.map(line => `<li>${formatText(line.slice(2))}</li>`).join('')}</ul>`;
  if (list.every(line => /^\d+\. /.test(line))) return `<ol>${list.map(line => `<li>${formatText(line.replace(/^\d+\. /, ''))}</li>`).join('')}</ol>`;
  return `<p>${formatText(text)}</p>`;
}

function formatText(text) {
  return escapeHTML(text).replace(/https:\/\/[^\s]+/g, url => {
    const trimmed = url.replace(/[),.;]+$/, '');
    return `<a href="${trimmed}" rel="noreferrer">${trimmed}</a>${url.slice(trimmed.length)}`;
  }).replaceAll('\n', '<br>');
}
