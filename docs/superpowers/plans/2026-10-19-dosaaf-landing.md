# ДОСААФ Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a Tilda-independent, visually faithful responsive ДОСААФ landing page with the user-approved content changes.

**Architecture:** Use a dependency-free static site: semantic `index.html`, one CSS design system and one small JavaScript controller. Local assets replicate the reference imagery and fonts; JavaScript owns only menu, anchor navigation, scroll reveal and persistent cookie consent.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Playwright for viewport and interaction checks, static HTTP server for local review.

**Spec:** `docs/superpowers/specs/2026-10-19-dosaaf-landing-design.md`

## Global Constraints

- Do not load Tilda CSS, JavaScript, form endpoints, CDN assets, classes, or markup.
- Store all reused visual assets and HeliosCond fonts below `assets/`.
- Use original reference layout and motion for all retained sections; use the replaced block's geometry for «Направления».
- Exclude all forms, their CTA triggers, FAQ and the partner section.
- Use `+7 965 057-23-97`; show address and the Yandex map for «улица Игоря Баталова, 2»; do not show an email address.
- Mobile, tablet and desktop must be verified at 375, 768, 1024 and 1440 px.
- Native semantic controls, keyboard interactions, visible focus and reduced-motion support are required.

## Review Focus

- A small mobile viewport must not overflow horizontally and must expose the navigation through the menu button.
- Cookie consent must persist after reload and must not cause a layout shift.
- Each changed/removed section must be absent from DOM text and navigation, rather than merely hidden.
- The map must have an explicit accessible label and be visually square on desktop and mobile.
- The «Направления» list must retain every approved destination and specialty with local icons if the external emoji URLs are unavailable.

---

### Task 1: Create the static-site base and local asset inventory

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `script.js`
- Create: `assets/fonts/helios-cond-regular.woff`
- Create: `assets/fonts/helios-cond-bold.woff`
- Create: `assets/images/*`
- Create: `tests/site.spec.mjs`
- Create: `package.json`

**Interfaces:**
- Produces the local static root consumed by all later tasks.
- Produces `npm run test:visual` and `npm run test:site` commands for later verification.

- [ ] **Step 1: Write a failing smoke test for page title, local font declarations and absence of Tilda URLs**

```js
test('serves the approved title and has no Tilda dependency', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Служба по контракту/);
  await expect(page.locator('body')).not.toContainText('Tilda');
});
```

- [ ] **Step 2: Run the smoke test and confirm it fails because the site does not exist**

Run: `npm run test:site`

- [ ] **Step 3: Download permitted source assets, add local font files, and create static package/test scaffolding**

Use an explicit local asset manifest and preserve source aspect ratios. Do not copy the Tilda HTML/CSS/JS.

- [ ] **Step 4: Run the smoke test and confirm it passes**

Run: `npm run test:site`

### Task 2: Implement visual structure and approved content changes

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `tests/site.spec.mjs`

**Interfaces:**
- Consumes local assets created in Task 1.
- Produces semantic anchors `#payments`, `#benefits`, `#process`, `#contacts` consumed by navigation.

- [ ] **Step 1: Write failing DOM tests for excluded content, new contacts, altered support grid and directions list**

```js
await expect(page.getByRole('heading', { name: 'НАПРАВЛЕНИЯ' })).toBeVisible();
await expect(page.getByText('Ремонтный батальон')).toBeVisible();
await expect(page.getByText('+7 965 057-23-97')).toBeVisible();
await expect(page.getByText('Ответы на часто задаваемые вопросы')).toHaveCount(0);
```

- [ ] **Step 2: Run targeted content tests and confirm they fail**

Run: `npm run test:site -- --grep "approved content"`

- [ ] **Step 3: Build all retained page sections using local imagery and reference-derived visual tokens**

Make the original hero, information cards, family support, entry requirements, corrected support grid, documents, directions and contacts responsive. Render local location/check SVG icons within the directions content. Replace contact card content as specified.

- [ ] **Step 4: Run targeted content tests and confirm they pass**

Run: `npm run test:site -- --grep "approved content"`

### Task 3: Implement the interactive behavior and reference-style motion

**Files:**
- Modify: `script.js`
- Modify: `styles.css`
- Modify: `index.html`
- Modify: `tests/site.spec.mjs`

**Interfaces:**
- `initNavigation()`, `initCookieConsent()`, `initScrollReveal()` initialise after `DOMContentLoaded`.

- [ ] **Step 1: Write failing browser tests for menu state, cookie persistence and reduced-motion safe reveal state**

```js
await page.getByRole('button', { name: /открыть меню/i }).click();
await expect(page.getByRole('navigation', { name: /мобильное меню/i })).toBeVisible();
await page.getByRole('button', { name: /понятно/i }).click();
await expect(page.locator('[data-cookie-banner]')).toBeHidden();
```

- [ ] **Step 2: Run interaction tests and confirm they fail**

Run: `npm run test:site -- --grep "interactions"`

- [ ] **Step 3: Add accessible navigation, persistent cookie banner and IntersectionObserver-based motion**

Preserve the reference's subtle opacity/translate entrance rhythm and hover treatment. Respect `prefers-reduced-motion`; use no modal or form behavior.

- [ ] **Step 4: Run interaction tests and confirm they pass**

Run: `npm run test:site -- --grep "interactions"`

### Task 4: Visual QA, repository setup and publishing

**Files:**
- Modify: `README.md`
- Modify: `.gitignore`
- Modify: `tests/site.spec.mjs`
- Create: `test-results/reference-*.png` (untracked visual artefacts only)

**Interfaces:**
- Produces setup instructions and a Git branch ready for `origin`.

- [ ] **Step 1: Add viewport screenshot tests for 375, 768, 1024 and 1440 px**

Each test must assert no horizontal document overflow, local critical media and visible directions/contacts content.

- [ ] **Step 2: Run the visual and interaction suite against a local static server**

Run: `npm run test:visual && npm run test:site`

- [ ] **Step 3: Inspect the screenshots and correct layout differences before continuing**

Compare against the provided reference screenshots and live reference. Preserve approved differences only.

- [ ] **Step 4: Initialise/pull the supplied repository, create branch `codex/dosaaf-landing`, commit verified files and push**

Run: `git push -u origin codex/dosaaf-landing`

- [ ] **Step 5: Verify remote branch contains the commit**

Run: `git ls-remote --heads origin codex/dosaaf-landing`
