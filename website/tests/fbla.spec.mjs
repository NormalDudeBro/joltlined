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

const courses = [['networking', 14], ['cybersecurity', 13], ['network-design', 12], ['sales', 5]];
for (const [event, sheetCount] of courses) {
  test(`FBLA ${event} course is accessible, offline-ready, and prints ${sheetCount * 2} pages`, async ({ page, browser }) => {
    test.setTimeout(90000);
    for (const direction of ['ltr', 'rtl']) {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(`/fbla-${event}.html`);
      await page.locator('html').evaluate((element, dir) => element.setAttribute('dir', dir), direction);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByRole('link', { name: 'FBLA Study Plan' })).toHaveAttribute('aria-current', 'page');
      await expect(page.locator('.course-sheet')).toHaveCount(sheetCount);
      await expect(page.locator('.course-pages article')).toHaveCount(sheetCount * 2);
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
    const pdf = await offline.pdf({ format: 'A4', printBackground: true, displayHeaderFooter: false });
    const pages = pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? [];
    expect(pages.length, `${event} physical PDF pages`).toBe(sheetCount * 2);
    await offline.close();
  });
}
