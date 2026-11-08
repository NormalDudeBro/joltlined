import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const website = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const root = resolve(website, '..');
// Check tracked and unignored files, not local previews or dependency folders.
const visible = [...new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).map(name => name.split('/')[0]))].filter(name => !name.startsWith('.'));
assert.deepEqual(visible.sort(), ['README.md', 'docs', 'website'], 'root is a curated entry point, not a publishing directory');
assert.deepEqual(readdirSync(website).filter(name => name.endsWith('.html')), [], 'HTML belongs in public');
for (const name of ['public', 'scripts', 'tests']) {
  assert.ok(statSync(resolve(website, name)).isDirectory(), `${name} has a dedicated home`);
}
for (const name of ['package.json', 'package-lock.json', 'playwright.config.mjs', '.htmlvalidate.json']) {
  assert.ok(statSync(resolve(website, name)).isFile(), `${name} is scoped to website tooling`);
}
const workflow = readFileSync(resolve(root, '.github/workflows/quality.yml'), 'utf8');
assert.match(workflow, /working-directory: website/);
assert.match(workflow, /cache-dependency-path: website\/package-lock.json/);
assert.match(workflow, /path: website\/public/);
assert.match(workflow, /needs: validate/);
assert.match(workflow, /actions\/deploy-pages@/);
assert.deepEqual([...workflow.matchAll(/runs-on:\s*(\S+)/g)].map(match => match[1]), ['ubuntu-24.04', 'ubuntu-24.04'], 'both CI jobs pin Ubuntu 24.04 instead of following ubuntu-latest migrations');
assert.deepEqual([...workflow.matchAll(/uses:\s*(actions\/[^\s]+)/g)].map(match => match[1]), [
  'actions/checkout@v7',
  'actions/setup-node@v7',
  'actions/upload-pages-artifact@v5',
  'actions/deploy-pages@v5',
], 'use Node.js 24 actions, including the Pages uploader that bundles upload-artifact v7');
assert.equal(readFileSync(resolve(website, 'public/CNAME'), 'utf8').trim(), 'www.joltlined.com');
for (const file of ['README.md', 'docs/development.md', 'docs/technical-reference.md']) {
  const markdown = readFileSync(resolve(root, file), 'utf8');
  for (const match of markdown.matchAll(/\]\(([^)]+)\)|(?:src|href)="([^"]+)"/g)) {
    const href = match[1] ?? match[2];
    if (/^https?:/.test(href)) continue;
    const [path, fragment] = href.split('#');
    const target = path ? resolve(root, dirname(file), path) : resolve(root, file);
    assert.ok(statSync(target).isFile(), `${file}: ${href} exists`);
    if (!fragment || !target.endsWith('.md')) continue;
    const headings = [...readFileSync(target, 'utf8').matchAll(/^#+ (.+)$/gm)].map(heading => heading[1].toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-'));
    assert.ok(headings.includes(fragment), `${file}: ${href} heading exists`);
  }
}
console.log('PASS: curated repository root, scoped tooling, public-only Pages artifact, quality-gated deployment, and preserved custom domain.');
