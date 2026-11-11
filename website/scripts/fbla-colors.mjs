import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const fblaInks = Object.freeze({ r: '#df3034', db: '#173f88', mb: '#287db3', y: '#ebc600' });
const plan = JSON.parse(readFileSync(new URL('./fbla-color-plan.json', import.meta.url), 'utf8'));
const headingPlan = JSON.parse(readFileSync(new URL('./fbla-heading-palettes.json', import.meta.url), 'utf8'));
const termPlan = JSON.parse(readFileSync(new URL('./fbla-term-colors.json', import.meta.url), 'utf8'));
assert.equal(plan.version, 2, 'supported FBLA color-plan version');
assert.deepEqual(Object.keys(headingPlan.sheets).sort(), Object.keys(plan.sheets).sort(), 'every sheet needs an explicit heading palette');
const terms = new Map();
for (const [color, names] of Object.entries(termPlan)) {
  for (const name of names) {
    assert.ok(/[A-Za-z]/.test(name) && name.trim() === name, 'registered terms need letters and no edge whitespace');
    assert.ok(!terms.has(name.toLowerCase()), `duplicate global body term: ${name}`);
    terms.set(name.toLowerCase(), color);
  }
}
// Longest names win (e.g. Windows Server); compounds never match substrings.
const bodyTerms = new RegExp(`(?<![A-Za-z0-9'-])(?:${[...terms.keys()].sort((a, b) => b.length - a.length).map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![A-Za-z0-9'-])`, 'gi');
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
  const headers = titles.map((title, index) => ({ title, color: titleInks[index] }));
  for (const color of Object.keys(termPlan)) {
    assert.ok(inks[color] && !['pen', 'lb', 'br'].includes(color), `${sheetId}: invalid global body ink`);
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
    // Heading palettes never decide body colors. Every registered occurrence
    // keeps its global ink, even when several different terms share a line.
    return `(pen)${row.slice(0, prefix)}${row.slice(prefix).replace(bodyTerms, text => paint(text, terms.get(text.toLowerCase())))}`;
  }).join('\n');
}
