import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cards, renderFlashcards } from '../scripts/flashcards.mjs';
import { escapeHTML, loadAlgebraNotes, root } from '../scripts/build.mjs';

const html = readFileSync(resolve(root, 'algebra-2-flashcards.html'), 'utf8');
assert.equal(cards.length, 26);
assert.equal(new Set(cards.map(card => card.topic)).size, 13);
cards.forEach(card => {
  assert.equal(card.lines.length, 10, card.title);
  card.lines.forEach(line => assert.ok(line.length <= 37, `${card.title}: ${line}`));
  assert.ok(html.includes(`<h3>${escapeHTML(card.title)}</h3>`));
  assert.ok(html.includes(`<summary>${escapeHTML(card.lines[0])}</summary>`));
  card.lines.slice(1).forEach(line => assert.ok(html.includes(`<li>${escapeHTML(line)}</li>`)));
});
assert.equal((html.match(/<article class="flash-card">/g) ?? []).length, 26);
assert.equal((html.match(/<section class="flash-topic"/g) ?? []).length, 13);
assert.equal(html, renderFlashcards(escapeHTML, loadAlgebraNotes));
const notes = readFileSync(resolve(root, 'algebra-2.html'), 'utf8');
assert.match(notes, /href="algebra-2-flashcards\.html"/);
assert.match(html, /href="algebra-2\.html"/);
assert.doesNotMatch(html, /<script\b|\son\w+\s*=|@import|url\s*\(/i);
console.log('PASS: 26 flashcards, 13 topic groups, exact 10-line source payloads, 37-character limit, reproducible JS-free page and Algebra notes links.');
