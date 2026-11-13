import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { renderHome } from './home.mjs';
import { renderFlashcards } from './flashcards.mjs';
import { renderFbla, renderCourseSheets, renderEvent, renderCourseHub, colorSheet } from './fbla.mjs';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');
export const palette = { g: '#168438', li: '#79c900', pu: '#883ac2', br: '#92552f', or: '#e67e22', y: '#287db3', p: '#ed8eb4', lb: '#59b8e7', hp: '#ec228c', pen: '#62615e' };
// Unit 4 uses the FBLA inks; legacy notes keep their original medium-blue y.
export const unit4Palette = { g: '#168438', li: '#79c900', pu: '#883ac2', or: '#e67e22', y: '#ebc600', p: '#ed8eb4', lb: '#59b8e7', hp: '#ec228c', r: '#df3034', db: '#173f88', mb: '#287db3', pen: '#62615e' };
export const units = [
  { name: 'The Global Tapestry', topics: [
    ['1.1-east-asia', 'Developments in East Asia'],
    ['1.2-dar-al-islam', 'Developments in Dar al-Islam'],
    ['1.3-south-southeast-asia', 'Developments in South and Southeast Asia'],
    ['1.4-americas', 'State Building in the Americas'],
    ['1.5-africa', 'State Building in Africa'],
    ['1.6-europe', 'Developments in Europe'],
    ['1.7-comparison', 'Comparison in the Period from c. 1200 to c. 1450'],
  ] },
  { name: 'Networks of Exchange', topics: [
    ['2.1-silk-roads', 'The Silk Roads'],
    ['2.2-mongol-empire', 'The Mongol Empire and the Making of the Modern World'],
    ['2.3-indian-ocean', 'Exchange in the Indian Ocean'],
    ['2.4-trans-saharan-trade', 'Trans-Saharan Trade Routes'],
    ['2.5-cultural-consequences', 'Cultural Consequences of Connectivity'],
    ['2.6-environmental-consequences', 'Environmental Consequences of Connectivity'],
    ['2.7-comparison', 'Comparison in Networks of Exchange'],
  ] },
  { name: 'Land-Based Empires', period: 'c. 1450–1750', topics: [
    ['3.1-empires-expand', 'Empires Expand'],
    ['3.2-administration', 'Empires: Administration'],
    ['3.3-belief-systems', 'Empires: Belief Systems'],
    ['3.4-comparison', 'Comparison in Land-Based Empires'],
    ['3-supplement', 'Military and Imperial Government', 'Unit 3 Supplement 1'],
    ['3-supplement-2', 'Beliefs, Legitimacy, and Comparison', 'Unit 3 Supplement 2'],
  ] },
  { name: 'Transoceanic Interconnections', period: 'c. 1450–1750', inks: unit4Palette, topics: [
    ['4.1-technological-innovations', 'Technological Innovations from 1450 to 1750'],
    ['4.2-exploration', 'Exploration: Causes and Events from 1450 to 1750'],
    ['4.3-columbian-exchange', 'Columbian Exchange'],
    ['4.4-empires-established', 'Maritime Empires Established'],
    ['4.5-empires-maintained', 'Maritime Empires Maintained and Developed'],
    ['4.6-state-challenges', 'Internal and External Challenges to State Power from 1450 to 1750'],
    ['4.7-social-hierarchies', 'Changing Social Hierarchies from 1450 to 1750'],
    ['4.8-continuity-change', 'Continuity and Change from 1450 to 1750'],
  ] },
];
const marker = /\((g|li|pu|br|or|y|p|lb|hp|r|db|mb|pen)\)/g;
const normalize = text => text.replace(/\r\n/g, '\n');
const lines = text => normalize(text).replace(/\n$/, '').split('\n');
export const escapeHTML = text => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function spans(line) {
  const matches = [...line.matchAll(marker)];
  return matches.map((match, index) => ({ color: match[1], text: line.slice(match.index + match[0].length, matches[index + 1]?.index ?? line.length) }));
}

export function validateSheet(original, colored, name, pencil = false, inks = palette) {
  const check = (condition, message) => assert.ok(condition, `${name}: ${message}`);
  check(normalize(colored).replace(marker, '') === normalize(original), 'exact stripped equality');
  const source = lines(original);
  const marked = lines(colored);
  check(source.length === 48 && marked.length === 48, '48 lines / two 24-line pages');
  const renderings = new Map();
  marked.forEach((line, index) => {
    const text = source[index];
    check(text.length <= 65 && /^(o |-> )\S/.test(text) && !/\s$/.test(text), `line ${index + 1}: prefix, whitespace and max 65 characters`);
    check(line.startsWith('(pen)') && !/\([a-z]+\)/i.test(text), `line ${index + 1}: valid markers and initial pencil`);
    if (pencil) check(line === `(pen)${text}`, `line ${index + 1}: pencil-only marked line`);
    const parts = spans(line);
    check(parts.every(part => Object.hasOwn(inks, part.color)), `line ${index + 1}: valid palette markers`);
    const colors = parts.flatMap(part => Array(part.text.length).fill(part.color));
    const highlights = new Set(parts.filter(part => part.color !== 'pen').map(part => part.color));
    check(highlights.size <= 2, `line ${index + 1}: at most two highlight colors`);
    parts.forEach((part, n) => {
      if (part.color === 'pen') return;
      check(/^[A-Za-z](?:[A-Za-z ]*[A-Za-z])?$/.test(part.text), `line ${index + 1}: neutral punctuation / colored words only`);
      check(parts[n + 1]?.color === 'pen', `line ${index + 1}: immediate pencil reset`);
    });
    const prefix = text.startsWith('o ') ? 2 : 3;
    check(colors.slice(0, prefix).every(color => color === 'pen'), `line ${index + 1}: neutral prefix`);
    if (text === 'o Overview') check(highlights.size === 0, 'Overview stays pencil');
    const title = text.slice(prefix);
    const isTitle = source.some(item => item === `o ${title}` && item !== 'o Overview');
    if (!isTitle) {
      if (inks === unit4Palette) {
        const words = [...text.matchAll(/[A-Za-z]+(?:['-][A-Za-z]+)*/g)];
        check(words.filter(word => colors.slice(word.index, word.index + word[0].length).some(color => color !== 'pen')).length <= 2, `line ${index + 1}: at most two highlighted words`);
      }
      return;
    }
    if (pencil) {
      check(highlights.size === 0, `${title}: pencil-only title`);
      const rendering = colors.slice(prefix).join(',');
      check(!renderings.has(title) || renderings.get(title) === rendering, `${title}: matching Overview/header rendering`);
      renderings.set(title, rendering);
      return;
    }
    check(highlights.size === 1 && !highlights.has('lb'), `${title}: one reserved non-LB title color`);
    const color = [...highlights][0];
    check([...title].every((char, n) => /[A-Za-z]/.test(char) ? colors[n + prefix] === color : char === ' ' || colors[n + prefix] === 'pen'), `${title}: full uniform title`);
    const rendering = colors.slice(prefix).join(',');
    check(!renderings.has(title) || renderings.get(title) === rendering, `${title}: matching Overview/header colors`);
    renderings.set(title, rendering);
  });
  [0, 24].forEach(offset => {
    const page = source.slice(offset, offset + 24);
    check(page[0] === 'o Overview', 'each page begins with o Overview');
    const first = page.findIndex((line, index) => index > 0 && line.startsWith('o '));
    const headers = page.filter((line, index) => index > 0 && line.startsWith('o ')).map(line => line.slice(2));
    check(first > 1 && headers.length >= 2 && headers.length <= 5, 'page has 2-5 headers');
    check(JSON.stringify(page.slice(1, first).map(line => line.slice(3))) === JSON.stringify(headers), 'exact ordered same-page Overview listings');
    page.forEach((line, index) => {
      if (index && line.startsWith('o ')) check(page[index + 1]?.startsWith('-> '), 'header has supporting content');
    });
  });
  return marked;
}

export function loadNotes(paths = units.map((_, index) => resolve(root, 'notes', `unit-${index + 1}`))) {
  return units.map((unit, index) => ({ ...unit, topics: unit.topics.map(([file, title, displayLabel, pencil]) => {
    const original = readFileSync(resolve(paths[index], `${file}.txt`), 'utf8');
    const colored = readFileSync(resolve(paths[index], 'Colored', `${file}.txt`), 'utf8');
    const shortLabel = displayLabel ?? file.slice(0, 3);
    return { file, title, label: shortLabel, heading: `${shortLabel}${displayLabel ? ':' : ''} ${title}`, original, colored, pencil, lines: validateSheet(original, colored, file, pencil, unit.inks ?? palette) };
  }) }));
}

export function renderLine(line) {
  return spans(line).map(part => part.color === 'pen' ? escapeHTML(part.text) : `<span class="ink ${part.color}">${escapeHTML(part.text)}</span>`).join('');
}

export function loadLangNotes() {
  return loadMarkedNotes('', 'ap-lang');
}

export function loadAlgebraNotes() {
  return [
    ['1.5-linear', '1.5', 'Graphing Linear Functions and Inequalities'],
    ['1.6.1-piecewise', '1.6.1', 'Piecewise Functions'],
    ['1.6.2-step', '1.6.2', 'Step Functions'],
    ['1.6.3-absolute-value', '1.6.3', 'Absolute Value Functions'],
    ['1.7.1-parents', '1.7.1', 'Parent Functions'],
    ['1.7.2-translations', '1.7.2', 'Translations of Functions'],
    ['1.7.3-dilations', '1.7.3', 'Dilations and Reflections'],
    ['1.7.3-combined', '1.7.3', 'Combined Transformations'],
    ['2.3-linear-equations', '2.3', 'Equations of Linear Functions'],
    ['2.4-graphing-systems', '2.4', 'Solving Systems of Equations Graphically'],
    ['2.5-algebraic-systems', '2.5', 'Solving Systems of Equations Algebraically'],
    ['2.6-inequality-systems', '2.6', 'Solving Systems of Inequalities'],
    ['2.7-linear-programming', '2.7', 'Optimization with Linear Programming'],
  ].map(([file, label, title]) => ({ file, label, title, ...loadMarkedNotes('algebra-2', file) }));
}

function loadMarkedNotes(folder, file) {
  const source = readFileSync(resolve(root, 'notes', folder, `${file}.txt`), 'utf8');
  const colored = readFileSync(resolve(root, 'notes', folder, 'Colored', `${file}.txt`), 'utf8');
  assert.equal(normalize(colored).replace(marker, ''), normalize(source), `${file}: exact stripped equality`);
  const marked = lines(colored);
  const sections = lines(source).reduce((sections, text, index) => {
    assert.ok(text.length <= 65 && text.trim() === text && /^(o |-> )\S/.test(text), `${file}: prefixes, trimmed lines, max 65 characters`);
    assert.ok(marked[index].startsWith('(pen)'), `${file}: initial pencil`);
    const parts = spans(marked[index]);
    assert.ok(parts.every(part => Object.hasOwn(palette, part.color)), `${file}: legacy palette markers`);
    const colors = parts.flatMap(part => Array(part.text.length).fill(part.color));
    assert.ok(new Set(parts.filter(part => part.color !== 'pen').map(part => part.color)).size <= 2, `${file}: at most two highlight colors`);
    parts.forEach((part, n) => {
      if (part.color === 'pen') return;
      assert.match(part.text, /^[A-Za-z](?:[A-Za-z ]*[A-Za-z])?$/, `${file}: colored words only, neutral punctuation`);
      assert.equal(parts[n + 1]?.color, 'pen', `${file}: immediate pencil reset`);
    });
    const prefix = text.startsWith('o ') ? 2 : 3;
    assert.ok(colors.slice(0, prefix).every(color => color === 'pen'), `${file}: neutral prefixes`);
    if (text.startsWith('o ')) {
      const color = parts.find(part => part.color !== 'pen')?.color;
      assert.ok(color && color !== 'lb', `${file}: one reserved non-LB title ink`);
      assert.ok([...text.slice(2)].every((char, n) => /[A-Za-z]/.test(char) ? colors[n + 2] === color : char === ' ' || colors[n + 2] === 'pen'), `${file}: full uniform title`);
      sections.push({ color, lines: [] });
    }
    assert.ok(sections.length, `${file}: first line must be a section heading`);
    sections.at(-1).lines.push(text);
    return sections;
  }, []);
  const pageSize = folder === 'algebra-2' ? 29 : 24;
  assert.ok(sections.flatMap(section => section.lines).length % pageSize === 0, `${file}: complete ${pageSize}-line pages`);
  return { source, colored, sections };
}

export function renderSite(data, lang, algebra) {
  const title = algebra ? 'Algebra 2: Functions and Linear Systems' : lang ? 'AP Lang Unit 1: Rhetorical Analysis' : 'AP World History Notes';
  const study = lang ? [{ ...lang, file: 'ap-lang', label: 'AP Lang', title }] : algebra ?? [];
  const pageSize = algebra ? 29 : 24;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${algebra ? 'Algebra 2: Functions and Linear Systems. Thirteen lessons across twenty-six color-coded 29-line pages cover linear graphs, inequalities, piecewise and step functions, absolute value, parent functions, transformations, equations of linear functions, solving systems of equations graphically, solving systems of equations algebraically, systems of inequalities, and linear programming.' : lang ? 'Color-coded AP Lang rhetorical analysis notes: describe, function, effect, justify, and connection-building guidance.' : 'AP World History Units 1–4: twenty-six official topics plus two Unit 3 supplements, twenty-eight study sheets, fifty-six printable note pages, and original and marked text downloads.'}">
  <title>${title}</title>
  <link rel="stylesheet" href="styles/site.css">
  <style>
    :root { ${Object.entries(palette).map(([token, hex]) => `--${token}: ${hex};`).join(' ')} --note-row-height: ${algebra ? '8mm' : '8.8mm'}; }
    #notes { padding-block: 6px 40px; }
    #notes:focus { outline: none; }
    .legend { display: flex; flex-wrap: wrap; gap: 7px 15px; font: 12px/1.5 system-ui, sans-serif; }
    .legend span { display: inline-flex; align-items: center; gap: 5px; }
    .swatch { width: 9px; height: 9px; border-radius: 50%; }
    .unit-title { font-size: 30px; font-weight: normal; border-block-start: 1px solid var(--ink); padding-block-start: 22px; }
    ${Object.keys(palette).map(token => `.ink.${token} { color: var(--${token}); } .swatch.${token} { background: var(--${token}); }`).join('\n    ')}${data.some(unit => unit.inks) ? `
    .unit-4-palette { ${Object.entries(unit4Palette).map(([token, hex]) => `--${token}: ${hex};`).join(' ')} }
    ${Object.keys(unit4Palette).map(token => `.unit-4-palette .ink.${token} { color: var(--${token}); } .unit-4-palette .swatch.${token} { background: var(--${token}); }`).join('\n    ')}` : ''}
    @media print {
      #notes { padding: 0; }
      .unit-title { display: none; }${data.some(unit => unit.inks) ? '\n      .unit-palette { display: none; }' : ''}
      .unit:last-child .topic:last-child article:last-child { break-after: auto; }
      .study .topic:last-child article:last-child { break-after: auto; }
    }
  </style>
</head>
<body class="notes-site">
  <a class="skip" href="#notes">Skip to notes</a>
  <div class="wrap">
  <header>
    <div class="masthead"><p class="wordmark">Joltlined</p><p class="masthead-note">Notes &amp; literary analysis</p></div>
     <nav class="subjects" aria-label="Subjects"><a href="index.html">Home</a><a href="ap-lang.html"${lang ? ' aria-current="page"' : ''}>AP Lang Notes</a><a href="ap-world.html"${study.length ? '' : ' aria-current="page"'}>AP World History Notes</a><a href="algebra-2.html"${algebra ? ' aria-current="page"' : ''}>Algebra 2 Notes</a><a href="fbla.html">FBLA Study Plan</a><a href="out-of-my-mind.html">Out Of My Mind Analysis</a><a href="of-mice-and-men.html">Of Mice And Men Analysis</a><a href="fahrenheit-451.html">Fahrenheit 451 Analysis</a></nav>
    <div class="notes-intro">
    <p class="eyebrow">${algebra ? 'Algebra 2 / Modules 1B &amp; 2A' : lang ? 'AP English Language / Unit 1' : 'AP World History / Units 1–4'}</p>
    <h1>${title}</h1>
    ${algebra ? `<p>Modules 1B &amp; 2A · Functions and Linear Systems · 13 lessons · 26 pages · 29 lines per page</p>
    <p>Packet-guided rules, worked examples, and checks. Unreadable source graphs are not reconstructed; added examples are labeled.</p>
    <p>The new Module 2A notes are original study summaries based on the McGraw Hill Module 2A (2.3–2.7) classroom slides, PDF pp. 1–182; examples are practice, not an official answer key.</p>
    <p>Notation: R means real numbers; inf means infinity; ^ denotes a power; floor(x) is the greatest integer at most x. Math symbols remain pencil.</p>
    <p class="flashcard-link"><a href="algebra-2-flashcards.html">Study the Algebra 2 teaching flashcards →</a></p>
    <ol class="contents">${algebra.map(lesson => `<li><a href="#topic-${escapeHTML(lesson.file.replaceAll('.', '-'))}">${escapeHTML(lesson.label)} ${escapeHTML(lesson.title)}</a></li>`).join('')}</ol>` : lang ? `<p>Unit 1 · Building commentary connections · ${lang.sections.length} color-coded sections · 4 pages · 24 lines per page</p>
    <p>Describe the choice, explain its function, trace a possible audience effect, and justify its contribution to the author's purpose.</p>
    <p>Food-labeling examples are paraphrases or clearly marked hypothetical examples, not direct quotations or guaranteed audience responses. Each note line is at most 65 characters.</p>
    <p class="downloads"><a href="data:text/plain;charset=utf-8;base64,${Buffer.from(lang.source).toString('base64')}" download="ap-lang.txt">Download AP Lang original</a> · <a href="data:text/plain;charset=utf-8;base64,${Buffer.from(lang.colored).toString('base64')}" download="ap-lang-colored.txt">Download AP Lang colored</a> · <a href="notes/ap-lang.txt">Open original file</a> · <a href="notes/Colored/ap-lang.txt">Open colored file</a></p>
    <p>Use your browser's Print command for colored, numbered sheets. The shared World History inks highlight key words; body text and punctuation stay pencil.</p>` : `<p>Units 1–4 · c. 1200–1750 · 26 official topics + 2 Unit 3 supplements · 28 study sheets · 56 note pages</p>
    <nav aria-label="Units">${data.map((unit, index) => `<a href="#unit-${index + 1}">Unit ${index + 1}: ${escapeHTML(unit.name)}${unit.period ? `, ${escapeHTML(unit.period)}` : ''}</a>`).join('')}</nav>
    <ol class="contents">${data.flatMap(unit => unit.topics.map(topic => `<li><a href="#topic-${escapeHTML(topic.file.replaceAll('.', '-'))}">${escapeHTML(topic.heading)}</a></li>`)).join('')}</ol>
    <p>All notes are visible below. Use your browser’s Print command for one note page per printed page. Marked text downloads retain the source markers.</p>
    <p>Units 1–3 retain the legacy inks below. Unit 4 uses all eleven FBLA inks, with its own legend: y is yellow there, while mb is medium blue. These concise content-review sheets complement source analysis and AP writing practice.</p>`}
    <div class="legend" role="group" aria-label="Token color legend">${Object.keys(palette).map(token => `<span><i class="swatch ${token}" aria-hidden="true"></i>${token} ${({ g: 'dark green', li: 'lime green', pu: 'purple', br: 'brown', or: 'orange', y: 'medium blue', p: 'pink', lb: 'light blue', hp: 'hot pink', pen: 'pencil' })[token]}</span>`).join('')}</div>
    </div>
  </header>
  <main id="notes" tabindex="-1"${study.length ? ' class="study"' : ''}>${study.length ? study.map(topic => `<section class="topic" id="topic-${escapeHTML(topic.file.replaceAll('.', '-'))}" aria-labelledby="topic-${escapeHTML(topic.file.replaceAll('.', '-'))}-title">
    <h2 class="topic-title" id="topic-${escapeHTML(topic.file.replaceAll('.', '-'))}-title">${algebra ? `${escapeHTML(topic.label)} ` : ''}${escapeHTML(topic.title)}</h2>
    ${algebra ? `<p class="downloads"><a href="data:text/plain;charset=utf-8;base64,${Buffer.from(topic.source).toString('base64')}" download="${escapeHTML(topic.file)}.txt">Download ${escapeHTML(topic.label)} original</a> · <a href="data:text/plain;charset=utf-8;base64,${Buffer.from(topic.colored).toString('base64')}" download="${escapeHTML(topic.file)}-colored.txt">Download ${escapeHTML(topic.label)} colored</a> · <a href="notes/algebra-2/${escapeHTML(topic.file)}.txt">Open original file</a> · <a href="notes/algebra-2/Colored/${escapeHTML(topic.file)}.txt">Open colored file</a></p>` : ''}<div class="pages">${Array.from({ length: lines(topic.colored).length / pageSize }, (_, page) => `<article aria-label="${escapeHTML(topic.label)} page ${page + 1}">
    <h3 class="page-title">${algebra ? `${escapeHTML(topic.label)} ` : ''}${escapeHTML(topic.title)}</h3>
    <p class="caption">Page ${page + 1}${algebra ? '' : ` · ${page < 2 ? 'Building commentary' : 'Deepening analysis'}`} · Lines ${page * pageSize + 1}–${page * pageSize + pageSize}</p>
    <div class="sheet">${lines(topic.colored).slice(page * pageSize, page * pageSize + pageSize).map((line, index) => `<div class="line"><span class="number" aria-hidden="true">${page * pageSize + index + 1}</span><span class="note">${renderLine(line)}</span></div>`).join('\n')}</div>
  </article>`).join('\n')}</div></section>`).join('\n') : data.map((unit, index) => `
    <section class="unit${unit.inks ? ' unit-4-palette' : ''}" id="unit-${index + 1}" aria-labelledby="unit-${index + 1}-title">
      <h2 class="unit-title" id="unit-${index + 1}-title">Unit ${index + 1}: ${escapeHTML(unit.name)}${unit.period ? `, ${escapeHTML(unit.period)}` : ''}</h2>${unit.inks ? `
      <div class="unit-palette"><p>Eight official topics · 16 note pages · 384 note lines. Unit 4 inks are scoped here without recoloring earlier units. Light blue identifies topic titles; other inks identify sections and selected keywords.</p><div class="legend" role="group" aria-label="Unit 4 token color legend">${Object.keys(unit.inks).map(token => `<span><i class="swatch ${token}" aria-hidden="true"></i>${token} ${({ g: 'dark green', li: 'lime green', pu: 'purple', or: 'orange', y: 'yellow', p: 'pink', lb: 'light blue', hp: 'hot pink', r: 'red', db: 'dark blue', mb: 'medium blue', pen: 'pencil' })[token]}</span>`).join('')}</div></div>` : ''}
      ${unit.topics.map(topic => `<section class="topic" id="topic-${escapeHTML(topic.file.replaceAll('.', '-'))}" aria-labelledby="topic-${escapeHTML(topic.file.replaceAll('.', '-'))}-title">
        <h3 class="topic-title" id="topic-${escapeHTML(topic.file.replaceAll('.', '-'))}-title">${escapeHTML(topic.heading)}</h3>
        <p class="downloads"><a href="data:text/plain;charset=utf-8;base64,${Buffer.from(topic.original).toString('base64')}" download="${escapeHTML(topic.file)}.txt">Download ${escapeHTML(topic.label)} original</a> · <a href="data:text/plain;charset=utf-8;base64,${Buffer.from(topic.colored).toString('base64')}" download="${escapeHTML(topic.file)}${topic.pencil ? '-pencil' : index >= 2 ? '-colored' : ''}.txt">Download ${escapeHTML(topic.label)} ${topic.pencil ? 'pencil' : 'colored'}</a> · <a href="notes/unit-${index + 1}/${escapeHTML(topic.file)}.txt">Open original file</a> · <a href="notes/unit-${index + 1}/Colored/${escapeHTML(topic.file)}.txt">Open ${topic.pencil ? 'pencil' : 'colored'} file</a>${topic.pencil ? ' · Color coding pending' : ''}</p>
        <div class="pages">${[0, 1].map(page => `<article aria-label="${escapeHTML(topic.label)} page ${page + 1}">
          <h4 class="page-title">${escapeHTML(topic.heading)}</h4>
          <p class="caption">Page ${page + 1} · Lines ${page * 24 + 1}–${page * 24 + 24}</p>
          <div class="sheet">${topic.lines.slice(page * 24, page * 24 + 24).map((line, n) => `<div class="line"><span class="number" aria-hidden="true">${page * 24 + n + 1}</span><span class="note">${renderLine(line)}</span></div>`).join('\n')}</div>
        </article>`).join('')}</div>
      </section>`).join('\n')}
    </section>`).join('\n')}
  </main>
  <footer><p>The approved pastel ink palette is preserved. Some ink colors do not meet WCAG text contrast requirements; original pencil-only text files are available for every topic.</p><a href="#notes">Back to notes</a></footer>
  </div>
</body>
</html>
`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({ options: { unit1: { type: 'string' }, unit2: { type: 'string' }, unit3: { type: 'string' }, unit4: { type: 'string' }, preview: { type: 'string' } } });
  const paths = units.map((_, index) => resolve(values[`unit${index + 1}`] ?? resolve(root, 'notes', `unit-${index + 1}`)));
  // Validate every source before importing anything or replacing the current site.
  const data = loadNotes(paths);
  const course = renderCourseSheets(undefined, palette);
  const lang = loadLangNotes();
  const algebra = loadAlgebraNotes();
  const html = renderSite(data);
  const destinations = [resolve(root, 'index.html'), ...(values.preview ? [resolve(values.preview)] : [])];
  destinations.forEach(destination => {
    const target = dirname(destination);
    mkdirSync(target, { recursive: true });
    data.forEach((unit, index) => unit.topics.forEach(topic => {
      ['', 'Colored'].forEach(folder => {
        const source = resolve(paths[index], folder, `${topic.file}.txt`);
        const output = resolve(target, 'notes', `unit-${index + 1}`, folder, `${topic.file}.txt`);
        if (source === output) return;
        mkdirSync(dirname(output), { recursive: true });
        copyFileSync(source, output);
      });
    }));
    if (destination !== resolve(target, 'index.html')) writeFileSync(destination, html);
    writeFileSync(resolve(target, 'index.html'), renderHome());
    writeFileSync(resolve(target, 'ap-world.html'), html);
    writeFileSync(resolve(target, 'ap-lang.html'), renderSite([], lang));
    writeFileSync(resolve(target, 'algebra-2.html'), renderSite([], undefined, algebra));
    writeFileSync(resolve(target, 'algebra-2-flashcards.html'), renderFlashcards(escapeHTML, loadAlgebraNotes));
    writeFileSync(resolve(target, 'fbla.html'), renderFbla(undefined, renderCourseHub(course), palette));
    for (const event of ['networking', 'cybersecurity', 'network-design', 'sales']) writeFileSync(resolve(target, `fbla-${event}.html`), renderEvent(event, course, palette));
    const coverage = course.sheets.flatMap(({ module, sheet }) => sheet.pages.flatMap((page, pageIndex) => page.map((section, sectionIndex) => {
      const start = pageIndex * 24 + (sectionIndex === 0 ? 5 : 15);
      return { module: module.id, sheet: sheet.id, section: section.title, objectives: section.objectives, lines: [start, start + section.notes.length - 1], sources: section.sources.map(id => module.sources.find(source => source.id === id).url) };
    })));
    const ledger = { edition: 'National 2026–27', objectiveIds: course.objectiveList, coverage, sources: [...new Map(course.sheets.flatMap(({ module }) => module.sources.map(source => [`${module.id}:${source.id}`, { module: module.id, ...source }]))).values()], limitations: [...new Set(course.sheets.flatMap(({ module }) => module.limitations))] };
    writeFileSync(resolve(target, 'fbla-sources.json'), JSON.stringify(ledger, null, 2) + '\n');
    writeFileSync(resolve(target, 'fbla-course-manifest.json'), JSON.stringify({ modules: course.sheets.reduce((result, item) => result.includes(item.module.id) ? result : [...result, item.module.id], []), sheets: course.sheets.map(item => item.sheet.id), objectives: course.objectiveList }, null, 2) + '\n');
    course.sheets.forEach(({ sheet, plain }) => {
      for (const [folder, content] of [['', plain], ['Colored', colorSheet(plain, palette, sheet.id)]]) {
        const output = resolve(target, 'notes', 'fbla', 'course', folder, `${sheet.id}.txt`);
        mkdirSync(dirname(output), { recursive: true });
        writeFileSync(output, content);
      }
    });
    if (target !== root) {
      mkdirSync(resolve(target, 'styles'), { recursive: true });
      copyFileSync(resolve(root, 'styles', 'site.css'), resolve(target, 'styles', 'site.css'));
      copyFileSync(resolve(root, 'out-of-my-mind.html'), resolve(target, 'out-of-my-mind.html'));
      copyFileSync(resolve(root, 'of-mice-and-men.html'), resolve(target, 'of-mice-and-men.html'));
      copyFileSync(resolve(root, 'fahrenheit-451.html'), resolve(target, 'fahrenheit-451.html'));
      mkdirSync(resolve(target, 'assets', 'images'), { recursive: true });
      ['cover', 'of-mice-and-men-cover', 'fahrenheit-451-cover', 'author', 'class', 'talker', 'inclusiveness', 'school', 'home', 'excluded', 'perspective', 'voice', 'meditalker'].forEach(image => copyFileSync(resolve(root, 'assets', 'images', `${image}.jpg`), resolve(target, 'assets', 'images', `${image}.jpg`)));
      copyFileSync(resolve(root, 'notes', 'ap-lang.txt'), resolve(target, 'notes', 'ap-lang.txt'));
      mkdirSync(resolve(target, 'notes', 'Colored'), { recursive: true });
      copyFileSync(resolve(root, 'notes', 'Colored', 'ap-lang.txt'), resolve(target, 'notes', 'Colored', 'ap-lang.txt'));
      mkdirSync(resolve(target, 'notes', 'fbla'), { recursive: true });
      copyFileSync(resolve(root, 'notes', 'fbla', 'ipv4-subnetting.txt'), resolve(target, 'notes', 'fbla', 'ipv4-subnetting.txt'));
      algebra.forEach(lesson => ['', 'Colored'].forEach(folder => {
        mkdirSync(resolve(target, 'notes', 'algebra-2', folder), { recursive: true });
        copyFileSync(resolve(root, 'notes', 'algebra-2', folder, `${lesson.file}.txt`), resolve(target, 'notes', 'algebra-2', folder, `${lesson.file}.txt`));
      }));
    }
     console.log(`Built ${target}: Home, World History (56 pages), AP Lang (4 pages), Algebra 2 (26 pages), FBLA study plan, and three literary companions; offline downloads and previews preserved.`);
  });
}
