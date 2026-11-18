import { expect, test } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

function contrast(a, b) {
  const luminance = color => color.match(/\d+/g).map(Number).map(channel => channel / 255)
    .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, i) => sum + channel * [0.2126, 0.7152, 0.0722][i], 0);
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test.use({ colorScheme: 'dark', javaScriptEnabled: false });

test('manual theme works offline without changing original print inks', async ({ page }) => {
  await page.goto(pathToFileURL(resolve('public/ap-world.html')).href);
  const theme = page.getByRole('combobox', { name: 'Theme' });
  const sheet = page.locator('.sheet').first();
  const ink = sheet.locator('.ink.g').first();
  await expect(theme).toHaveValue('system');
  await expect(sheet).toHaveCSS('background-color', 'rgb(32, 38, 48)');
  await theme.selectOption('light');
  await expect(sheet).toHaveCSS('background-color', 'rgb(255, 254, 251)');
  await expect(ink).toHaveCSS('color', 'rgb(22, 132, 56)');
  await page.emulateMedia({ colorScheme: 'light' });
  await theme.selectOption('dark');
  await expect(sheet).toHaveCSS('background-color', 'rgb(32, 38, 48)');
  await page.emulateMedia({ media: 'print', colorScheme: 'dark' });
  await expect(theme).toBeHidden();
  await expect(sheet).toHaveCSS('background-color', 'rgb(255, 254, 251)');
  await expect(ink).toHaveCSS('color', 'rgb(22, 132, 56)');
});

test('reading and flashcard surfaces follow the same theme', async ({ page }) => {
  for (const [path, card] of [['/', '.reading-link'], ['/algebra-2-flashcards.html', '.flash-card'], ['/fbla.html', '.fbla-card'], ['/of-mice-and-men.html', '.page']]) {
    await page.goto(path);
    const theme = page.getByRole('combobox', { name: 'Theme' });
    const surface = page.locator(card).first();
    const dark = await surface.evaluate(element => getComputedStyle(element).backgroundColor);
    const ink = await surface.evaluate(element => getComputedStyle(element).color);
    expect(contrast(ink, dark), path).toBeGreaterThanOrEqual(4.5);
    await theme.selectOption('light');
    await expect(surface).not.toHaveCSS('background-color', dark);
  }
});

for (const path of ['ap-world', 'ap-lang', 'algebra-2', 'fbla-networking']) {
  test(`${path}: dark inks meet 4.5:1 against the sheet and match their named swatches`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(`/${path}.html`);
    const result = await page.evaluate(() => {
      const scopes = [...document.querySelectorAll('.legend')].map(legend => {
        const unit4 = legend.closest('.unit-4-palette');
        const tokens = [...legend.querySelectorAll('.swatch')].map(swatch => {
          const token = swatch.classList[1];
          const ink = [...(unit4 ?? document).querySelectorAll(`.sheet ${token === 'pen' ? '.note' : `.ink.${token}, .ink-${token}`}`)]
            .find(element => Boolean(element.closest('.unit-4-palette')) === Boolean(unit4));
          return {
            name: swatch.parentElement.textContent,
            swatch: getComputedStyle(swatch).backgroundColor,
            ink: ink ? getComputedStyle(ink).color : null,
          };
        });
        return tokens;
      });
      return {
        tokensByLegend: scopes,
        sheet: getComputedStyle(document.querySelector('.sheet')).backgroundColor,
        number: getComputedStyle(document.querySelector('.number')).color,
        title: getComputedStyle(document.querySelector('.topic-title')).color,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(result.overflow).toBe(false);
    for (const tokens of result.tokensByLegend) {
      expect(tokens.length).toBeGreaterThanOrEqual(10);
      expect(new Set(tokens.map(token => token.swatch)).size).toBe(tokens.length);
      for (const { name, swatch, ink } of tokens) {
        expect(name).toMatch(/^\w+ [a-z ]+$/);
        expect(contrast(swatch, result.sheet), name).toBeGreaterThanOrEqual(4.5);
        if (ink) expect(ink, name).toBe(swatch);
      }
    }
    expect(contrast(result.number, result.sheet)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(result.title, 'rgb(23, 27, 34)')).toBeGreaterThanOrEqual(4.5);
    if (path === 'ap-world') {
      await expect(page.locator('header .legend')).toContainText('y medium blue');
      await expect(page.locator('#unit-4 .legend')).toContainText('y yellow');
      expect(result.tokensByLegend[0].find(token => token.name.startsWith('y ')).swatch)
        .not.toBe(result.tokensByLegend[1].find(token => token.name.startsWith('y ')).swatch);
    }
  });
}
