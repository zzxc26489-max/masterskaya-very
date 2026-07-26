import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const origin = 'http://127.0.0.1:4173';
const screenshotDirectory = path.resolve('artifacts/v2-screenshots');

const pages = [
  { name: 'home', path: '/v2/index.html' },
  { name: 'worlds', path: '/v2/worlds.html' },
  { name: 'residents', path: '/v2/residents.html' },
  { name: 'birth', path: '/v2/birth.html' }
];

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'small-mobile', width: 320, height: 700 }
];

test.beforeAll(async () => {
  await fs.mkdir(screenshotDirectory, { recursive: true });
});

async function revealWholePage(page) {
  const reveals = page.locator('.reveal');
  const count = await reveals.count();

  for (let index = 0; index < count; index += 1) {
    const element = reveals.nth(index);
    await element.scrollIntoViewIfNeeded();
    await expect(element).toHaveClass(/is-visible/, { timeout: 3_000 });
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100);
}

async function waitForImages(page) {
  await page.waitForFunction(() => [...document.images].every((image) => image.complete), null, {
    timeout: 15_000
  });
}

async function inspectPage(page, pageDefinition, viewport) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedLocalResources = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.origin !== origin || url.pathname === '/favicon.ico') return;
    if (response.status() >= 400) failedLocalResources.push(`${response.status()} ${url.pathname}`);
  });

  await page.goto(pageDefinition.path, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts?.ready);
  await expect(page.locator('main')).toBeVisible();
  await revealWholePage(page);
  await waitForImages(page);

  const menuButton = page.locator('[data-menu-toggle]');
  const navigation = page.locator('[data-navigation]');

  if (viewport.width <= 1152) {
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(navigation).toHaveClass(/is-open/);

    const openMenuWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(openMenuWidth, `open menu overflow on ${pageDefinition.path}`).toBeLessThanOrEqual(viewport.width + 1);

    await page.keyboard.press('Escape');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton).toBeFocused();
    await page.evaluate(() => document.activeElement?.blur());
  } else {
    await expect(menuButton).toBeHidden();
    await expect(navigation).toBeVisible();
  }

  const layout = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    overflowingElements: [...document.querySelectorAll('body *')]
      .filter((element) => {
        const style = getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return false;
        return rect.left < -1 || rect.right > window.innerWidth + 1;
      })
      .slice(0, 12)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        className: element.className || '',
        text: (element.textContent || '').trim().slice(0, 80),
        rect: element.getBoundingClientRect().toJSON()
      }))
  }));

  const brokenImages = await page.locator('img').evaluateAll((images) => images
    .filter((image) => image.naturalWidth === 0)
    .map((image) => image.currentSrc || image.getAttribute('src') || image.alt));

  const hero = page.locator('.hero');
  if (await hero.count()) {
    await expect(hero).toBeVisible();
    await expect(hero.locator('h1')).toBeVisible();
    await expect(hero.locator('img')).toHaveJSProperty('complete', true);
    const heroBox = await hero.boundingBox();
    expect(heroBox?.height || 0).toBeGreaterThan(300);
  }

  const screenshotPath = path.join(
    screenshotDirectory,
    `${pageDefinition.name}-${viewport.width}x${viewport.height}.png`
  );
  await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });

  expect(layout.documentWidth, `horizontal overflow on ${pageDefinition.path}`).toBeLessThanOrEqual(layout.viewportWidth + 1);
  expect(layout.overflowingElements, `overflowing elements on ${pageDefinition.path}`).toEqual([]);
  expect(brokenImages, `broken images on ${pageDefinition.path}`).toEqual([]);
  expect(failedLocalResources, `failed local resources on ${pageDefinition.path}`).toEqual([]);
  expect(pageErrors, `page errors on ${pageDefinition.path}`).toEqual([]);
  expect(consoleErrors, `console errors on ${pageDefinition.path}`).toEqual([]);
}

for (const pageDefinition of pages) {
  for (const viewport of viewports) {
    test(`${pageDefinition.name} at ${viewport.width}x${viewport.height}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        reducedMotion: 'no-preference'
      });
      const page = await context.newPage();
      await inspectPage(page, pageDefinition, viewport);
      await context.close();
    });
  }
}

test('resident filters keep semantic state and visible cards in sync', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/v2/residents.html', { waitUntil: 'load' });

  const availableButton = page.locator('[data-resident-filter="available"]');
  await availableButton.click();
  await expect(availableButton).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-resident-status="available"]')).toBeVisible();

  const hiddenCards = page.locator('[data-resident-status]:not([data-resident-status="available"])');
  await expect(hiddenCards).toHaveCount(3);
  expect(await hiddenCards.evaluateAll((cards) => cards.every((card) => card.hidden))).toBe(true);

  const allButton = page.locator('[data-resident-filter="all"]');
  await allButton.click();
  await expect(allButton).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-resident-status]')).toHaveCount(4);
  expect(await page.locator('[data-resident-status]').evaluateAll((cards) => cards.every((card) => !card.hidden))).toBe(true);
  await context.close();
});

test('reduced motion exposes content without reveal transitions', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();
  await page.goto('/v2/index.html', { waitUntil: 'load' });

  const revealState = await page.locator('.reveal').first().evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      opacity: style.opacity,
      transform: style.transform,
      transitionDuration: style.transitionDuration
    };
  });

  const transitionSeconds = revealState.transitionDuration
    .split(',')
    .map((value) => Number.parseFloat(value))
    .filter(Number.isFinite);

  expect(revealState.opacity).toBe('1');
  expect(revealState.transform).toBe('none');
  expect(Math.max(...transitionSeconds, 0)).toBeLessThanOrEqual(0.001);
  await context.close();
});
