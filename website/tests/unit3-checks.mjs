import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { spans, units } from '../scripts/build.mjs';

export function validateUnit3(text) {
  assert.doesNotMatch(text, /[^\x00-\x7f]/, 'ASCII note text');
  const lines = text.replace(/\n$/, '').split('\n');
  assert.equal(lines.length, 48, '48 nonempty lines');
  assert.equal(lines.filter(line => line === 'o Overview').length, 2);
  lines.forEach((line, index) => {
    assert.ok(line.length <= 65, `line ${index + 1}: ${line.length} characters`);
    assert.equal(line, line.trim(), `line ${index + 1}: no edge whitespace`);
    assert.match(line, /^(o |-> )\S.*$/, `line ${index + 1}: prefix and content`);
  });
  [0, 24].forEach(offset => {
    const page = lines.slice(offset, offset + 24);
    assert.equal(page.length, 24);
    assert.equal(page[0], 'o Overview');
    const first = page.findIndex((line, index) => index > 0 && line.startsWith('o '));
    assert.ok(first > 1);
    const headers = page.slice(first).filter(line => line.startsWith('o ')).map(line => line.slice(2));
    assert.equal(new Set(headers).size, headers.length, 'distinct major headers');
    assert.deepEqual(page.slice(1, first).map(line => {
      assert.ok(line.startsWith('-> '));
      return line.slice(3);
    }), headers, 'exact ordered navigation overview');
    page.forEach((line, index) => {
      if (index > 0 && line.startsWith('o ')) assert.ok(page[index + 1]?.startsWith('-> '), 'support under every header');
    });
  });
  return lines;
}

const topics = [
  ['3.1-empires-expand', 'Empires Expand'],
  ['3.2-administration', 'Empires: Administration'],
  ['3.3-belief-systems', 'Empires: Belief Systems'],
  ['3.4-comparison', 'Comparison in Land-Based Empires'],
];
const supplements = [
  ['3-supplement', 'Military and Imperial Government', 'Unit 3 Supplement 1'],
  ['3-supplement-2', 'Beliefs, Legitimacy, and Comparison', 'Unit 3 Supplement 2'],
];
const all = [...topics, ...supplements];
assert.deepEqual(units[2].topics.slice(0, 4), topics, 'all four exact Unit 3 topic titles');
assert.deepEqual(units[2].topics.slice(4), supplements, 'two supplements are separate from the four official topics');
assert.equal(units[2].topics.length, 6);
for (const folder of ['', 'Colored/']) {
  assert.deepEqual(readdirSync(new URL(`../public/notes/unit-3/${folder}`, import.meta.url)).filter(file => file.endsWith('.txt')).sort(), all.map(([file]) => `${file}.txt`).sort(), 'four topic sources plus two supplements, no obsolete review');
}
const sheets = all.map(([file]) => readFileSync(new URL(`../public/notes/unit-3/${file}.txt`, import.meta.url), 'utf8'));
// This page has already been copied by the reader; preserve its exact coloring.
const completedPage = readFileSync(new URL('../public/notes/unit-3/Colored/3.1-empires-expand.txt', import.meta.url), 'utf8').split('\n').slice(0, 24).join('\n');
assert.equal(createHash('sha256').update(completedPage).digest('hex'), 'beaea165e9b8c2dd5757e7813a71890855539b53c80f258f3b253516f9ab3318', 'completed 3.1 page 1 coloring stays unchanged');
const validated = sheets.map(validateUnit3);
all.forEach(([file], topic) => {
  if (topic === 0) return;
  const marked = readFileSync(new URL(`../public/notes/unit-3/Colored/${file}.txt`, import.meta.url), 'utf8').trimEnd().split('\n');
  marked.forEach((line, index) => {
    if (topic === 1 && index < 8) return;
    const text = validated[topic][index];
    if (text.startsWith('o ') || validated[topic].includes(`o ${text.slice(3)}`)) return;
    const colors = spans(line).flatMap(part => Array(part.text.length).fill(part.color));
    const words = [...text.matchAll(/[A-Za-z]+(?:['-][A-Za-z]+)*/g)];
    const highlighted = words.filter(word => colors.slice(word.index, word.index + word[0].length).some(color => color !== 'pen'));
    assert.ok(highlighted.length <= 2, `${file} line ${index + 1}: highlight at most two keyword words, not a clause`);
  });
});
assert.equal(validated.length, 6, 'four official topic sheets plus two supplements');
assert.equal(validated.slice(0, 4).flat().length, 192, 'original four topics retain 192 logical note lines');
assert.equal(validated.slice(0, 4).flatMap(lines => [lines.slice(0, 24), lines.slice(24)]).length, 8, 'original four topics retain eight pages');
assert.equal(validated.slice(4).flat().length, 96, 'four supplemental pages contain exactly 96 lines');
assert.equal(validated.flat().length, 288, '288 Unit 3 note lines including supplements');
assert.equal(validated.flatMap(lines => [lines.slice(0, 24), lines.slice(24)]).length, 12, 'twelve Unit 3 pages including supplements');
const comparison = readFileSync(new URL('../public/notes/unit-3/Colored/3.4-comparison.txt', import.meta.url), 'utf8').trimEnd().split('\n');
assert.equal(comparison[25], '(pen)-> (or)Revenue and local elites(pen)');
assert.equal(comparison[28], '(pen)o (or)Revenue and local elites(pen)');
assert.ok(comparison.slice(0, 24).some(line => line.includes('(br)')), 'earlier brown is retained');
assert.ok(comparison.slice(24).every(line => !line.includes('(br)')), 'brown becomes orange from 3.4 page 2 onward');
for (const [file] of supplements) {
  assert.doesNotMatch(readFileSync(new URL(`../public/notes/unit-3/Colored/${file}.txt`, import.meta.url), 'utf8'), /\(br\)/, `${file}: honor the forward orange substitution`);
}
assert.match(sheets[4], /Jizya did not itself grant communal self-government\./, 'do not confuse a tax with communal autonomy');
assert.match(sheets[4], /Community authority remained subject to Ottoman rule\./, 'limited community governance, not independent sovereignty');
for (const evidence of ['Abbas I', 'ghulams', 'Qizilbash', 'Isfahan', 'North Africa', 'caliphs', 'Tondibi', 'intendants', 'Boyars', 'serfs', 'predestination', 'Henry VIII', 'twelve Imams', 'Tibetan Buddhism', 'Orthodox clergy', 'Akbarnama', 'Rajputs', 'Augsburg', 'Westphalia', 'human sacrifice', 'Protestant and Catholic reforms']) {
  assert.ok(sheets.slice(4).join('\n').includes(evidence), `${evidence}: retain the material selected by the multi-source audit`);
}
const text = sheets[0];
assert.throws(() => validateUnit3(text.replace('o Gunpowder and expansion', 'o Overview')));
assert.throws(() => validateUnit3(text.replace('-> Gunpowder and expansion', '-> Wrong title')));
assert.throws(() => validateUnit3(text.replace('Cannons', 'Cannons\u2019')), /ASCII/);
assert.throws(() => validateUnit3(text + '\n'), /48 nonempty lines/);
assert.throws(() => validateUnit3(text.replace('-> Gunpowder and expansion', `-> ${'x'.repeat(63)}`)), /characters/);
console.log('PASS: four Unit 3 topics retain eight pages/192 lines; two supplements add four pages/96 lines, for twelve pages/288 lines. Every sheet has 48 ASCII lines, two 24-line pages, max 65 characters and ordered supported headers; body highlights stay within two words and the forward orange substitution is preserved.');
