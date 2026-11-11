import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const fblaInks = Object.freeze({ r: '#df3034', db: '#173f88', mb: '#287db3', y: '#ebc600' });
const plan = JSON.parse(readFileSync(new URL('./fbla-color-plan.json', import.meta.url), 'utf8'));
const headingPlan = JSON.parse(readFileSync(new URL('./fbla-heading-palettes.json', import.meta.url), 'utf8'));
assert.equal(plan.version, 1, 'supported FBLA color-plan version');
assert.deepEqual(Object.keys(headingPlan.sheets).sort(), Object.keys(plan.sheets).sort(), 'every sheet needs an explicit heading palette');
const stopwords = new Set('overview need to know understand do identify takeaway developments and of in the a an for with'.split(' '));
const tokens = text => [...text.matchAll(/(?<![A-Za-z0-9'-])[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*(?![A-Za-z0-9'-])/g)];
const distinctive = title => [...new Set(tokens(title).map(match => match[0].toLowerCase()).filter(word => !stopwords.has(word)))];
// Match complete identifiers, but keep their punctuation and digits in pencil.
const paint = (text, ink) => text.replace(/[A-Za-z]+(?: [A-Za-z]+)*/g, words => `(${ink})${words}(pen)`);

export function colorSheet(plain, palette, sheetId) {
  assert.ok(Object.hasOwn(plan.sheets, sheetId), `unknown sheet in FBLA color plan: ${sheetId}`);
  const sheet = plan.sheets[sheetId];
  const headingPalette = headingPlan.palettes[headingPlan.sheets[sheetId]];
  assert.ok(headingPalette, `${sheetId}: unknown heading palette`);
  const titleInks = headingPalette.titles;
  assert.equal(new Set(titleInks).size, titleInks.length, `${sheetId}: distinct section colors`);
  assert.equal(createHash('sha256').update(plain).digest('hex'), sheet.sourceSha256, `${sheetId}: source fingerprint changed; review the color plan before rebuilding`);
  const inks = { ...palette, ...fblaInks };
  const rows = plain.split('\n');
  assert.equal(rows.length, 49, `${sheetId}: 48 lines and final newline required`);
  assert.equal(rows[48], '', `${sheetId}: final newline required`);
  const titles = [...new Set(rows.filter(row => row.startsWith('o ') && row !== 'o Overview').map(row => row.slice(2)))];
  assert.ok(titles.length <= titleInks.length, `${sheetId}: insufficient title palette`);
  const headers = titles.map((title, index) => ({ title, index, color: titleInks[index], words: distinctive(title) }));
  const owners = new Map();
  // Resolve across the whole sheet, never independently for each page.
  for (const header of headers.toSorted((a, b) => b.words.length - a.words.length || b.title.length - a.title.length || a.index - b.index)) {
    for (const word of header.words) {
      if (!owners.has(word)) owners.set(word, header);
    }
  }
  const accents = new Map();
  for (const selectedAccent of sheet.accents) {
    // Keep optional families separate when their preferred ink is used by a heading.
    const accent = { ...selectedAccent, color: headingPalette.accents[selectedAccent.color] };
    assert.ok(inks[accent.color] && accent.color !== 'pen' && accent.color !== 'lb' && !headers.some(header => header.color === accent.color), `${sheetId}: optional ink must be unreserved`);
    assert.ok(accent.terms.length && accent.lines.length, `${sheetId}: empty optional family`);
    assert.ok(accent.terms.every(term => !owners.has(term.toLowerCase())), `${sheetId}: optional family conflicts with title ownership`);
    for (const number of accent.lines) {
      assert.ok(Number.isInteger(number) && number >= 1 && number <= 48 && [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].includes((number - 1) % 24), `${sheetId}: optional anchor must be a body line`);
      assert.ok(tokens(rows[number - 1]).some(match => accent.terms.some(term => term.toLowerCase() === match[0].toLowerCase())), `${sheetId}:${number}: optional family has no exact anchor`);
      accents.set(number, [...(accents.get(number) ?? []), accent]);
    }
  }
  return rows.map((row, index) => {
    if (!row) return '';
    assert.ok(row.length <= 65, `${sheetId}:${index + 1}: overlong source line`);
    if (row === 'o Overview') return '(pen)o Overview';
    const prefix = row.startsWith('o ') ? 2 : 3;
    const header = headers.find(item => item.title === row.slice(prefix));
    if (header) {
      assert.ok(inks[header.color], `${sheetId}: missing title ink`);
      return `(pen)${row.slice(0, prefix)}${paint(header.title, header.color)}`;
    }
    const words = tokens(row).filter(match => match.index >= prefix);
    const candidates = words.filter(match => owners.has(match[0].toLowerCase())).map(match => ({ match, owner: owners.get(match[0].toLowerCase()) }));
    candidates.sort((a, b) => b.owner.words.length - a.owner.words.length || b.owner.title.length - a.owner.title.length || a.owner.index - b.owner.index);
    const selected = new Map();
    const colors = new Set();
    for (const { match, owner } of candidates) {
      if (!colors.has(owner.color) && colors.size === 2) continue;
      assert.ok(inks[owner.color], `${sheetId}: missing body ink`);
      colors.add(owner.color);
      selected.set(match.index, { text: match[0], color: owner.color });
    }
    for (const accent of accents.get(index + 1) ?? []) {
      assert.ok(colors.has(accent.color) || colors.size < 2, `${sheetId}:${index + 1}: approved accent exceeds two-color budget`);
      colors.add(accent.color);
      for (const match of words.filter(word => accent.terms.some(term => word[0].toLowerCase() === term.toLowerCase()))) {
        assert.ok(!selected.has(match.index), `${sheetId}:${index + 1}: overlapping accent`);
        selected.set(match.index, { text: match[0], color: accent.color });
      }
    }
    let output = '(pen)';
    let cursor = 0;
    for (const [start, span] of [...selected].sort((a, b) => a[0] - b[0])) {
      output += row.slice(cursor, start) + paint(span.text, span.color);
      cursor = start + span.text.length;
    }
    return output + row.slice(cursor);
  }).join('\n');
}
