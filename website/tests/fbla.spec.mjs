import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('FBLA pilot supports keyboard retrieval, offline loading, and a narrow mobile viewport', async ({ page, browser }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/fbla.html');
  await expect(page.getByRole('heading', { name: 'FBLA Study Plan' })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to FBLA study plan' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Home' })).toBeFocused();
  const question = page.getByText('For 198.51.100.139/27', { exact: false });
  await expect(question).toBeVisible();
  const answers = page.locator('#pilot-answer-key');
  await expect(answers).not.toHaveAttribute('open', '');
  await expect(answers.locator('h3')).not.toBeVisible();
  await answers.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(answers.locator('h3')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(answers.locator('h3')).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
  const offline = await browser.newPage();
  await offline.goto(`file://${process.cwd().replaceAll('\\', '/')}/public/fbla.html`);
  await expect(offline.getByRole('heading', { name: 'FBLA Study Plan' })).toBeVisible();
  await expect(offline.getByRole('link', { name: 'Download printable plain-text note' })).toHaveAttribute('href', /notes\/fbla\/ipv4-subnetting\.txt/);
  await offline.close();
});

test('FBLA hub explains a general-audience study loop and 17 practice skills without mobile overflow', async ({ page }) => {
  await page.goto('/fbla.html');
  await expect(page.locator('#start-here')).toContainText('card order is not a lesson sequence');
  await expect(page.locator('#rehearsal')).toContainText('not 17 additional official requirements');
  await expect(page.locator('#rehearsal')).not.toContainText(/\bour\b|\breview\b|\baudit\b/i);
  await expect(page.locator('#start-here')).toContainText('Without the package, use the practice questions for recall');
  await expect(page.getByRole('heading', { name: 'Build a study schedule' })).toBeVisible();
  await expect(page.locator('[data-objective]')).toHaveCount(17);
  await expect(page.locator('.rehearsal-group').nth(0).locator('[data-objective]')).toHaveCount(8);
  await expect(page.locator('.rehearsal-group').nth(1).locator('[data-objective]')).toHaveCount(9);
  await page.locator('.rehearsal-group summary').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('link', { name: 'Open the related study sheet' }).first()).toBeVisible();
  for (const direction of ['ltr', 'rtl']) {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.locator('html').evaluate((element, direction) => element.dir = direction, direction);
    await page.locator('details').evaluateAll(elements => elements.forEach(element => element.open = true));
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  }
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
  for (const link of await page.locator('[data-objective] a').evaluateAll(links => links.map(link => link.getAttribute('href')))) {
    await page.goto(link);
    await expect(page.locator(new URL(page.url()).hash)).toBeVisible();
    await page.goBack();
  }
});

test('FBLA hub prints answers and rehearsal skills without opening disclosures first', async ({ page }) => {
  await page.goto('/fbla.html');
  const answers = page.locator('#pilot-answer-key');
  await expect(answers).not.toHaveAttribute('open', '');
  await page.emulateMedia({ media: 'print' });
  expect(await answers.locator('h3').evaluate(element => element.checkVisibility())).toBe(true);
  for (const group of await page.locator('.rehearsal-group').all()) {
    await expect(group).not.toHaveAttribute('open', '');
    expect(await group.locator('ol').evaluate(element => element.checkVisibility())).toBe(true);
  }
  await expect(page.locator('#source-ledger details')).not.toHaveAttribute('open', '');
  const pdf = await page.pdf({ format: 'A4' });
  expect(pdf.length).toBeGreaterThan(10000);
});

const courses = [['networking', 14], ['cybersecurity', 13], ['network-design', 12], ['sales', 5]];
test('LAN body occurrences have one color across every event, sheet, and page', async ({ page }) => {
  let count = 0;
  for (const [event] of courses) {
    await page.goto(`/fbla-${event}.html`);
    const occurrences = await page.locator('.course-pages .line').evaluateAll(lines => lines.flatMap(line => {
      const number = Number(line.querySelector('.number').textContent);
      if ([2, 3].includes((number - 1) % 24 + 1)) return [];
      const note = line.querySelector('.note');
      if (note.textContent.startsWith('o ')) return [];
      const words = [...note.textContent.matchAll(/(?<![A-Za-z0-9'-])LANs?(?![A-Za-z0-9'-])/gi)];
      const spans = [...note.querySelectorAll('[class^="ink-"]')].filter(span => /^LANs?$/i.test(span.textContent));
      return words.map((word, index) => ({ word: word[0], color: spans[index] ? getComputedStyle(spans[index]).color : 'uncolored', line: number }));
    }));
    for (const occurrence of occurrences) expect(occurrence.color, `${event}:${occurrence.line} ${occurrence.word}`).toBe('rgb(23, 63, 136)');
    count += occurrences.length;
  }
  expect(count).toBeGreaterThan(10);
});

test('FBLA heading palettes vary between sheets instead of resetting on each two-page sheet', async ({ page }) => {
  for (const [event, count] of courses) {
    await page.goto(`/fbla-${event}.html`);
    const palettes = await page.locator('.course-sheet').evaluateAll(sheets => sheets.map(sheet => [...sheet.querySelectorAll('.note')]
      .filter(note => note.textContent.startsWith('o ') && note.textContent !== 'o Overview')
      .map(note => getComputedStyle(note.querySelector('[class^="ink-"]')).color)));
    expect(new Set(palettes.map(colors => colors.join('|'))).size).toBe(Math.min(9, count));
    expect(new Set(palettes.flat()).size).toBe(10);
    await expect(page.locator('.course-sheet > h2').first()).toHaveCSS('color', 'rgb(89, 184, 231)');
    palettes.slice(1).forEach((colors, index) => expect(colors).not.toEqual(palettes[index]));
  }
});

test('FBLA added inks render online and offline without remapping World History blue', async ({ page }) => {
  for (const [event] of courses) {
    for (const url of [`/fbla-${event}.html`, `file://${process.cwd().replaceAll('\\', '/')}/public/fbla-${event}.html`]) {
      await page.goto(url);
      for (const [ink, color] of [['pu', 'rgb(136, 58, 194)'], ['li', 'rgb(121, 201, 0)'], ['or', 'rgb(230, 126, 34)'], ['r', 'rgb(223, 48, 52)'], ['p', 'rgb(237, 142, 180)'], ['hp', 'rgb(236, 34, 140)'], ['db', 'rgb(23, 63, 136)'], ['mb', 'rgb(40, 125, 179)'], ['g', 'rgb(22, 132, 56)'], ['y', 'rgb(235, 198, 0)']]) {
        const spans = page.locator(`.course-pages .ink-${ink}`);
        expect(await spans.count()).toBeGreaterThan(0);
        await expect(spans.first()).toHaveCSS('color', color);
      }
      await expect(page.locator('.course-sheet > h2').first()).toHaveCSS('color', 'rgb(89, 184, 231)');
      await expect(page.locator('#notes')).not.toContainText(/\((?:pen|g|li|or|pu|p|hp|r|db|mb|y)\)/);
    }
  }
  await page.goto('/fbla-networking.html');
  await expect(page.locator('#ni-basics-models .sheet').first().locator('.line').nth(3).locator('.ink-g')).toHaveText('LAN scale and purpose');
  await page.goto('/ap-world.html');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--y').trim())).toBe('#287db3');
});

for (const [event, sheetCount] of courses) {
  test(`FBLA ${event} course is accessible, offline-ready, and prints ${sheetCount * 2} pages`, async ({ page, browser }) => {
    test.setTimeout(90000);
    for (const direction of ['ltr', 'rtl']) {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(`/fbla-${event}.html`);
      await page.locator('html').evaluate((element, dir) => element.setAttribute('dir', dir), direction);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByRole('link', { name: 'FBLA Study Plan', exact: true })).toHaveAttribute('aria-current', 'page');
      await expect(page.locator('.course-sheet')).toHaveCount(sheetCount);
      await expect(page.locator('.course-pages article')).toHaveCount(sheetCount * 2);
      await expect(page.locator('.course-pages .sheet')).toHaveCount(sheetCount * 2);
      await expect(page.locator('.course-pages .line')).toHaveCount(sheetCount * 48);
      await page.locator('.course-sheet details summary').first().focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('.course-sheet details').first()).toHaveAttribute('open', '');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
      const accessibility = await new AxeBuilder({ page }).analyze();
      expect(accessibility.violations.filter(item => item.id !== 'color-contrast')).toEqual([]);
      for (const violation of accessibility.violations.filter(item => item.id === 'color-contrast')) {
        for (const node of violation.nodes) {
          for (const selector of node.target) {
            expect(await page.locator(selector).evaluate(element => element.matches('[class^="ink-"], .course-sheet > h2, .course-pages h3'))).toBe(true);
          }
        }
      }
    }
    const offline = await browser.newPage();
    await offline.goto(`file://${process.cwd().replaceAll('\\', '/')}/public/fbla-${event}.html`);
    await expect(offline.locator('.course-sheet')).toHaveCount(sheetCount);
    await expect(offline.locator('.course-download a[download$=".txt"]')).toHaveCount(sheetCount * 2);
    await offline.setViewportSize({ width: Math.floor((210 - 24) * 96 / 25.4), height: 1123 });
    await offline.emulateMedia({ media: 'print' });
    expect(await offline.locator('.course-pages .note').evaluateAll(notes => notes.filter(note => note.getBoundingClientRect().height > note.closest('.line').getBoundingClientRect().height + 1).map(note => note.textContent)), 'printed note rows fit without clipping').toEqual([]);
    expect(await offline.locator('.course-pages .line').evaluateAll(lines => lines.filter(line => line.getBoundingClientRect().bottom > line.closest('.sheet').getBoundingClientRect().bottom + 1).map(line => line.textContent)), 'printed rows stay inside the paper border').toEqual([]);
    const pdf = await offline.pdf({ format: 'A4', printBackground: true, displayHeaderFooter: false });
    const pages = pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? [];
    expect(pages.length, `${event} physical PDF pages`).toBe(sheetCount * 2);
    await offline.close();
  });
}
