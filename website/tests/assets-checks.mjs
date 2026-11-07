import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const images = ['author', 'class', 'cover', 'excluded', 'fahrenheit-451-cover', 'home', 'inclusiveness', 'meditalker', 'of-mice-and-men-cover', 'perspective', 'school', 'talker', 'voice'].map(name => `${name}.jpg`);
const targets = [root, ...(process.env.PREVIEW_PATH ? [dirname(resolve(process.env.PREVIEW_PATH))] : [])];

for (const target of targets) {
  assert.deepEqual(readdirSync(target).filter(name => /\.(?:jpe?g|png|gif|webp|svg)$/i.test(name)), [], 'site images must not clutter the root');
  assert.deepEqual(readdirSync(resolve(target, 'assets/images')).sort(), images, 'all thirteen images live in assets/images');
  const referenced = new Set();
  for (const page of ['index.html', 'out-of-my-mind.html', 'of-mice-and-men.html', 'fahrenheit-451.html']) {
    const html = readFileSync(resolve(target, page), 'utf8');
    for (const match of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)) {
      assert.ok(match[1].startsWith('assets/images/'), `${page}: image path is organized and relative`);
      const image = readFileSync(resolve(target, match[1]));
      assert.ok(image.length > 0, `${match[1]} is not empty`);
      assert.deepEqual(image, readFileSync(resolve(root, match[1])), `${match[1]} preserves source bytes`);
      referenced.add(match[1].slice('assets/images/'.length));
    }
  }
  assert.deepEqual([...referenced].sort(), images, 'all images are used');
}

console.log(`PASS: thirteen organized images, no root image clutter, valid page references and exact bytes across ${targets.length} site(s).`);
