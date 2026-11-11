import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCourseSheets } from '../scripts/fbla.mjs';
import { colorSheet, fblaInks } from '../scripts/fbla-colors.mjs';
import { palette } from '../scripts/build.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(resolve(here, '../scripts/fbla-color-plan.json'), 'utf8'));
const termPlan = JSON.parse(readFileSync(resolve(here, '../scripts/fbla-term-colors.json'), 'utf8'));
const registered = Object.entries(termPlan).flatMap(([color, terms]) => terms.map(term => ({ term, color })));
const termExpression = new RegExp(`(?<![A-Za-z0-9'-])(?:${registered.map(item => item.term).sort((a, b) => b.length - a.length).map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?=(?:'s|')?(?![A-Za-z0-9'-]))`, 'gi');
const termColors = new Map(registered.map(item => [item.term.toLowerCase(), item.color]));
assert.equal(termColors.size, registered.length, 'each global term has exactly one color');
const sheets = renderCourseSheets();
const marker = /\((pen|g|li|pu|br|or|y|r|db|mb|p|lb|hp)\)/g;
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

assert.deepEqual(Object.keys(fblaInks).sort(), ['db', 'mb', 'r', 'y']);
assert.deepEqual(fblaInks, { r: '#df3034', db: '#173f88', mb: '#287db3', y: '#ebc600' });
assert.equal(Object.keys(config.sheets).length, 44);
assert.equal(Object.keys(config.sheets).length * 2, 88, 'local source plan covers both pages of all 44 sheets');

let lanOccurrences = 0;
let crowdedLines = 0;
for (const item of sheets.sheets) {
  const lines = parse(colorSheet(item.plain, palette, item.sheet.id));
  for (const [index, line] of lines.entries()) {
    if (line.text.startsWith('o ') || [1, 2].includes(index % 24)) continue;
    for (const match of line.text.matchAll(/(?<![A-Za-z0-9'-])LANs?(?![A-Za-z0-9'-])/gi)) {
      assert.equal(colorAt(line, match.index), 'db', `${item.sheet.id}:${index + 1}: every body LAN occurrence must be dark blue, independent of heading palette`);
      lanOccurrences++;
    }
  }
}
assert.ok(lanOccurrences > 10, 'cross-sheet LAN regression covers the actual course, not one fixture');

for (const event of ['networking', 'cybersecurity', 'network-design', 'sales']) {
  const eventSheets = sheets.sheets.filter(item => item.module.event === event);
  const sequences = eventSheets.map(item => parse(colorSheet(item.plain, palette, item.sheet.id))
    .filter(line => line.text.startsWith('o ') && line.text !== 'o Overview')
    .map(line => line.spans.find(span => span.ink !== 'pen' && span.text)?.ink).join(','));
  assert.ok(new Set(sequences).size >= Math.min(9, eventSheets.length), `${event}: heading palettes must vary across sheets; got ${[...new Set(sequences)]}`);
  assert.deepEqual([...new Set(sequences.flatMap(sequence => sequence.split(',')))].sort(), ['g', 'li', 'or', 'r', 'p', 'hp', 'db', 'mb', 'pu', 'y'].sort(), `${event}: headings use all ten section inks, including orange and medium blue; light blue remains the sheet-title ink`);
}

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
    if (accents.size > 2) crowdedLines++;
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
      const expected = Array(plainLine.length).fill('pen');
      for (const match of plainLine.matchAll(termExpression)) {
        for (let offset = 0; offset < match[0].length; offset++) {
          if (/[A-Za-z]/.test(match[0][offset])) expected[match.index + offset] = termColors.get(match[0].toLowerCase());
        }
      }
      for (const word of plainLine.matchAll(/[A-Za-z]/g)) {
        assert.equal(colorAt(rendered, word.index), expected[word.index], `${item.sheet.id}:${index + 1}: body letters follow only the global term registry`);
      }
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

  assert.ok(!Object.hasOwn(sheetPlan, 'accents'), 'per-sheet body exceptions have been removed');
}
assert.ok(crowdedLines > 0, 'registered terms are retained even when more than two body colors co-occur');

assert.throws(() => colorSheet(sheets.sheets[0].plain, palette, 'unknown-sheet-id'), /unknown sheet/i);
assert.throws(() => colorSheet(`${sheets.sheets[0].plain}drift`, palette, sheets.sheets[0].sheet.id), /source|fingerprint|hash/i);

const atLine = (line, term, label) => {
  const index = line.text.toLowerCase().indexOf(term.toLowerCase());
  assert.notEqual(index, -1, `${label}: worked-example term occurs on the expected source line`);
  return colorAt(line, index);
};

const example = sheets.sheets.find(item => item.sheet.id === 'ni-basics-models');
const exampleLines = parse(colorSheet(example.plain, palette, example.sheet.id));
assert.equal(atLine(exampleLines[4], 'LAN', 'global LAN ink'), 'db');
assert.equal(atLine(exampleLines[6], 'switch', 'global switch ink'), 'li');
assert.equal(atLine(exampleLines[6], 'Ethernet', 'global Ethernet ink'), 'or');
assert.equal(atLine(exampleLines[6], 'MAC', 'global MAC ink'), 'db');
assert.equal(atLine(exampleLines[17], 'enterprise', 'unregistered prose'), 'pen');
assert.ok(new Set(exampleLines[6].spans.filter(span => span.ink !== 'pen').map(span => span.ink)).size > 2, 'all three registered colors survive on the same line');

const cloud = sheets.sheets.find(item => item.sheet.id === 'ni-wireless-cloud');
const cloudLines = parse(colorSheet(cloud.plain, palette, cloud.sheet.id));
assert.equal(atLine(cloudLines[12], 'service', 'unregistered heading word in body'), 'pen');
assert.equal(atLine(cloudLines[22], 'cloud', 'global cloud ink'), 'mb');
assert.equal(colorAt(cloudLines[12], cloudLines[12].text.lastIndexOf('and')), 'pen', 'title connective stopword does not create a body family');

const password = sheets.sheets.find(item => item.sheet.id === 'cs-mitigation-practice');
const passwordLines = parse(colorSheet(password.plain, palette, password.sheet.id));
assert.equal(atLine(passwordLines[17], 'password', 'global password ink'), 'hp');

const priorities = sheets.sheets.find(item => item.sheet.id === 'sp-discovery-opening');
const prioritiesLines = parse(colorSheet(priorities.plain, palette, priorities.sheet.id));
assert.equal(atLine(prioritiesLines[39], 'priorities', 'priorities title ownership'), 'pu');

const bodyLine = (sheetId, snippet) => {
  const item = sheets.sheets.find(entry => entry.sheet.id === sheetId);
  const line = parse(colorSheet(item.plain, palette, item.sheet.id)).find(entry => entry.text.includes(snippet));
  assert.ok(line, `${sheetId}: missing ${snippet}`);
  return line;
};
const possessive = bodyLine('ni-hardware-infrastructure', "switch's total PoE");
assert.equal(colorAt(possessive, possessive.text.indexOf('switch')), 'li', 'possessive switch inherits its base color');
assert.equal(colorAt(possessive, possessive.text.indexOf("'")), 'pen', 'possessive apostrophe stays pencil');
assert.equal(colorAt(possessive, possessive.text.indexOf("'") + 1), 'pen', 'possessive suffix stays pencil');
assert.equal(atLine(possessive, 'PoE', 'restored PoE'), 'db');
const tcp = bodyLine('ni-basics-forwarding', "TCP's delivery");
assert.equal(colorAt(tcp, tcp.text.toLowerCase().indexOf('tcp')), 'p', 'possessive TCP inherits its base color');
assert.equal(colorAt(tcp, tcp.text.indexOf("'") + 1), 'pen');
const privilege = bodyLine('nd-security-access-platforms', 'least-privilege');
assert.equal(atLine(privilege, 'least', 'hyphenated least-privilege'), 'db');
assert.equal(atLine(privilege, 'privilege', 'hyphenated least-privilege'), 'db');
assert.equal(colorAt(privilege, privilege.text.indexOf('-')), 'pen', 'hyphen in an explicit alias stays pencil');
assert.equal(atLine(bodyLine('cs-mitigation-practice', 'phishing-resistant'), 'phishing', 'phishing-resistant alias'), 'r');
assert.equal(atLine(bodyLine('cs-mitigation-protocols', 'IDS monitors'), 'IDS', 'IDS body term'), 'r');
assert.equal(atLine(bodyLine('cs-data-cryptography', 'Caesar is a shift'), 'Caesar', 'Caesar body term'), 'r');
assert.equal(atLine(bodyLine('ni-hardware-infrastructure', 'mounted in a rack'), 'rack', 'rack body term'), 'mb');
const wireless = bodyLine('ni-wireless-performance', 'Neither Wi-Fi nor cellular');
assert.equal(atLine(wireless, 'Wi-Fi', 'Wi-Fi versus cellular'), 'y');
assert.equal(atLine(wireless, 'cellular', 'Wi-Fi versus cellular'), 'or');
const measured = bodyLine('nd-administration-troubleshooting', 'Measure latency and throughput');
assert.equal(atLine(measured, 'latency', 'latency versus throughput'), 'li');
assert.equal(atLine(measured, 'throughput', 'latency versus throughput'), 'g');
assert.notEqual(atLine(measured, 'latency', 'latency versus throughput'), atLine(measured, 'throughput', 'latency versus throughput'));
const access = bodyLine('ni-basics-addressing', 'Fiber, coax, DSL and cellular');
assert.equal(atLine(access, 'Fiber', 'access media'), 'li');
assert.equal(atLine(access, 'coax', 'access media'), 'mb');
assert.equal(atLine(access, 'DSL', 'access media'), 'mb');
assert.equal(atLine(access, 'cellular', 'access media'), 'or');
assert.equal(atLine(bodyLine('ni-basics-addressing', 'route toward the ISP'), 'ISP', 'ISP body term'), 'or');
assert.equal(atLine(bodyLine('ni-basics-addressing', 'uses ARP on Ethernet'), 'ARP', 'ARP protocol'), 'p');
assert.equal(atLine(bodyLine('ni-basics-addressing', 'dotted-decimal octet'), 'octet', 'IPv4 octet'), 'mb');
assert.equal(atLine(bodyLine('ni-basics-addressing', 'dotted-decimal octet'), 'decimal', 'dotted-decimal notation'), 'r');
assert.equal(atLine(bodyLine('ni-basics-addressing', 'written as hexadecimal'), 'hexadecimal', 'hexadecimal alias'), 'r');
assert.equal(atLine(bodyLine('nd-administration-troubleshooting', 'mask, gateway, DNS'), 'gateway', 'gateway next hop'), 'db');
assert.equal(atLine(bodyLine('nd-administration-troubleshooting', 'mask, gateway, DNS'), 'mask', 'subnet mask'), 'mb');

console.log(`PASS: ${registered.length} centrally registered body terms, ${lanOccurrences} consistent LAN occurrences, independent varied heading palettes, exact preservation and drift guards.`);
