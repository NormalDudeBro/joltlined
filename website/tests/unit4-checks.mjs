import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadNotes, palette, spans, unit4Palette, validateSheet } from '../scripts/build.mjs';

const data = loadNotes();
const unit = data[3];
const notesRoot = fileURLToPath(new URL('../public/notes/unit-4/', import.meta.url));
assert.equal(data.length, 4);
assert.equal(unit.name, 'Transoceanic Interconnections');
assert.equal(unit.inks, unit4Palette, 'Unit 4 uses its dedicated palette object');
assert.deepEqual(Object.keys(unit4Palette), ['g', 'li', 'pu', 'or', 'y', 'p', 'lb', 'hp', 'r', 'db', 'mb', 'pen']);
assert.equal(Object.keys(unit4Palette).filter(token => token !== 'pen').length, 11);
assert.equal(unit.topics.length, 8);
assert.deepEqual(unit.topics.map(topic => topic.file), [
  '4.1-technological-innovations', '4.2-exploration', '4.3-columbian-exchange', '4.4-empires-established',
  '4.5-empires-maintained', '4.6-state-challenges', '4.7-social-hierarchies', '4.8-continuity-change',
]);
for (const folder of ['', 'Colored/']) {
  assert.deepEqual(readdirSync(resolve(notesRoot, folder)).filter(file => file.endsWith('.txt')).sort(), unit.topics.map(topic => `${topic.file}.txt`).sort());
}
const html = readFileSync(new URL('../public/ap-world.html', import.meta.url), 'utf8');
assert.match(html, /<section class="unit unit-4-palette" id="unit-4"/);
assert.match(html, /\.unit-4-palette\s*\{[^}]*--y:\s*#ebc600;/s);
assert.match(html, /\.unit-4-palette\s*\{[^}]*--mb:\s*#287db3;/s);
assert.match(html, /--y:\s*#287db3;/, 'legacy medium blue remains unchanged');
assert.match(html, /\.ink\.y \{ color: var\(--y\); \}/, 'legacy global y rule stays intact');
assert.match(html, /\.unit-4-palette \.ink\.y \{ color: var\(--y\); \}/);
assert.match(html, /\.unit-4-palette \.ink\.mb \{ color: var\(--mb\); \}/);
assert.equal((html.match(/<article /g) ?? []).length, 56);
assert.equal((html.match(/class="note"/g) ?? []).length, 1344);
const used = new Set();
const sheets = unit.topics.map(topic => {
  const lines = topic.original.replace(/\n$/, '').split('\n');
  const marked = topic.colored.replace(/\n$/, '').split('\n');
  assert.equal(lines.length, 48, `${topic.file}: 48 lines`);
  assert.equal(marked.length, 48);
  assert.doesNotMatch(topic.original, /[^\x20-\x7e\n]/, `${topic.file}: visible ASCII source`);
  assert.doesNotMatch(topic.colored, /[^\x00-\x7f]/, `${topic.file}: ASCII coloring`);
  assert.equal(topic.colored.replace(/\(([a-z]+)\)/g, ''), topic.original, `${topic.file}: exact stripped equality`);
  lines.forEach((line, index) => {
    assert.ok(line.length <= 65, `${topic.file}:${index + 1} exceeds 65 chars`);
    assert.equal(line, line.trim());
    assert.match(line, /^(o |-> )\S/);
    assert.ok(marked[index].startsWith('(pen)'));
    const parts = spans(marked[index]);
    parts.forEach(part => { if (part.color !== 'pen') used.add(part.color); });
    assert.ok(parts.every(part => Object.hasOwn(unit4Palette, part.color)), `${topic.file}: Unit 4 palette only`);
    if (line === 'o Overview') assert.equal(marked[index], '(pen)o Overview');
  });
  for (const offset of [0, 24]) {
    const page = lines.slice(offset, offset + 24);
    assert.equal(page[0], 'o Overview');
    assert.equal(page.filter(line => line === 'o Overview').length, 1);
    const headers = page.slice(1).filter(line => line.startsWith('o ')).map(line => line.slice(2));
    assert.ok(headers.length >= 2 && headers.length <= 5);
    assert.equal(new Set(headers).size, headers.length);
    assert.deepEqual(page.slice(1, page.findIndex((line, index) => index > 0 && line.startsWith('o '))).map(line => line.slice(3)), headers);
    headers.forEach(header => {
      const supportIndex = page.indexOf(`o ${header}`);
      assert.ok(supportIndex >= 0 && page[supportIndex + 1].startsWith('-> '), `${topic.file}: supported header ${header}`);
      const coloredTitle = marked[offset + supportIndex];
      assert.equal(coloredTitle.replace(/\([a-z]+\)/g, ''), page[supportIndex], 'heading text matches title');
      const titleColors = new Set(spans(coloredTitle).filter(part => part.color !== 'pen').map(part => part.color));
      assert.equal(titleColors.size, 1, 'title uses one ink');
      assert.ok(!titleColors.has('lb'), 'light blue remains reserved for topic titles');
    });
  }
  return { topic, lines, marked, headingColors: lines.flatMap((line, index) => line.startsWith('o ') && line !== 'o Overview' ? [spans(marked[index]).find(part => part.color !== 'pen').color] : []) };
});
assert.deepEqual([...used].sort(), Object.keys(unit4Palette).filter(token => !['pen', 'lb'].includes(token)).sort(), 'all ten section inks are used; light blue is reserved for external topic titles');
for (const token of Object.keys(unit4Palette).filter(token => !['pen', 'lb'].includes(token))) {
  assert.ok(sheets.some(({ topic }) => topic.colored.includes(`(${token})`)), `${token} used in a sheet`);
}
assert.ok(sheets.some(({ topic }) => topic.colored.includes('(y)')));
assert.ok(sheets.some(({ topic }) => topic.colored.includes('(mb)')));
assert.deepEqual(Object.keys(palette), ['g', 'li', 'pu', 'br', 'or', 'y', 'p', 'lb', 'hp', 'pen'], 'legacy palette remains unchanged');
const first = unit.topics[0];
assert.throws(() => validateSheet(first.original, first.colored.replaceAll('(mb)', '(br)'), first.file, false, unit4Palette), /palette markers/);
assert.throws(() => validateSheet(first.original, first.colored, first.file, false, palette), /palette markers/);
const excessive = first.colored.split('\n');
excessive[5] = '(pen)-> (g)Europeans adapted Asian(pen) and Islamic maritime knowledge.';
assert.throws(() => validateSheet(first.original, excessive.join('\n'), first.file, false, unit4Palette), /two highlighted words/);
for (let index = 1; index < sheets.length; index++) assert.notDeepEqual(sheets[index - 1].headingColors, sheets[index].headingColors, 'neighboring sheets have varied section palettes');
assert.match(unit.topics[2].original, /Mosquitoes spread malaria/);
assert.match(unit.topics[2].original, /sale to Europe and the Middle East/);
assert.match(unit.topics[3].original, /Elmina fort \(1482\).*Africa's Gold Coast/);
assert.match(unit.topics[3].original, /cartaz trade passes/);
assert.match(unit.topics[3].original, /boosted Kongo's royal influence/);
assert.match(unit.topics[3].original, /Ming trade limits sought economic and political control/);
assert.match(unit.topics[3].original, /Tokugawa Japan.*curb Christian influence/);
assert.match(unit.topics[4].original, /bullion \(gold and silver\)/);
assert.match(unit.topics[4].original, /English and Dutch East India companies/);
assert.match(unit.topics[4].original, /Kongo crucifixes \(1500s-1600s\)/);
assert.match(unit.topics[4].original, /Christ with ancestral beliefs/);
assert.match(unit.topics[5].original, /Wampanoag chief Metacom.*land seizure/);
assert.match(unit.topics[5].original, /Native displacement and enslavement/);
assert.match(unit.topics[6].original, /French nobles' Fronde failed/);
assert.match(unit.topics[6].original, /Hurrem, Suleyman's wife, funded schools and a hospital/);
console.log('PASS: Unit 4 eight sheets, sixteen pages, 384 ASCII lines, exact stripped sources, two 24-line pages per sheet, headings/Overview support, dedicated exact palette, all eleven highlight inks and legacy palette preservation.');
