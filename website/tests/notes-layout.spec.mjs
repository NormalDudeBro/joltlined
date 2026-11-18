import { expect, test } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const firstSpread = page => page.locator('.pages').first().getByRole('article');

async function expectSpread(page, stacked) {
  const first = await firstSpread(page).nth(0).boundingBox();
  const second = await firstSpread(page).nth(1).boundingBox();
  if (stacked) {
    expect(second.y).toBeGreaterThanOrEqual(first.y + first.height);
    expect(second.x).toBeCloseTo(first.x);
  } else {
    expect(second.y).toBeCloseTo(first.y);
    expect(second.x).toBeGreaterThan(first.x);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);
}

test('AP World stacks the note pages at the effective viewport of a 5120×1440 display at 500% zoom', async ({ page }) => {
  // Desktop page zoom shrinks the CSS layout viewport, unlike pinch zoom or deviceScaleFactor.
  await page.setViewportSize({ width: 1024, height: 288 });
  await page.goto('/ap-world.html');
  await expectSpread(page, true);
});

for (const path of ['ap-world', 'ap-lang', 'algebra-2', 'fbla-networking']) {
  test(`${path} keeps a readable ultrawide spread and reflows for zoom, tablet and phone`, async ({ page }) => {
    await page.setViewportSize({ width: 5120, height: 1440 });
    await page.goto(`/${path}.html`);
    await expectSpread(page, false);
    const note = firstSpread(page).first().locator('.note').first();
    await expect(note).toHaveCSS('font-size', '18px');

    for (const [width, height, stacked] of [[1707, 480, true], [1280, 360, true], [1366, 768, false], [768, 1024, true], [320, 640, true]]) {
      await page.setViewportSize({ width, height });
      await expectSpread(page, stacked);
    }
  });
}

test.describe('offline layout control', () => {
  test.use({ javaScriptEnabled: false });

  test('stacking can be selected by keyboard without changing zoom or print', async ({ page }) => {
    await page.setViewportSize({ width: 5120, height: 1440 });
    await page.goto(pathToFileURL(resolve('public/ap-world.html')).href);
    const stack = page.getByRole('checkbox', { name: 'Stack note pages' });
    await stack.focus();
    await stack.press('Space');
    await expect(stack).toBeChecked();
    await expectSpread(page, true);
    await page.emulateMedia({ media: 'print' });
    await expect(stack).toBeHidden();
    await expect(page.locator('.pages').first()).toHaveCSS('display', 'block');
    await expect(firstSpread(page).first().locator('.note').first()).toHaveCSS('font-size', '12px');
    await page.emulateMedia({ media: 'screen' });
    await stack.press('Space');
    await expect(stack).not.toBeChecked();
    await expectSpread(page, false);
  });
});
