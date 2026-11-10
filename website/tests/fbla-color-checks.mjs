import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCourseSheets } from '../scripts/fbla.mjs';
import { colorSheet, fblaInks } from '../scripts/fbla-colors.mjs';
import { palette } from '../scripts/build.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', 'public');
const config = JSON.parse(readFileSync(resolve(here, '../scripts/fbla-color-plan.json'), 'utf8'));
const sheets = renderCourseSheets();
const marker = /\((pen|g|li|pu|br|or|y|r|db|p|lb|hp)\)/g;
const strip = value => value.replace(marker, '');
const parse = colored => colored.split('\n').map(line => {
  const markers = [...line.matchAll(marker)];
  return {
    text: strip(line),
    spans: markers.map((part, index) => ({
      ink: part[1],
      text: line.slice(part.index + part[0].length, markers[index + 1]?.index ?? line.length),
    })),
  };
});
const colorAt = (line, offset) => {
  let cursor = 0;
  for (const span of line.spans) {
    if (offset < cursor + span.text.length) return span.ink;
    cursor += span.text.length;
  }
  return 'pen';
};

assert.deepEqual(Object.keys(fblaInks).sort(), ['db', 'r', 'y']);
assert.deepEqual(fblaInks, { r: '#df3034', db: '#173f88', y: '#ebc600' });
assert.equal(Object.keys(config.sheets).length, 44);
assert.equal(Object.keys(config.sheets).length * 2, 88, 'local source plan covers both pages of all 44 sheets');

for (const item of sheets.sheets) {
  const sheetPlan = config.sheets[item.sheet.id];
  assert.ok(sheetPlan, `${item.sheet.id}: coloring plan entry exists`);
  assert.equal(sheetPlan.sourceSha256, createHash('sha256').update(item.plain).digest('hex'), `${item.sheet.id}: source fingerprint guards drift`);
  const colored = colorSheet(item.plain, palette, item.sheet.id);
  const lines = parse(colored);
  const plainLines = item.plain.split('\n');
  assert.equal(lines.length, plainLines.length);
  assert.equal(strip(colored), item.plain, `${item.sheet.id}: exact preservation`);
  assert.equal(plainLines.length - 1, 48, `${item.sheet.id}: two source pages remain 48 lines`);

  const headings = new Map();
  for (const [index, plainLine] of plainLines.entries()) {
    if (!plainLine) continue;
    const rendered = lines[index];
    assert.ok(colored.split('\n')[index].startsWith('(pen)'), `${item.sheet.id}:${index + 1}: line begins pencil`);
    const accents = new Set(rendered.spans.filter(span => span.ink !== 'pen' && span.text).map(span => span.ink));
    assert.ok(accents.size <= 2, `${item.sheet.id}:${index + 1}: at most two distinct colors`);
    assert.equal(rendered.text, plainLine);

    const title = plainLine.startsWith('o ') && plainLine !== 'o Overview';
    const overviewEntry = plainLine.startsWith('-> ') && [1, 2].includes(index % 24);
    if (title || overviewEntry) {
      const text = plainLine.slice(title ? 2 : 3);
      const inkValues = [...new Set([...text.matchAll(/[A-Za-z]+/g)].map(word => colorAt(rendered, (title ? 2 : 3) + word.index)))];
      assert.equal(inkValues.length, 1, `${item.sheet.id}:${index + 1}: complete heading or listing uses one uniform ink`);
      const key = text;
      if (headings.has(key)) assert.equal(inkValues[0], headings.get(key), `${item.sheet.id}: Overview/header title inks match`);
      headings.set(key, inkValues[0]);
    }

    for (const part of rendered.spans) {
      if (part.ink === 'pen' || !part.text) continue;
      assert.match(part.text, /^[A-Za-z]+(?: [A-Za-z]+)*$/, `${item.sheet.id}:${index + 1}: color spans contain only whole alphabetic words and internal spaces`);
    }
    if (!title && !overviewEntry && plainLine !== 'o Overview') {
      for (const word of plainLine.matchAll(/(?<![A-Za-z0-9'-])[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*(?![A-Za-z0-9'-])/g)) {
        const ink = colorAt(rendered, word.index);
        if (/^(overview|need|to|know|understand|do|identify|takeaway|developments|and|of|in|the|a|an|for|with)$/i.test(word[0])) {
          assert.equal(ink, 'pen', `${item.sheet.id}:${index + 1}: exact title stopword remains neutral`);
        }
      }
    }
    for (const punctuation of plainLine.matchAll(/[^A-Za-z0-9 ]/g)) {
      assert.equal(colorAt(rendered, punctuation.index), 'pen', `${item.sheet.id}:${index + 1}: punctuation stays neutral`);
    }
    for (const digit of plainLine.matchAll(/[0-9]/g)) {
      assert.equal(colorAt(rendered, digit.index), 'pen', `${item.sheet.id}:${index + 1}: digits and identifiers stay neutral`);
    }
  }

  for (const accent of sheetPlan.accents ?? []) {
    assert.ok(['r', 'db', 'y'].includes(accent.color), `${item.sheet.id}: optional accents use approved optional inks`);
    for (const lineNo of accent.lines) {
      const line = lines[lineNo - 1];
      assert.ok(line, `${item.sheet.id}:${lineNo}: configured anchor is within source`);
      assert.ok(Array.isArray(accent.terms) && accent.terms.length, `${item.sheet.id}:${lineNo}: anchor has at least one term alternative`);
      assert.ok(accent.terms.some(term => {
        const expression = new RegExp(`(?<![A-Za-z0-9'-])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z0-9'-])`, 'i');
        const match = expression.exec(line.text);
        if (!match) return false;
        const firstLetter = match[0].search(/[A-Za-z]/);
        return firstLetter >= 0 && colorAt(line, match.index + firstLetter) === accent.color;
      }), `${item.sheet.id}:${lineNo}: one configured accent alternative is present and uses ${accent.color}`);
    }
  }
}

assert.throws(() => colorSheet(sheets.sheets[0].plain, palette, 'unknown-sheet-id'), /unknown sheet/i);
assert.throws(() => colorSheet(`${sheets.sheets[0].plain}drift`, palette, sheets.sheets[0].sheet.id), /source|fingerprint|hash/i);

const at = (lines, term, label) => {
  const index = lines.findIndex(line => line.text.toLowerCase().includes(term.toLowerCase()));
  assert.notEqual(index, -1, `${label}: worked-example term occurs in the actual source`);
  return colorAt(lines[index], lines[index].text.toLowerCase().indexOf(term.toLowerCase()));
};
const atLine = (line, term, label) => {
  const index = line.text.toLowerCase().indexOf(term.toLowerCase());
  assert.notEqual(index, -1, `${label}: worked-example term occurs on the expected source line`);
  return colorAt(line, index);
};

const example = sheets.sheets.find(item => item.sheet.id === 'ni-basics-models');
const exampleLines = parse(colorSheet(example.plain, palette, example.sheet.id));
assert.equal(atLine(exampleLines[6], 'switch', 'cross-page switch ownership'), 'hp', 'shared switch ownership resolves consistently to its owning title');
assert.equal(at(exampleLines, 'enterprise', 'sheet-wide title ownership'), 'li');
assert.equal(atLine(exampleLines[6], 'MAC', 'optional MAC accent'), 'db');

const cloud = sheets.sheets.find(item => item.sheet.id === 'ni-wireless-cloud');
const cloudLines = parse(colorSheet(cloud.plain, palette, cloud.sheet.id));
assert.equal(atLine(cloudLines[12], 'service', 'cloud second-title ownership'), 'li');
assert.equal(atLine(cloudLines[22], 'cloud', 'cloud cross-page ownership'), 'g');
assert.equal(colorAt(cloudLines[12], cloudLines[12].text.lastIndexOf('and')), 'pen', 'title connective stopword does not create a body family');

const password = sheets.sheets.find(item => item.sheet.id === 'cs-mitigation-practice');
const passwordLines = parse(colorSheet(password.plain, palette, password.sheet.id));
assert.equal(atLine(passwordLines[17], 'password', 'longest-title password ownership'), 'g', 'equal-specificity password titles resolve to the longer title');

const priorities = sheets.sheets.find(item => item.sheet.id === 'sp-discovery-opening');
const prioritiesLines = parse(colorSheet(priorities.plain, palette, priorities.sheet.id));
assert.equal(atLine(prioritiesLines[39], 'priorities', 'priorities title ownership'), 'p');

console.log('PASS: FBLA lexical title ownership, exact line preservation, optional anchor plan, neutral syntax, two-color limit and drift guards.');
