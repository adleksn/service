import { test, expect } from '@playwright/test';

test('serves the approved title and has no Tilda dependency', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Служба по контракту/);
  await expect(page.locator('body')).not.toContainText('Tilda');
});

test('renders approved content changes without removed sections', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'НАПРАВЛЕНИЯ' })).toBeVisible();
  await expect(page.getByText('Ремонтный батальон')).toBeVisible();
  await expect(page.getByText('ИСР (инженерно-сапёрная рота)')).toBeVisible();
  await expect(page.getByRole('link', { name: '+7 (965) 057 23 97' }).first()).toBeVisible();
  await expect(page.getByText('улица Игоря Баталова, 2')).toBeVisible();
  await expect(page.getByText('Ответы на часто задаваемые вопросы')).toHaveCount(0);
  await expect(page.getByText('Сотрудничество c рекрутинговыми партнёрами')).toHaveCount(0);
  await expect(page.locator('.support-grid article').first()).toContainText('[ 01 ]');
  await expect(page.locator('.support-grid article').first()).toContainText('Проживание и питание');
});

test('interactions: menu and cookie acknowledgement work accessibly', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/');
  const toggle = page.locator('.menu-toggle');
  await toggle.click();
  await expect(page.getByRole('navigation', { name: 'Мобильное меню' })).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('button', { name: 'Закрыть меню' }).press('Escape');
  await expect(page.getByRole('navigation', { name: 'Мобильное меню' })).toBeHidden();
  await page.getByRole('button', { name: 'Понятно' }).click();
  await expect(page.locator('[data-cookie-banner]')).toBeHidden();
  await page.reload();
  await expect(page.locator('[data-cookie-banner]')).toBeHidden();
});

test('keeps map geometry, local direction icons, and menu focus contract', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.map-wrap iframe')).toHaveAttribute('src', /35\.78981.*56\.844633/);
  await expect(page.locator('.direction-icon').first()).toHaveAttribute('src', /^assets\/images\//);
  await page.locator('.map-wrap').scrollIntoViewIfNeeded();
  expect(await page.locator('.map-wrap').evaluate(element => {
    const { width, height } = element.getBoundingClientRect();
    return Math.abs(width - height) < 1;
  })).toBeTruthy();

  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/');
  await page.locator('.menu-toggle').click();
  await page.getByRole('link', { name: 'Выплаты' }).last().focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('.menu-toggle')).toBeFocused();
});

test('uses local reference imagery in the hero and directions panel', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-operator')).toHaveAttribute('src', 'assets/images/operator.webp');
  await expect(page.locator('.directions-media .directions-drone')).toHaveAttribute('src', 'assets/images/hero-drone.webp');
  await expect(page.locator('.directions-media .directions-drone')).toBeVisible();
});

test('keeps reference white sections full-bleed and conditions compact', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('#payments')).toHaveClass(/white-section/);
  await expect(page.locator('#benefits')).toHaveClass(/white-section/);
  await expect(page.locator('#process')).toHaveClass(/white-section/);
  const cards = page.locator('.condition-grid article');
  await expect(cards).toHaveCount(4);
  expect(await cards.first().evaluate(element => element.getBoundingClientRect().height)).toBeLessThanOrEqual(170);
});

for (const width of [375, 768, 1024, 1440]) {
  test(`@visual layout has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    await page.getByRole('heading', { name: 'НАПРАВЛЕНИЯ' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: 'НАПРАВЛЕНИЯ' })).toBeVisible();
    await page.getByRole('heading', { name: 'КОНТАКТЫ' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: 'КОНТАКТЫ' })).toBeVisible();
    for (const section of await page.locator('.reveal').all()) {
      await section.scrollIntoViewIfNeeded();
    }
    await page.screenshot({ path: `test-results/reference-${width}.png`, fullPage: true });
  });
}
