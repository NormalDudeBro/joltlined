import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { colorSheet, fblaInks, fblaTermColors } from './fbla-colors.mjs';

export { colorSheet } from './fbla-colors.mjs';

const escapeHTML = text => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const source = fileURLToPath(new URL('../public/notes/fbla/ipv4-subnetting.txt', import.meta.url));
export const rehearsalItems = JSON.parse(readFileSync(new URL('./fbla-rehearsal.json', import.meta.url), 'utf8'));
const events = [
  {
    name: 'Networking Infrastructures', file: 'Networking-Infrastructures', id: 'networking', edition: 'National 2026–27', cards: 192,
    domains: [['Networking basics', 20], ['Topologies and architecture', 20], ['Network security', 25], ['Protocols and standards', 20], ['Hardware and connectivity', 15]],
    action: 'Connect your networking knowledge to the detailed objectives; test unfamiliar addressing, protocol, media, and troubleshooting decisions.',
  },
  {
    name: 'Cybersecurity', file: 'Cybersecurity', id: 'cybersecurity', edition: 'National 2026–27', cards: 194,
    domains: [['Fundamentals', 15], ['Threats and vulnerabilities', 20], ['Security and design', 20], ['Network and data security', 15], ['Operations and management', 10], ['Protocols and threat mitigation', 20]],
    action: 'Distinguish similar controls and attacks. Explain why a protection works, its limits, and which evidence would change your response.',
  },
  {
    name: 'Network Design', file: 'Network-Design', id: 'network-design', edition: 'National 2026–27', cards: 180,
    domains: [['Installation and configuration', 25], ['Security and recovery', 20], ['Administration', 20], ['Planning', 15], ['Protocols, services, and access', 20]],
    action: 'Practice the technical test and spoken recommendations separately: requirements, alternatives, implementation, costs, recovery, and verification.',
  },
  {
    name: 'Sales Presentation', file: 'Sales-Presentation', id: 'sales', edition: 'National 2026–27', cards: 88, domains: [],
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

export function renderEvent(event, rendered, palette) {
  const inks = { ...palette, ...fblaInks };
  const info = eventInfo[event];
  const list = rendered.sheets.filter(item => item.module.event === event);
  assert.ok(info && list.length, `no sheets for event ${event}`);
  const toc = list.map(({ sheet }) => `<li><a href="#${escapeHTML(sheet.id)}">${escapeHTML(sheet.title)}</a></li>`).join('');
  const sections = list.map(({ module, sheet, plain }) => {
    const colored = colorSheet(plain, palette, sheet.id);
    return `<section class="course-sheet topic" id="${escapeHTML(sheet.id)}">
      <h2 class="topic-title">${escapeHTML(sheet.title)}</h2>
      <p class="course-domain">${escapeHTML(sheet.domain)}</p>
      <div class="course-download downloads"><a download="${escapeHTML(sheet.id)}.txt" href="data:text/plain;charset=utf-8;base64,${Buffer.from(plain).toString('base64')}">Download plain</a> · <a download="${escapeHTML(sheet.id)}-colored.txt" href="data:text/plain;charset=utf-8;base64,${Buffer.from(colored).toString('base64')}">Download colored</a></div>
      <div class="course-pages pages">${[0,1].map(page => `<article aria-label="${escapeHTML(sheet.title)} page ${page+1}"><h3 class="page-title">${escapeHTML(sheet.title)}</h3><p class="course-page-label caption">Page ${page+1} · Lines ${page*24+1}–${page*24+24}</p><div class="sheet">${colored.split('\n').slice(page*24,page*24+24).map((line,index) => `<div class="line"><span class="number" aria-hidden="true">${page*24+index+1}</span><span class="note">${renderCourseLine(line)}</span></div>`).join('')}</div></article>`).join('')}</div>
      <details><summary>Sources, practice, lab and scope notes</summary><h3>Objectives</h3><ul>${[...new Set(sheet.pages.flatMap(page=>page.flatMap(section=>section.objectives)))].map(id=>`<li>${escapeHTML(id)}</li>`).join('')}</ul><h3>Sources</h3><ul>${module.sources.map(source=>`<li><a href="${escapeHTML(source.url)}">${escapeHTML(source.title)}</a> — ${escapeHTML(source.reading)}; ${escapeHTML(source.scope)}</li>`).join('')}</ul><h3>Practice (answers below)</h3>${sheet.practice.map((item,index)=>`<details><summary>${index+1}. ${escapeHTML(item.prompt)}</summary><p>${escapeHTML(item.answer)}</p></details>`).join('')}<h3>${escapeHTML(module.lab.title)}</h3><ol>${module.lab.steps.map(step=>`<li>${escapeHTML(step)}</li>`).join('')}</ol><p>Expected: ${module.lab.expected.map(escapeHTML).join(' ')}</p><p>Limitations: ${module.limitations.map(escapeHTML).join(' ')}</p></details>
    </section>`;
  }).join('');
  const ambiguous = event === 'network-design' ? '<p>Guideline ambiguity: flipchart/visual-aid language conflicts with no-visuals direction; SMP is undefined. Confirm with adviser; no resolution inferred.</p>' : event === 'sales' ? '<p>Guideline ambiguity: final electricity requirement is unclear. Confirm with adviser. Competitors must prepare their own actual entry; these materials are not a ready-to-submit pitch.</p>' : '';
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${info.name} 2026–27 | FBLA</title>
  <link rel="stylesheet" href="styles/site.css">
  <style>
    :root { ${Object.entries(inks).map(([key,value])=>`--${key}:${value}`).join(';')} }
    ${Object.keys(inks).map(key=>`.ink-${key}{color:var(--${key})}`).join('')}
    #notes { padding-block: 6px 40px; }
    #notes:focus { outline: none; }
    .course-domain { margin-block: 0 12px; color: var(--muted); font: 11px/1.5 system-ui, sans-serif; }
    .course-sheet details { margin-block: 18px; overflow-wrap: anywhere; }
    .course-sheet summary { cursor: pointer; padding-block: 8px; }
    .course-sheet summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
    @media print {
      #notes { padding: 0; }
      .course-intro, .course-contents, .course-toc, .course-domain, .course-sheet > details { display: none !important; }
    }
  </style>
</head><body class="notes-site">
  <a class="skip" href="#notes">Skip to notes</a>
  <div class="wrap">
    <header><div class="masthead"><p class="wordmark">Joltlined</p><p class="masthead-note">Notes &amp; literary analysis</p></div><nav class="subjects" aria-label="Subjects"><a href="index.html">Home</a><a href="ap-lang.html">AP Lang Notes</a><a href="ap-world.html">AP World History Notes</a><a href="algebra-2.html">Algebra 2 Notes</a><a href="fbla.html" aria-current="page">FBLA Study Plan</a><a href="out-of-my-mind.html">Out Of My Mind Analysis</a><a href="of-mice-and-men.html">Of Mice And Men Analysis</a><a href="fahrenheit-451.html">Fahrenheit 451 Analysis</a></nav></header>
    <main id="notes" tabindex="-1">
      <section class="course-intro notes-intro">
        <p class="eyebrow">FBLA · National 2026–27</p>
        <h1>${escapeHTML(info.name)}</h1>
        <p>${list.length} two-page sheets · ${list.length * 2} printable pages · 24 lines per page</p>
        <p>Read a sheet, then open “Sources, practice, lab and scope notes” beneath it for questions, answers and the module lab. Plain and colored downloads contain the same notes. Use your browser's Print command for one numbered sheet per page.</p>
        <p>Official scope: <a href="${escapeHTML(info.url)}">2026–27 CONNECT guideline</a>. The notes and companion deck have been reviewed; neither certifies your mastery or a competition result. Objective IDs are local study labels, and source-reading limits are recorded in the <a href="fbla.html#source-ledger">source ledger</a>.</p>
        <p>Confirm qualification, entry limits and conference-specific rules with your adviser. Studying all four events does not establish eligibility to enter all four.</p>${ambiguous}
        <nav aria-label="FBLA course navigation"><a href="fbla.html">FBLA course hub</a><a href="fbla.html#start-here">How to study</a><a href="fbla.html#rehearsal">Rehearsal guidance</a></nav>
      </section>
      <h2 class="course-contents">Course contents</h2><ol class="course-toc contents">${toc}</ol>
      ${sections}
    </main>
    <footer><p>Heading colors vary independently from body-term colors. One central registry assigns fixed colors to exact, case-insensitive body terms and their explicitly listed aliases across every sheet, page, and event; registered terms always keep that color, including when several occur together. Prose, punctuation, and digits stay pencil. All eleven colors appear across each event; light blue identifies overall sheet display titles but does not automatically color body mentions. Some colors do not meet text-contrast requirements; plain-text downloads are available for every sheet.</p><a href="fbla.html">Back to FBLA study plan</a></footer>
  </div>
</body></html>`;
}

export function renderCourseHub(rendered) {
  for (const item of rehearsalItems) {
    assert.ok(expectedObjectives.has(item.id), `unknown rehearsal objective: ${item.id}`);
    assert.ok(rendered.sheets.some(({ module, sheet }) => module.event === item.event && sheet.id === item.sheet && sheet.pages.some(page => page.some(section => section.objectives.includes(item.id)))), `invalid rehearsal sheet mapping: ${item.id}`);
  }
  const coverage = rendered.sheets.flatMap(({ module, sheet }) => sheet.pages.flatMap((page, pageIndex) => page.map((section, sectionIndex) => {
    const start = pageIndex * 24 + (sectionIndex === 0 ? 5 : 15);
    return `<li><strong>${escapeHTML(sheet.id)}</strong>, ${escapeHTML(section.title)} · lines ${start}–${start + section.notes.length - 1} · ${section.objectives.map(escapeHTML).join(', ')} · ${section.sources.map(id => { const source = module.sources.find(item => item.id === id); return `<a href="${escapeHTML(source.url)}">${escapeHTML(source.title)}</a>`; }).join(', ')}</li>`;
  })));
  const limitations = [...new Set(rendered.sheets.flatMap(({ module }) => module.limitations))];
  const sources = [...new Map(rendered.sheets.flatMap(({ module }) => module.sources.map(source => [`${module.id}:${source.id}`, { module, source }]))).values()];
  return `<section class="fbla-section" id="source-ledger"><h2>Sources and coverage — reference, not a study checklist</h2><p>Use this reference section when checking a topic or exploring it further. It connects the ${rendered.sheets.length} sheets with ${rendered.objectiveList.length} learning objectives and rating criteria. These mappings organize the material; they are not personal scores or separate assignments. Reference IDs are course labels, not official FBLA numbering.</p><p>These are independent study materials, not official FBLA questions or a guarantee of competition results. Source notes describe the relevant sections and limits of each reference; a citation does not mean every statement has been independently verified. Consult the applicable official guidelines for event requirements.</p><p><a href="fbla-sources.json">JSON ledger</a> · Printing this page includes the worked-example answers and rehearsal lists. Expand the ledger first to include its full records in the printout.</p><details><summary>Show ${coverage.length} coverage mappings and ${sources.length} source records</summary><h3>Coverage and supporting sources</h3><ol>${coverage.join('')}</ol><h3>Source ledger with reading scope</h3><ul>${sources.map(({ module, source }) => `<li>${escapeHTML(module.title)}: <a href="${escapeHTML(source.url)}">${escapeHTML(source.title)}</a> · ${escapeHTML(source.reading)} · ${escapeHTML(source.scope)}</li>`).join('')}</ul><h3>Limitations</h3><ul>${limitations.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul></details></section>`;
}

function renderCourseLine(line) {
  let ink = 'pen';
  return line.split(/(\((?:pen|g|li|pu|br|or|y|r|db|mb|p|lb|hp)\))/).map(part => {
    const marker = part.match(/^\((pen|g|li|pu|br|or|y|r|db|mb|p|lb|hp)\)$/);
    if (!marker) return ink === 'pen' ? escapeHTML(part) : `<span class="ink-${ink}">${escapeHTML(part)}</span>`;
    ink = marker[1];
    return '';
  }).join('');
}

function renderColorReference(palette) {
  const colors = [
    { ink: 'db', name: 'Dark blue', group: 'Selected network identifiers, trust principles, and tools', examples: ['LAN', 'MAC', 'Zero Trust', 'DNS', 'gateway', 'ping'] },
    { ink: 'mb', name: 'Medium blue', group: 'IP addressing, hardware forms, and selected infrastructure terms', examples: ['IP', 'IPv4', 'subnet', 'mask', 'octet', 'DSL'] },
    { ink: 'li', name: 'Light green', group: 'Switching, recovery, and selected performance vocabulary', examples: ['IPv6', 'DHCP', 'switch', 'fiber', 'latency', 'dual stack'] },
    { ink: 'or', name: 'Orange', group: 'Routing, provider access, and permission vocabulary', examples: ['WAN', 'routers', 'NAT', 'ISP', 'modem', 'cellular'] },
    { ink: 'pu', name: 'Purple', group: 'Segmentation, endpoints, and presentation criteria', examples: ['VLAN', 'VMs', 'endpoint', 'rubric', 'eye contact', 'criteria'] },
    { ink: 'p', name: 'Light pink', group: 'Selected networking/application protocols and business terms', examples: ['OSI', 'TCP', 'HTTPS', 'ARP', 'SaaS', 'consent'] },
    { ink: 'hp', name: 'Dark pink', group: 'Authentication, secure-access vocabulary, and selected names', examples: ['TLS', 'VPN', 'MFA', 'certificates', 'passwords', 'Windows'] },
    { ink: 'g', name: 'Dark green', group: 'Recovery, cryptography, and measured performance', examples: ['RAID', 'backups', 'encryption', 'patching', 'throughput', 'hashes'] },
    { ink: 'y', name: 'Yellow', group: 'Wireless vocabulary and selected names', examples: ['Wi-Fi', 'WPA3', 'SSID', '5G', 'BitLocker', 'ROI'] },
    { ink: 'r', name: 'Red', group: 'Attacks, weaknesses, ciphers, and selected controls', examples: ['DoS', 'phishing', 'IDS', 'IPS', 'cipher', 'firewalls'] },
    { ink: 'lb', name: 'Light blue', group: 'Overall sheet titles', examples: [] },
  ];
  const inks = { ...palette, ...fblaInks };
  for (const color of colors) {
    assert.match(inks[color.ink] ?? '', /^#[a-f0-9]{6}$/i, `color reference needs the actual ${color.ink} ink`);
    assert.ok(color.examples.every(term => fblaTermColors[color.ink]?.includes(term)), `${color.name}: reference examples must match the shared registry`);
  }
  const names = terms => terms.map(term => `<bdi dir="ltr">${escapeHTML(term)}</bdi>`).join(', ');
  return `<section class="fbla-section" id="color-reference" aria-labelledby="color-reference-title">
        <p class="eyebrow">Reading the notes</p>
        <h2 id="color-reference-title">Color reference</h2>
        <p><strong>Two independent layers:</strong> section headings and their matching Overview entries use varied palettes for navigation. Body terms keep one fixed color across every sheet, page, and event: LAN is always dark blue in the body, even under a differently colored heading. Light blue identifies the overall sheet title.</p>
        <p id="color-reference-scope">The groupings below describe the current organization, not a universal conceptual taxonomy. Red includes both attacks and defensive controls; yellow includes both wireless terms and ROI. Learn the named term, rather than assuming that a color alone defines its meaning.</p>
        <p class="fbla-color-scroll-note">Scroll the table horizontally to see all columns on a narrow screen.</p>
        <section class="fbla-color-table" aria-label="Scrollable color reference table" tabindex="0">
          <table aria-describedby="color-reference-scope">
            <caption>Current organization of the FBLA note colors</caption>
            <thead><tr><th scope="col">Color / ink</th><th scope="col">Main groupings</th><th scope="col">Examples in the notes</th></tr></thead>
            <tbody>${colors.map(color => `<tr data-color="${color.ink}"><th scope="row"><span class="fbla-color-name"><span class="fbla-color-swatch fbla-swatch-${color.ink}" aria-hidden="true"></span>${color.name}</span><code dir="ltr">${inks[color.ink]}</code></th><td>${escapeHTML(color.group)}</td><td>${color.examples.length ? names(color.examples) : 'Overall sheet display titles; not assigned to body terms.'}</td></tr>`).join('')}</tbody>
          </table>
        </section>
        <p>Unregistered prose stays pencil. Every registered body term retains its assigned ink, including when several differently colored terms occur on the same line. Color supplements the wording; plain-text downloads are available on every event page.</p>
        <details class="fbla-color-index"><summary>Full body-term index (${Object.values(fblaTermColors).flat().length} registered forms)</summary><dl>${colors.filter(color => color.ink !== 'lb').map(color => `<dt>${color.name}</dt><dd>${names(fblaTermColors[color.ink])}</dd>`).join('')}</dl></details>
      </section>`;
}

export function renderFbla(note = readFileSync(source, 'utf8'), courseHTML = '', palette) {
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
    .fbla-intro { padding-block: 44px 30px; }
    .fbla-intro h1 { max-width: 26ch; font-size: clamp(34px, 4.5vw, 54px); font-weight: normal; line-height: 1.12; letter-spacing: -1px; margin: 0 0 18px; }
    .fbla-intro > p:not(.eyebrow) { max-width: 85ch; color: var(--muted); font-size: 15px; line-height: 1.75; }
    #fbla-main { overflow-wrap: anywhere; }
    .fbla-section { padding-block: 16px 28px; border-block-start: 1px solid var(--rule); line-height: 1.75; }
    .fbla-section h2 { font-size: 30px; font-weight: normal; margin-block: 12px; }
    .fbla-section h3 { font-size: 21px; font-weight: normal; }
    .fbla-section p { max-width: 82ch; }
    .fbla-section li { margin-block: 10px; }
    .fbla-section ul, .fbla-section ol { padding-inline-start: 24px; }
    .fbla-jumps { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-block: 24px 16px; font: 12px/1.7 system-ui, sans-serif; }
    .fbla-jumps a { padding-block: 8px; }
    .fbla-start { border-inline-start: 4px solid var(--accent); padding-inline-start: 20px; }
    .fbla-materials { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
    .fbla-materials > div { min-inline-size: 0; }
    .fbla-materials h3 { margin-block-end: 8px; }
    .fbla-materials p { margin-block-start: 0; }
    .fbla-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-block: 24px 38px; }
    .fbla-card { min-width: 0; border: 1px solid var(--rule); padding: 20px; background: #fffefb; }
    .fbla-card h3 { font-size: 22px; font-weight: normal; margin: 0 0 10px; }
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
    .rehearsal-group { border: 1px solid var(--rule); padding: 14px 18px; margin-block: 18px; }
    summary { cursor: pointer; padding-block: 8px; }
    summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
    .rehearsal-group li { margin-block: 18px; }
    .rehearsal-group p { margin-block: 4px; }
    .fbla-local-id { font: 12px/1.6 system-ui, sans-serif; color: var(--muted); }
    .fbla-color-table { max-inline-size: 100%; overflow-x: auto; margin-block: 24px; }
    .fbla-color-table:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
    .fbla-color-table table { inline-size: 100%; min-inline-size: 620px; border-collapse: collapse; table-layout: fixed; font-size: 14px; line-height: 1.6; }
    .fbla-color-table caption { padding-block-end: 12px; text-align: start; font-style: italic; }
    .fbla-color-table th, .fbla-color-table td { padding-block: 14px; padding-inline: 12px; text-align: start; vertical-align: top; border-block-end: 1px solid var(--rule); overflow-wrap: anywhere; }
    .fbla-color-table thead th { border-block: 1px solid var(--ink); font: 600 11px/1.6 system-ui, sans-serif; letter-spacing: 0.06em; text-transform: uppercase; }
    .fbla-color-table th:first-child { inline-size: 23%; }
    .fbla-color-table thead th:nth-child(2) { inline-size: 35%; }
    .fbla-color-table tbody th { font-weight: normal; }
    .fbla-color-name { display: flex; align-items: center; gap: 10px; }
    .fbla-color-swatch { display: inline-block; inline-size: 12px; block-size: 12px; flex: 0 0 12px; border: 1px solid var(--muted); print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    ${Object.entries({ ...palette, ...fblaInks }).filter(([ink]) => !['pen', 'br'].includes(ink)).map(([ink, hex]) => `.fbla-swatch-${ink} { background-color: ${hex}; }`).join('\n    ')}
    .fbla-color-table code { display: block; margin-block-start: 6px; color: var(--muted); font-size: 11px; }
    .fbla-color-index dt { font-weight: bold; margin-block-start: 18px; }
    .fbla-color-index dd { margin-inline: 0; margin-block: 4px 16px; font-size: 14px; }
    .fbla-color-scroll-note { display: none; font: 12px/1.6 system-ui, sans-serif; color: var(--muted); }
    @media (max-width: 650px) { .fbla-grid, .fbla-materials { grid-template-columns: minmax(0, 1fr); } .fbla-color-scroll-note { display: block; } }
    @media (max-width: 480px) { .fbla-intro { padding-block: 32px 24px; } }
    @media print {
      .subjects, .skip, .fbla-download, .fbla-jumps { display: none; }
      .fbla-grid, .fbla-materials { display: block; }
      .fbla-card { break-inside: avoid; margin-block-end: 10px; }
      .answer-key::details-content, .rehearsal-group::details-content { content-visibility: visible; }
      .answer-key:not([open]) > :not(summary), .rehearsal-group:not([open]) > :not(summary) { display: block !important; }
      .fbla-note h3 { break-after: avoid; }
      .fbla-color-table { overflow: visible; }
      .fbla-color-table table { min-inline-size: 0; }
      .fbla-color-table tr { break-inside: avoid; }
      .fbla-color-scroll-note { display: none; }
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
        <p>One study system, four events. Use explanations to understand a topic, recall practice to remember it, and applied tasks to use it without help. Start with one topic and a practice attempt; explore the source references when more detail is needed.</p>
        <p><strong>Study resources:</strong> 44 two-page reference sheets with practice questions and labs. The website can be used on its own; an optional 654-card Anki package supports additional recall practice. Use practice results to decide what to study next.</p>
        <nav class="fbla-jumps" aria-label="FBLA study sections"><a href="#start-here">Start here</a><a href="#event-courses">Choose an event</a><a href="#color-reference">Color reference</a><a href="#practice-plan">Plan a study schedule</a><a href="#rehearsal">Skills to rehearse</a><a href="#source-ledger">Sources and limits</a></nav>
      </section>
      <section class="fbla-section fbla-start" id="start-here">
        <h2>Start here: one topic, one practice attempt</h2>
        <ol>
          <li><strong>Choose an event below.</strong> On its course page, select one sheet from the contents. Read its two pages, or try the practice first if the topic is already familiar.</li>
          <li><strong>Open “Sources, practice, lab and scope notes” beneath that sheet.</strong> Attempt the questions before expanding their answers. The same module lab can appear under several related sheets; you do not need to repeat an identical lab for each sheet.</li>
          <li><strong>Check recall without the notes.</strong> Explain the idea aloud or answer a practice question. If using the companion Anki package, select the matching event subdeck and use Browse to find topic words. The card order is not a lesson sequence, and cards are not mapped one-to-one to sheets.</li>
          <li><strong>Apply the idea without the answer in view.</strong> Complete the suggested lab or scenario. For Network Design and Sales, also practice aloud using the rehearsal guidance below.</li>
          <li><strong>Write down what went wrong privately.</strong> Revisit that explanation, then try a different question or scenario later. Remembering the original answer is not the same as solving a new problem.</li>
        </ol>
        <p><strong>New to a topic?</strong> Read the sheet and work through its examples before attempting practice. <strong>Already familiar with it?</strong> Try practice first, skim material you can explain and apply, and focus on gaps. Choose a starting point that fits current knowledge rather than a fixed order.</p>
        <div class="fbla-materials">
          <div><h3>Website: understand and apply</h3><p>The event pages contain concise reference sheets, expandable practice answers and lab instructions. Plain and colored downloads contain the same notes; choose whichever is easier to read.</p></div>
          <div><h3>Optional Anki: remember</h3><p>If a copy of the companion <bdi dir="ltr"><code>FBLA.apkg</code></bdi> is available, import it into Anki. The 654 cards are not embedded in this website. Without the package, use the practice questions for recall. When updating an existing deck, preserve its learning progress.</p></div>
          <div><h3>Rehearsal: perform</h3><p>Use unfamiliar cases, your own presentation and audience feedback to practice decisions and delivery. The website does not track your scores or synchronize your Anki progress.</p></div>
        </div>
      </section>
      <section class="fbla-section" id="event-courses">
        <h2>Complete event study courses</h2>
        <p>Choose the event you are working on today. Networking Infrastructures and Cybersecurity emphasize written knowledge; Network Design adds a spoken case response; Sales requires your own interactive presentation.</p>
        <div class="fbla-grid">
          ${events.map(event => `<section class="fbla-card" id="${event.id}"><h3>${event.name}</h3><p><strong>${fblaModules.filter(module => module.event === event.id).reduce((count, module) => count + module.sheets.length, 0)} two-page sheets · ${event.cards} Anki cards.</strong></p><p><a href="fbla-${event.id}.html">Open ${event.name} course</a></p><p>${event.action}</p><details><summary>National 2026–27 format and test weighting</summary><p><a href="${eventInfo[event.id].url}">Official CONNECT guideline PDF</a></p>${event.domains.length ? `<p>Test items by knowledge area in that document:</p><ul>${event.domains.map(([name, count]) => `<li>${name}: ${count} of 100</li>`).join('')}</ul>` : '<p>Interactive presentation: discovery, product knowledge, objections, related offerings, closing, follow-up, organization, delivery and interaction.</p>'}</details></section>`).join('\n          ')}
        </div>
      </section>
      ${renderColorReference(palette)}
      <section class="fbla-section" id="practice-plan">
        <h2>Build a study schedule</h2>
        <p>Adapt these stages to the time available, current knowledge and chosen events. They can span weeks or months; they are not an official schedule. Check regional competition, registration and submission deadlines before planning backward from a target event.</p>
        <ol>
          <li><strong>Find gaps.</strong> Sample practice across the chosen events, identify unfamiliar topics and begin spoken practice early. Use the sheets to repair weaknesses rather than rereading everything equally.</li>
          <li><strong>Connect and apply.</strong> Work through weak areas, use recall practice regularly, and complete relevant labs or tabletop exercises.</li>
          <li><strong>Add time pressure.</strong> Mix topics, change the numbers or scenario, and practice cases and presentations without reading the model answer.</li>
          <li><strong>Run full simulations.</strong> Use the applicable official timing and rating sheet. Ask a partner or adviser for specific feedback, especially on reasoning and questions.</li>
          <li><strong>Build consistency.</strong> Retest recurring weaknesses with new tasks, rehearse interruptions and equipment failures, and confirm logistics.</li>
        </ol>
        <p><strong>A useful weekly rhythm:</strong> several short recall sessions, focused work on weak topics, an application or lab, and a spoken rehearsal for each performance event you are preparing. Adjust the workload to your actual results; finishing a card count is not the goal.</p>
      </section>
      <section class="fbla-section" id="rehearsal">
        <h2>17 skills to practice through scenarios and presentations</h2>
        <p><strong>Use this checklist to practice 8 Network Design skills and 9 Sales Presentation skills.</strong> These involve applying knowledge, explaining decisions and interacting with an audience. They are not 17 additional official requirements or 17 separate assignments; several skills can be practiced in one session.</p>
        <p>A full Network Design role-play can exercise its seven presentation criteria together, and a Sales run-through can cover several sales skills. Choosing a recovery plan is a scenario-based technical skill, not an eighth role-play rubric criterion. The reference IDs connect each skill to the course material; they do not need to be memorized.</p>
        ${['network-design', 'sales'].map(event => `<details class="rehearsal-group"><summary>${eventInfo[event].name}: ${rehearsalItems.filter(item => item.event === event).length} skills to practice</summary><ol>${rehearsalItems.filter(item => item.event === event).map(item => `<li data-objective="${escapeHTML(item.id)}"><strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.practice)}</p><p><a href="fbla-${event}.html#${escapeHTML(item.sheet)}">Open the related study sheet</a> · <span class="fbla-local-id">Study reference: <bdi dir="ltr">${escapeHTML(item.id)}</bdi></span></p></li>`).join('')}</ol></details>`).join('\n        ')}
        <p><strong>How to rehearse:</strong> read the related sheet, attempt the task without the model answer, and have a partner note what you explained well, what you missed and how you handled questions. If practicing alone, record a first attempt; later use a partner for unpredictable interaction. Repeat the weak part, then try a new scenario.</p>
        <p><strong>Timing in the National 2026–27 guides:</strong> Network Design uses 20 minutes of preparation and a 7-minute presentation. Sales uses 3 minutes of setup and a 7-minute presentation. Questions can occur during either presentation; there is no separate Q&amp;A segment. Confirm the format used at your competition.</p>
        <p><strong>Practice beyond this checklist.</strong> Related-product suggestions, event protocols and technical troubleshooting also need application. Use the event courses and official guidelines to plan broader preparation; this list is a set of practice prompts, not a complete measure of readiness.</p>
      </section>
      <section class="fbla-section" id="competition-rules">
        <h2>Before competition: confirm the rules</h2>
        <p>These materials follow the <strong>National 2026–27</strong> guides. Check the applicable state or regional FBLA association and ask an adviser about qualification, entry limits, deadlines and conference-specific rules. Studying four events does not establish eligibility to enter all four.</p>
        <p>Ask for clarification on the Network Design guide's conflicting visual-aid language and undefined “SMP,” and the Sales guide's conflicting final-round electricity statements. Do not assume a permitted visual aid or power supply; prepare an appropriate contingency.</p>
        <p><a href="https://www.fbla.org/hs-ce-26-27/">National event resources</a> · <a href="#source-ledger">Source details and limitations</a></p>
      </section>
       <section class="fbla-note" id="ipv4-pilot" aria-label="IPv4 subnetting worked example">
        <p><strong>Optional worked example:</strong> the subnetting lesson below demonstrates the read → recall → apply loop. Skip it if you can already solve and explain these problems; it is not the required first lesson.</p>
        <p class="fbla-download"><a href="notes/fbla/ipv4-subnetting.txt" download>Download printable plain-text note</a> · <a href="notes/fbla/ipv4-subnetting.txt">Open plain-text source</a></p>
        ${article.join('\n        ')}
       </section>
       ${courseHTML}
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
