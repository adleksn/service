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

test('keeps full-width map, local direction icons, and menu focus contract', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.map-wrap iframe')).toHaveAttribute('src', /35\.78981.*56\.844633/);
  await expect(page.locator('.direction-icon').first()).toHaveAttribute('src', /^assets\/images\//);
  await page.locator('.map-wrap').scrollIntoViewIfNeeded();
  expect(await page.locator('.map-wrap').evaluate(element => Math.abs(element.getBoundingClientRect().width - window.innerWidth) < 1)).toBeTruthy();

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
  await expect(page.locator('#process')).not.toHaveClass(/white-section/);
  const cards = page.locator('.condition-grid article');
  await expect(cards).toHaveCount(4);
  expect(await cards.first().evaluate(element => element.getBoundingClientRect().height)).toBeLessThanOrEqual(180);
});

test('places a full-bleed map above the contacts heading', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const map = page.locator('#contacts .map-wrap');
  const heading = page.locator('#contacts .section-heading');
  expect(await map.evaluate(element => Math.abs(element.getBoundingClientRect().width - window.innerWidth) < 1)).toBeTruthy();
  expect(await heading.evaluate((element, mapElement) => element.compareDocumentPosition(mapElement) & Node.DOCUMENT_POSITION_PRECEDING, await map.elementHandle())).toBeTruthy();
  await expect(page.locator('.payment-grid article').first()).toHaveClass(/reveal-item/);
});

test('matches the reference composition for the Dosaaf and payment blocks', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.intro-reference-image')).toHaveAttribute('src', 'assets/images/contract-signing.jpg');
  await expect(page.locator('#payments .payment-banner')).toBeVisible();
  await expect(page.locator('#payments .eyebrow img')).toHaveAttribute('src', 'assets/images/frame-604.svg');
  await expect(page.locator('.intro-copy')).not.toHaveClass(/panel/);
});

test('uses the reference layout treatments for benefits, conditions and support', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#benefits .eyebrow img')).toHaveAttribute('src', 'assets/images/frame-604.svg');
  await expect(page.locator('#process .eyebrow img')).toHaveAttribute('src', 'assets/images/frame-604-dark.svg');
  await expect(page.locator('#process')).not.toHaveClass(/white-section/);
  await expect(page.locator('#process .condition-grid article').first()).toHaveClass(/condition-card/);
  await expect(page.locator('.support-grid')).toHaveClass(/support-reference-grid/);
  await expect(page.locator('#directions .directions-panel')).toHaveClass(/directions-reference-panel/);
});

test('provides the requested hover and reference card treatments', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const cta = page.getByRole('link', { name: 'Узнать условия и выплаты' }).first();
  const before = await cta.evaluate(element => getComputedStyle(element).transform);
  await cta.hover();
  await expect.poll(() => cta.evaluate(element => getComputedStyle(element).transform)).not.toBe(before);

  await expect(page.locator('#directions .directions-list li').first()).toHaveClass(/direction-role/);
  await expect(page.locator('#benefits .benefit-grid article').first()).toHaveClass(/benefit-dark/);
  await expect(page.locator('.family-grid')).toHaveClass(/family-reference-grid/);
  await expect(page.locator('.document-layout')).toBeVisible();
  await expect(page.locator('.document-visual img')).toBeVisible();
  await expect(page.locator('.support-grid .support-image')).toHaveClass(/support-wide/);
});

test('renders the supplied crest and reference support-card decorations', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#benefits .benefit-crest')).toHaveAttribute('data-watermark', 'gerb');
  await expect(page.locator('.family-all .family-crest-mark')).toHaveAttribute('src', 'assets/images/gerb.png');
  await expect(page.locator('.support-grid article').first()).not.toHaveClass(/support-star|support-arc/);
  await expect(page.locator('.support-grid article').nth(1)).toHaveClass(/support-star/);
  await expect(page.locator('.support-grid .support-arc')).toHaveCount(0);
  await expect(page.locator('.document-grid article').first()).toHaveClass(/accent-top/);
});

test('keeps the complete family-support copy and the source icon treatments', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('.family-all')).toContainText('Освобождение от начисления пеней за несвоевременную оплату ЖКУ');
  await expect(page.locator('.family-all')).toContainText('Дополнительные формы социальной поддержки в зависимости от ситуации');
  await expect(page.locator('.family-card').nth(1)).toContainText('Приоритетное зачисление в группы продлённого дня без очереди');
  await expect(page.locator('.family-card').nth(1).locator('.family-label img')).toHaveAttribute('src', 'assets/images/family-children.svg');
  await expect(page.locator('.family-card').nth(2).locator('.family-label img')).toHaveAttribute('src', 'assets/images/family-parents.svg');
  await expect(page.locator('.benefit-grid article').first()).toHaveCSS('background-image', /benefit-debt\.png/);
  expect(await page.locator('.family-all').evaluate(element => getComputedStyle(element, '::after').backgroundImage)).toContain('gerb.png');
});

test('keeps document cards full-height and confines the star to the support card', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const documentCards = page.locator('.document-grid article');
  expect(await documentCards.first().evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(200);
  expect(await documentCards.nth(1).evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(200);
  await expect(page.locator('.support-grid article').first()).not.toHaveClass(/support-star/);
  await expect(page.locator('.support-grid article').nth(1)).toHaveClass(/support-star/);
  await expect(page.locator('.support-grid .support-arc')).toHaveCount(0);
});

test('keeps the payment background and mobile typography intact', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  expect(await page.locator('.hero-content').evaluate(element => Number.parseFloat(getComputedStyle(element).paddingTop))).toBeLessThanOrEqual(220);
  expect(await page.locator('#process .condition-card img').first().evaluate(element => Number.parseFloat(getComputedStyle(element).width))).toBeGreaterThanOrEqual(48);
  expect(await page.locator('#payments').evaluate(element => getComputedStyle(element, '::before').backgroundColor)).toBe('rgb(246, 243, 237)');
});

test('uses mobile-specific natural line wrapping in support, benefits and family cards', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  for (const selector of ['.support-reference-grid h3 br', '#benefits .benefit-grid h3 br', '.family-reference-grid p br']) {
    expect(await page.locator(selector).first().evaluate(element => getComputedStyle(element).display)).toBe('none');
  }
  expect(await page.locator('.support-reference-grid h3').first().evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(20);
});

test('switches dense reference card grids to one readable column on phones', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  for (const selector of ['#benefits .benefit-grid', '.support-reference-grid', '.family-reference-grid .family-card']) {
    expect(await page.locator(selector).first().evaluate(element => getComputedStyle(element).gridTemplateColumns)).not.toMatch(/\s/);
  }
  expect(await page.locator('.family-reference-grid .family-card').first().evaluate(element => getComputedStyle(element).display)).toBe('flex');
});

test('aligns the first family card with the mobile children card', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  const allFamilyLabel = page.locator('.family-card.family-all .family-label');
  const childrenLabel = page.locator('.family-card').nth(1).locator('.family-label');
  const allFamilyLeft = await allFamilyLabel.evaluate(element => element.getBoundingClientRect().left);
  const childrenLeft = await childrenLabel.evaluate(element => element.getBoundingClientRect().left);
  expect(Math.abs(allFamilyLeft - childrenLeft)).toBeLessThanOrEqual(1);
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
    await page.waitForTimeout(800);
    await page.screenshot({ path: `test-results/reference-${width}.png`, fullPage: true });
  });
}
