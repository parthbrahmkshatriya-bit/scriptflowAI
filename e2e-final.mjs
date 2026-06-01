import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3004';
const SS = '/tmp/scriptflow-ss';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const errors = [];
page.on('pageerror', e => errors.push(e.message));

// Landing page
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${SS}/final-01-landing.png` });
const hero = await page.locator('h1').first().textContent().catch(() => '');
console.log('Hero:', hero.trim());
console.log('Page errors:', errors.length ? errors : 'none ✅');

// Scroll to pricing
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(800);
await page.screenshot({ path: `${SS}/final-02-pricing.png` });

// Login
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${SS}/final-03-login.png` });
console.log('Login errors:', errors.length ? errors : 'none ✅');

await browser.close();
console.log('Done ✅');
