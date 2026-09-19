import { chromium } from 'file:///C:/Users/Karan/AppData/Local/Temp/poshan-qa-pw/node_modules/playwright/index.mjs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = 'C:/Users/Karan/Web development/PBL NEW/qa-screens';
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const report = [];

async function waitForDonate(district) {
  await page.waitForFunction((name) => {
    const heading = [...document.querySelectorAll('h2')].find((el) => el.textContent.includes(`What Can I Donate in ${name}`));
    const loading = [...document.querySelectorAll('div,p')].some((el) => /Loading nutrition data|Loading recommended foods|Loading live requirements/i.test(el.textContent || ''));
    return Boolean(heading) && !loading;
  }, district, { timeout: 20000 });
}

async function inspectDistrict(district) {
  await waitForDonate(district);
  const donateSection = page.locator('section', { has: page.getByRole('heading', { name: `What Can I Donate in ${district}` }) }).first();
  await donateSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await donateSection.screenshot({ path: path.join(OUT, `${district.toLowerCase()}-donate.png`) });
  const nutritionSection = page.locator('section', { has: page.getByRole('heading', { name: 'Nutrition / Deficiency Data' }) }).first();
  if (await nutritionSection.count()) {
    await nutritionSection.screenshot({ path: path.join(OUT, `${district.toLowerCase()}-nutrition.png`) });
  }

  const data = await donateSection.evaluate((root) => {
    const heading = root.querySelector('h2')?.textContent?.trim() || '';
    const cta = [...root.querySelectorAll('button')].find((btn) => /Donate These Foods/i.test(btn.textContent || ''));
    const ctaStyle = cta ? getComputedStyle(cta) : null;
    const recHeading = [...root.querySelectorAll('h3')].find((el) => /Recommended for this district/i.test(el.textContent || ''));
    const neededHeading = [...root.querySelectorAll('h3')].find((el) => /Needed right now/i.test(el.textContent || ''));
    const recCards = recHeading ? recHeading.closest('div')?.parentElement?.querySelectorAll('article') : [];
    const foods = [...(recCards || [])].map((card) => ({
      title: card.querySelector('h4')?.textContent?.trim() || '',
      hasImg: Boolean(card.querySelector('img')),
      imgSrc: card.querySelector('img')?.currentSrc || card.querySelector('img')?.src || '',
      imgNaturalWidth: card.querySelector('img')?.naturalWidth || 0,
      fallback: Boolean(card.querySelector('[aria-label$="image unavailable"]')),
    }));
    const neededCards = neededHeading ? neededHeading.closest('div')?.parentElement?.querySelectorAll('article') : [];
    const needed = [...(neededCards || [])].map((card) => ({
      text: card.innerText.replace(/\s+/g, ' ').trim(),
    }));
    const neededEmpty = neededHeading?.closest('div')?.parentElement?.innerText || '';
    return {
      heading,
      ctaText: cta?.textContent?.trim() || '',
      ctaDisabled: Boolean(cta?.disabled),
      ctaBg: ctaStyle?.backgroundColor || '',
      ctaColor: ctaStyle?.color || '',
      ctaOpacity: ctaStyle?.opacity || '',
      foods,
      needed,
      neededEmpty: needed.length ? '' : neededEmpty.slice(0, 400),
    };
  });
  report.push({ district, ...data });
  return data;
}

await page.goto('http://localhost:5173/explore', { waitUntil: 'networkidle', timeout: 45000 });
await inspectDistrict('Nashik');

async function searchDistrict(name) {
  const input = page.getByPlaceholder(/Search district/i);
  await input.fill(name);
  await page.getByRole('button', { name: 'Search' }).click();
}

await searchDistrict('Pune');
await inspectDistrict('Pune');
await searchDistrict('Akola');
await inspectDistrict('Akola');

const cta = page.getByRole('button', { name: /Donate These Foods/i }).first();
await cta.click();
await page.waitForURL(/food-match/, { timeout: 15000 });
await page.waitForFunction(() => !/Loading district recommendations/i.test(document.body.innerText), null, { timeout: 20000 });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, 'akola-food-match.png'), fullPage: false });
const match = await page.evaluate(() => {
  const title = document.querySelector('h1')?.textContent?.trim() || '';
  const url = location.href;
  const cards = [...document.querySelectorAll('button[aria-pressed]')].map((btn) => ({
    name: btn.innerText.replace(/\s+/g, ' ').trim(),
    pressed: btn.getAttribute('aria-pressed'),
    hasImg: Boolean(btn.querySelector('img')),
  }));
  const qtyRows = [...document.querySelectorAll('input[type="number"]')].map((input) => ({
    label: input.getAttribute('aria-label'),
    value: input.value,
  }));
  const unitSelects = [...document.querySelectorAll('select')].map((select) => ({
    label: select.getAttribute('aria-label'),
    value: select.value,
  }));
  return { title, url, cards, qtyRows, unitSelects, bodySnippet: document.body.innerText.slice(0, 1500) };
});
report.push({ donationPage: match });

if (match.qtyRows?.length) {
  await page.locator('input[type="number"]').first().fill('5');
  await page.locator('select').first().selectOption('packets');
  if (match.qtyRows.length > 1) {
    await page.locator('input[type="number"]').nth(1).fill('12');
    await page.locator('select').nth(1).selectOption('kg');
  }
  await page.screenshot({ path: path.join(OUT, 'akola-food-match-qty.png') });
}

await page.goto('http://localhost:5173/explore', { waitUntil: 'networkidle', timeout: 45000 });
await waitForDonate('Nashik');
const nashikCta = page.getByRole('button', { name: /Donate These Foods/i }).first();
await nashikCta.click();
await page.waitForURL(/food-match/, { timeout: 15000 });
await page.waitForFunction(() => !/Loading district recommendations/i.test(document.body.innerText), null, { timeout: 20000 });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, 'nashik-food-match.png') });
const nashikMatch = await page.evaluate(() => ({ title: document.querySelector('h1')?.textContent?.trim(), url: location.href }));
report.push({ nashikDonationPage: nashikMatch });

console.log(JSON.stringify(report, null, 2));
await browser.close();
