import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fblaModules, rehearsalItems, renderFbla, renderCourseSheets, renderCourseHub, renderEvent, colorSheet } from '../scripts/fbla.mjs';
import { palette } from '../scripts/build.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const source = readFileSync(resolve(root, 'notes/fbla/ipv4-subnetting.txt'), 'utf8');
const html = readFileSync(resolve(root, 'fbla.html'), 'utf8');
const course = renderCourseSheets(undefined, palette);
const invalid = JSON.parse(JSON.stringify(fblaModules));
invalid[0].sheets[0].pages[0][0].notes.pop();
assert.throws(() => renderCourseSheets(invalid, palette), /expected 9 notes/);
const duplicate = JSON.parse(JSON.stringify(fblaModules));
duplicate[1].sheets[0].id = duplicate[0].sheets[0].id;
assert.throws(() => renderCourseSheets(duplicate, palette), /duplicate or missing sheet id/);
const unsafeSheet = structuredClone(fblaModules);
unsafeSheet[0].sheets[0].id = '../outside-course';
assert.throws(() => renderCourseSheets(unsafeSheet, palette), /unsafe sheet id/);
const unknownSource = JSON.parse(JSON.stringify(fblaModules));
unknownSource[0].sheets[0].pages[0][0].sources[0] = 'missing-source';
assert.throws(() => renderCourseSheets(unknownSource, palette), /unknown source/);
const unknownObjective = JSON.parse(JSON.stringify(fblaModules));
unknownObjective[0].sheets[0].pages[0][0].objectives[0] = 'ZZ-BOGUS-01';
assert.throws(() => renderCourseSheets(unknownObjective, palette), /invalid local objective ID/);
const inventedObjective = JSON.parse(JSON.stringify(fblaModules).replaceAll('NI-NB-01', 'NI-NB-99'));
assert.throws(() => renderCourseSheets(inventedObjective, palette), /unknown local objective ID/);
const truncated = structuredClone(fblaModules);
truncated[0].sheets[0].pages[0][0].notes[0] = 'An endpoint depends on';
assert.throws(() => renderCourseSheets(truncated, palette), /complete note/);
assert.equal(html, renderFbla(source, renderCourseHub(course)), 'FBLA page is reproducible from its source');
assert.equal(course.sheets.length, 44);
assert.equal(course.objectiveList.length, 160);
assert.ok(course.objectiveList.includes('ND-RP-07'));
assert.equal(course.sheets.reduce((sum, item) => sum + item.plain.split('\n').length - 1, 0), 2112);
const manifest = JSON.parse(readFileSync(resolve(root, 'fbla-course-manifest.json'), 'utf8'));
assert.equal(manifest.modules.length, 10);
assert.equal(manifest.sheets.length, 44);
assert.deepEqual(manifest.objectives, course.objectiveList);
const ledger = JSON.parse(readFileSync(resolve(root, 'fbla-sources.json'), 'utf8'));
assert.equal(ledger.coverage.length, 176);
assert.ok(ledger.coverage.some(item => item.sheet === 'nd-roleplay-analysis' && item.lines[0] === 5));
assert.ok(ledger.sources.every(source => source.url.startsWith('https://')));
assert.equal(new Set(ledger.sources.map(source => `${source.module}:${source.id}`)).size, ledger.sources.length, 'source records are unique by module and ID');
for (const item of course.sheets) {
  const colored = colorSheet(item.plain, palette, item.sheet.id);
  assert.equal(colored.replace(/\((?:g|li|pu|br|or|y|p|lb|hp|pen)\)/g, ''), item.plain);
  const plainLines = item.plain.trimEnd().split('\n');
  const coloredLines = colored.trimEnd().split('\n');
  const titles = new Set(plainLines.filter(line => line.startsWith('o ') && line !== 'o Overview').map(line => line.slice(2)));
  const titleStyles = new Map();
  assert.equal(plainLines.length, 48);
  assert.ok(plainLines.every(line => line.length <= 65 && /^[\x20-\x7e]+$/.test(line)), `${item.sheet.id}: actual final decoded lines are ASCII <=65 characters`);
  for (const [index, line] of coloredLines.entries()) {
    assert.ok(line.startsWith('(pen)'), `${item.sheet.id} line ${index + 1} starts pencil`);
    const markers = [...line.matchAll(/\((pen|g|li|pu|br|or|y|p|lb|hp)\)/g)];
    const spans = markers.map((marker, position) => [marker[0], marker[1], line.slice(marker.index + marker[0].length, markers[position + 1]?.index ?? line.length)]);
    const inks = new Set(spans.filter(([, ink]) => ink !== 'pen').map(([, ink]) => ink));
    assert.ok(inks.size <= 2);
    for (const [spanIndex, [, ink, text]] of spans.entries()) {
      if (ink === 'pen' || !text) continue;
      assert.match(text, /^[A-Za-z]+(?: [A-Za-z]+)*$/);
      assert.equal(spans[spanIndex + 1]?.[1], 'pen');
    }
    const decoded = spans.map(([, , text]) => text).join('');
    const colors = spans.flatMap(([, ink, text]) => Array(text.length).fill(ink));
    assert.equal(decoded, plainLines[index], `${item.sheet.id}: exact decoded line`);
    const prefix = plainLines[index].startsWith('o ') ? 2 : 3;
    assert.ok(colors.slice(0, prefix).every(ink => ink === 'pen'), 'neutral prefixes');
    if (plainLines[index] === 'o Overview') assert.ok(colors.every(ink => ink === 'pen'), 'neutral Overview');
    const title = plainLines[index].slice(prefix);
    if (titles.has(title)) {
      assert.equal(inks.size, 1, `${item.sheet.id}: full heading/Overview-entry title uses one ink`);
      assert.ok(!inks.has('lb'), 'section title does not use topic blue');
      const ink = [...inks][0];
      [...title].forEach((char, position) => { if (/[A-Za-z]/.test(char)) assert.equal(colors[prefix + position], ink, 'full title letters colored uniformly'); });
      const style = colors.slice(prefix).join(',');
      if (titleStyles.has(title)) assert.equal(style, titleStyles.get(title), 'Overview/header style equality');
      titleStyles.set(title, style);
    } else {
      const words = [...plainLines[index].matchAll(/[A-Za-z]+(?:['-][A-Za-z]+)*/g)];
      const chosen = words.filter(word => colors.slice(word.index, word.index + word[0].length).some(ink => ink !== 'pen'));
      assert.ok(chosen.length <= 2, 'at most two highlighted words total per support note');
      assert.ok(chosen.every(word => !/^(a|an|the|and|or|to|of|in|for|with)$/i.test(word[0])), 'body highlights distinctive keywords, not generic opening words');
    }
  }
  assert.equal(readFileSync(resolve(root, `notes/fbla/course/${item.sheet.id}.txt`), 'utf8'), item.plain);
  assert.equal(readFileSync(resolve(root, `notes/fbla/course/Colored/${item.sheet.id}.txt`), 'utf8'), colored);
}
assert.match(html, /Complete event study courses/);
assert.match(html, /Start here: one topic, one practice attempt/);
assert.match(html, /Sources, practice, lab and scope notes/);
assert.match(html, /card order is not a lesson sequence/);
assert.match(html, /optional 654-card Anki package/);
assert.match(html, /not 17 additional official requirements or 17 separate assignments/);
assert.match(html, /8 Network Design skills and 9 Sales Presentation skills/);
assert.match(html, /not the required first lesson/);
assert.match(html, /17 skills to practice through scenarios and presentations/);
assert.doesNotMatch(html, /\bpractis(?:e[ds]?|ing)\b/i, 'FBLA landing copy uses American English');
assert.match(html, /Build a study schedule/);
assert.match(html, /New to a topic/);
assert.match(html, /Without the package, use the practice questions for recall/);
assert.match(html, /applicable state or regional FBLA association/);
assert.doesNotMatch(html, /our review|trace the review|Local review ID|audit category|flagged rows|separately delivered|Washington|CCNA|five-month|What were the/);
assert.doesNotMatch(html, /audit remains a separate next phase/);
assert.deepEqual(rehearsalItems.map(item => item.id), [
  'ND-NSR-02', ...Array.from({ length: 7 }, (_, index) => `ND-RP-0${index + 1}`),
  'SP-R-01', 'SP-R-02', 'SP-R-03', 'SP-R-04', 'SP-R-06', 'SP-R-07', 'SP-R-08', 'SP-R-09', 'SP-R-10',
]);
assert.equal(new Set(rehearsalItems.map(item => item.id)).size, 17);
for (const item of rehearsalItems) {
  assert.match(html, new RegExp(`data-objective="${item.id}"`));
  assert.ok(html.includes(`href="fbla-${item.event}.html#${item.sheet}"`));
  assert.ok(item.title && item.practice);
}
assert.match(html, /192 Anki cards/);
assert.match(html, /194 Anki cards/);
assert.match(html, /180 Anki cards/);
assert.match(html, /88 Anki cards/);
assert.match(html, /Networking Infrastructures/);
assert.match(html, /Protocols and threat mitigation: 20 of 100/);
assert.match(html, /Installation and configuration: 25 of 100/);
assert.match(html, /Protocols, services, and access: 20 of 100/);
assert.match(html, /2026–27/);
assert.match(source, /ND-NIC-07/);
assert.match(source, /NI-NB-07/);
assert.match(source, /locally assigned study IDs/);
assert.match(source, /192\.0\.2\.64/);
assert.match(source, /192\.0\.2\.128\/26/);
assert.match(source, /RFC 3021/);
assert.match(source, /RFC 4632/);
assert.match(source, /RFC 5737/);
assert.match(source, /https:\/\/www\.cisco\.com\/c\/en\/us\/support\/docs\/ip\/routing-information-protocol-rip\/13788-3\.html/);
assert.match(source, /Without the package, use these as additional recall questions/);
assert.match(source, /linked references explain the technical background/i);
assert.match(html, /href="notes\/fbla\/ipv4-subnetting\.txt" download/);
assert.match(html, /href="notes\/fbla\/ipv4-subnetting\.txt">Open plain-text source/);
assert.doesNotMatch(html, /<script\b|<iframe\b/i, 'no runtime scripts or embedded frames');
for (const rfc of ['4632', '3021', '5737']) assert.match(html, new RegExp(`href="https://www\\.rfc-editor\\.org/rfc/rfc${rfc}"`));
assert.match(html, /href="https:\/\/www\.cisco\.com\/c\/en\/us\/support\/docs\/ip\/routing-information-protocol-rip\/13788-3\.html"/);
assert.match(html, /href="fbla\.html" aria-current="page"/);
for (const event of ['networking', 'cybersecurity', 'network-design', 'sales']) {
  const page = renderEvent(event, course, palette);
  assert.match(page, /National 2026–27/);
  assert.match(page, /aria-label="Subjects"/);
  assert.match(page, /Source/);
  assert.match(page, /class="notes-site"/);
  assert.match(page, /class="course-pages pages"/);
  assert.match(page, /class="sheet"/);
  assert.doesNotMatch(page, /audit remains pending/i);
  assert.doesNotMatch(page, /<script\b/i);
}
for (const url of [
  'https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/Individual%20Guidelines/Objective%20Tests/Networking-Infrastructures.pdf',
  'https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/Individual%20Guidelines/Objective%20Tests/Cybersecurity.pdf',
  'https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/Individual%20Guidelines/Role%20Play%20Events/Network-Design.pdf',
  'https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/Individual%20Guidelines/Presentation%20Events/Sales-Presentation.pdf',
]) assert.ok(Object.values(ledger.sources).some(source => source.url === url) || ['networking','cybersecurity','network-design','sales'].some(event => readFileSync(resolve(root, `fbla-${event}.html`), 'utf8').includes(url)));
assert.match(html, /<details class="answer-key" id="pilot-answer-key"><summary>/);
assert.doesNotMatch(html, /<details[^>]*\bopen\b/);
assert.match(source, /one PC and switch per LAN/);
assert.match(source, /Companion Anki prompts/);
assert.match(source, /How many conventional usable host addresses are in 192\.0\.2\.0\/26/);
assert.match(source, /Why put largest subnets first when planning a VLSM allocation/);
const hostile = renderFbla(source.replace('## IPv4 foundations', '## <img src=x onerror=alert(1)>'));
assert.doesNotMatch(hostile, /<img\s|onerror="/);
assert.match(hostile, /&lt;img/);
console.log('PASS: FBLA edition caveats, named test-item counts, original source-driven notes, safe rendering, separate answer disclosure and offline links.');
