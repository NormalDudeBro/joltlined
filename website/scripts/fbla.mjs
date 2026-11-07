import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const escapeHTML = text => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const source = fileURLToPath(new URL('../public/notes/fbla/ipv4-subnetting.txt', import.meta.url));
const events = [
  {
    name: 'Networking Infrastructures', file: 'Networking-Infrastructures', id: 'networking', edition: '2025–26 provisional',
    domains: [['Networking basics', 20], ['Topologies and architecture', 20], ['Network security', 25], ['Protocols and standards', 20], ['Hardware and connectivity', 15]],
    action: 'Connect your networking knowledge to the detailed objectives; test unfamiliar addressing, protocol, media, and troubleshooting decisions.',
  },
  {
    name: 'Cybersecurity', file: 'Cybersecurity', id: 'cybersecurity', edition: '2026–27 verified document',
    domains: [['Fundamentals', 15], ['Threats and vulnerabilities', 20], ['Security and design', 20], ['Network and data security', 15], ['Operations and management', 10], ['Protocols and threat mitigation', 20]],
    action: 'Distinguish similar controls and attacks. Explain why a protection works, its limits, and which evidence would change your response.',
  },
  {
    name: 'Network Design', file: 'Network-Design', id: 'network-design', edition: '2025–26 provisional',
    domains: [['Installation and configuration', 25], ['Security and recovery', 20], ['Administration', 20], ['Planning', 15], ['Protocols, services, and access', 20]],
    action: 'Practice the technical test and spoken recommendations separately: requirements, alternatives, implementation, costs, recovery, and verification.',
  },
  {
    name: 'Sales Presentation', file: 'Sales-Presentation', id: 'sales', edition: '2025–26 provisional', domains: [],
    action: 'Develop a complete, truthful pitch: discover needs, demonstrate relevant value, handle objections, explain scope and costs, and request an appropriate next step.',
  },
];

export function renderFbla(note = readFileSync(source, 'utf8')) {
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
  <meta name="description" content="FBLA event references and an original IPv4 subnetting study pilot, with worked examples, retrieval questions, an answer key, and a networking lab.">
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
        <p>Use official objectives to choose what to learn, notes to understand it, recall to remember it, and unfamiliar practice to test it. This is a first study slice, not a complete event course or an exam-readiness certification.</p>
        <p class="fbla-caveat"><strong>Edition status:</strong> Only Cybersecurity 2026–27 has been verified from an accessible guideline document. Networking Infrastructures, Network Design, and Sales Presentation use provisional 2025–26 references: current-year requirements not verified. Confirm the applicable division, year, local rules, and rubric with your adviser.</p>
        <p><a href="#ipv4-pilot">Study IPv4 subnetting and VLSM</a> · <a href="https://www.fbla.org/hs-ce-26-27/">National event resources</a></p>
      </section>
      <div class="fbla-grid">
        ${events.map(event => `<section class="fbla-card" id="${event.id}"><h2>${event.name}</h2><p><strong>${event.edition}.</strong> <a href="https://www.pafbla.org/wp-content/uploads/2026/08/${event.file}.pdf">Reference guideline PDF</a></p>${event.domains.length ? `<p>Test items by knowledge area in that document:</p><ul>${event.domains.map(([name, count]) => `<li>${name}: ${count} of 100</li>`).join('')}</ul>` : '<p>Interactive presentation: use the applicable rating sheet for discovery, product knowledge, objections, related offerings, closing, follow-up, organization, delivery, and interaction.</p>'}<p>${event.action}</p></section>`).join('\n        ')}
      </div>
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
