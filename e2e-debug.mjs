import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3000';
const SS = '/tmp/scriptflow-ss';
const EMAIL = 'parth.brahmkshatriya@gmail.com';
const PASSWORD = process.env.TEST_PASSWORD || '';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

// Capture ALL console output
page.on('console', msg => console.log(`  [browser ${msg.type()}]`, msg.text()));
page.on('pageerror', err => console.log('  [browser error]', err.message));

// Capture network responses for auth calls
page.on('response', async res => {
  if (res.url().includes('supabase') || res.url().includes('auth')) {
    let body = '';
    try { body = await res.text(); } catch {}
    console.log(`  [net] ${res.status()} ${res.url().replace(/https:\/\/[^/]+/, '')}`);
    if (body && body.length < 500) console.log(`       body: ${body}`);
  }
});

async function shot(name) {
  await page.screenshot({ path: `${SS}/${name}.png`, fullPage: true });
  console.log(`📸 ${name}.png`);
}

console.log('\n[LOGIN DEBUG]');
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });

await page.fill('#email', EMAIL);
await page.fill('#password', PASSWORD);
await shot('debug-01-filled');

console.log('\nSubmitting form...');
await page.click('button[type="submit"]');

// Wait a few seconds and capture everything
await page.waitForTimeout(5000);
await shot('debug-02-after-submit');

console.log('\nCurrent URL:', page.url());

// Look for any visible text on page that might indicate error
const bodyText = await page.evaluate(() => document.body.innerText);
const relevantLines = bodyText.split('\n').filter(l => l.trim() && l.length < 200).slice(0, 20);
console.log('\nPage text (first 20 lines):');
relevantLines.forEach(l => console.log(' ', l.trim()));

// Also check for sonner toasts which may have faded
const toasts = await page.locator('[data-sonner-toaster] li, [data-radix-toast-viewport] li').allTextContents().catch(() => []);
console.log('\nToasts visible:', toasts.length ? toasts : 'none');

await browser.close();
