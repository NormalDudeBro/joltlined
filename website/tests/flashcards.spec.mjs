import { expect, test } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { root } from '../scripts/build.mjs';

test('flashcards work without JavaScript, fit narrow viewports and print revealed answers', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
  const page = await context.newPage();
  await page.goto('/algebra-2-flashcards.html');
  await expect(page.locator('.flash-card')).toHaveCount(26);
  await expect(page.locator('.flash-topic')).toHaveCount(13);
  const first = page.locator('.flash-card').first();
  await expect(first.locator('summary')).toBeVisible();
  await expect(first.locator('ol')).toBeHidden();
  await first.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(first.locator('ol')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Flashcard topics' }).getByRole('link')).toHaveCount(13);
  await expect(first.locator('.back a')).toHaveAttribute('href', 'algebra-2.html#topic-1-5-linear');

  for (const width of [320, 375, 600, 960, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    for (const direction of ['ltr', 'rtl']) {
      await page.locator('html').evaluate((html, dir) => { html.dir = dir; }, direction);
      await page.locator('.flash-card details').evaluateAll(details => details.forEach(detail => { detail.open = true; }));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px ${direction} page width`).toBe(true);
      expect(await page.locator('.flash-card summary, .flash-card li').evaluateAll(elements => elements.filter(element => element.scrollWidth > element.clientWidth).map(element => element.textContent)), `${width}px ${direction} card lines fit without wrapping or clipping`).toEqual([]);
      await page.locator('.flash-card details').evaluateAll(details => details.forEach(detail => { detail.open = false; }));
    }
  }

  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.flash-card li')).toHaveCount(234);
  await expect(page.locator('.flash-card summary')).toHaveCount(26);
  const printLines = page.locator('.flash-card summary, .flash-card li');
  expect(await printLines.evaluateAll(lines => lines.map(line => line.getClientRects().length > 0))).toEqual(Array(260).fill(true));
  await page.locator('.flash-card details').evaluateAll(details => details.forEach(detail => { detail.open = true; }));
  expect(await printLines.evaluateAll(lines => lines.map(line => line.getClientRects().length > 0))).toEqual(Array(260).fill(true));
  await context.close();
});

test('flashcards load from local files with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(pathToFileURL(resolve(root, 'algebra-2-flashcards.html')).href);
  await expect(page.locator('.flash-card')).toHaveCount(26);
  await expect(page.locator('.flash-card details[open]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test('Algebra 2 notes link to the separate flashcards page', async ({ page }) => {
  await page.goto('/algebra-2.html');
  await page.getByRole('link', { name: /Study the Algebra 2 teaching flashcards/ }).click();
  await expect(page).toHaveURL(/algebra-2-flashcards\.html$/);
});
