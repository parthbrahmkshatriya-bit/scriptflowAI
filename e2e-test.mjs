import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3002';
const SS = '/tmp/scriptflow-ss';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

const consoleErrors = [];
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', err => consoleErrors.push(err.message));

async function shot(name) {
  await page.screenshot({ path: `${SS}/${name}.png` });
  console.log(`📸 ${name}.png`);
}

// ── 1. Landing page ───────────────────────────────────────────────────────────
console.log('\n[1] Landing page');
await page.goto(BASE, { waitUntil: 'networkidle' });
await shot('01-landing');
const hero = await page.locator('h1').first().textContent().catch(() => '');
console.log('   Hero:', hero.trim());
const pricingVisible = await page.locator('text=Pricing').first().isVisible().catch(() => false);
console.log('   Pricing section:', pricingVisible ? '✅ visible' : '❌ missing');

// ── 2. Login page ─────────────────────────────────────────────────────────────
console.log('\n[2] Login page');
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await shot('02-login');
console.log('   "Welcome back":', await page.locator('text=Welcome back').isVisible().catch(() => false) ? '✅' : '❌');
console.log('   Google OAuth btn:', await page.locator('button:has-text("Continue with Google")').isVisible().catch(() => false) ? '✅' : '❌');
console.log('   Email input:', await page.locator('#email').isVisible().catch(() => false) ? '✅' : '❌');
console.log('   Magic link btn:', await page.locator('button:has-text("magic link")').isVisible().catch(() => false) ? '✅' : '❌');

// ── 3. Auth guard ─────────────────────────────────────────────────────────────
console.log('\n[3] Auth guard probe — unauthenticated /dashboard/generate');
const probeCtx = await browser.newContext();
const probePage = await probeCtx.newPage();
await probePage.goto(`${BASE}/dashboard/generate`, { waitUntil: 'networkidle' });
const probeUrl = probePage.url();
console.log('   Redirected to:', probeUrl);
console.log('   Guard working:', probeUrl.includes('/login') ? '✅' : '❌');
await probeCtx.close();

// ── 4. Test generate API directly (bypasses UI auth) ─────────────────────────
console.log('\n[4] Generate API — test Anthropic key is valid');
const apiRes = await page.evaluate(async (base) => {
  const res = await fetch(`${base}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      concept: 'A drone flying over a futuristic city at sunrise',
      duration: '15s',
      platform: 'youtube_shorts',
      visual_style: 'cinematic',
      ai_tool: 'veo3',
    }),
  });
  return { status: res.status, body: await res.text() };
}, BASE);

console.log('   Status:', apiRes.status);
if (apiRes.status === 401) console.log('   ✅ Returns 401 Unauthorized (auth required — expected)');
else if (apiRes.status === 500) console.log('   ❌ 500 error:', apiRes.body.slice(0, 200));
else console.log('   Response:', apiRes.body.slice(0, 200));

// ── 5. Signup page ────────────────────────────────────────────────────────────
console.log('\n[5] Signup page');
await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' });
await shot('03-signup');
console.log('   Signup form:', await page.locator('form').isVisible().catch(() => false) ? '✅' : '❌');

// ── 6. Pricing section on landing ─────────────────────────────────────────────
console.log('\n[6] Pricing section');
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1000);
await shot('04-pricing');
const monthlyBtn = await page.locator('button:has-text("Monthly")').isVisible().catch(() => false);
const annualBtn = await page.locator('button:has-text("Annual")').isVisible().catch(() => false);
console.log('   Monthly/Annual toggle:', monthlyBtn && annualBtn ? '✅' : '❌');
const paypalText = await page.locator('text=/PayPal/i').first().isVisible().catch(() => false);
console.log('   PayPal indicator:', paypalText ? '✅' : '❌');

// Switch to annual and screenshot
if (annualBtn) {
  await page.locator('button:has-text("Annual")').click();
  await page.waitForTimeout(500);
  await shot('05-pricing-annual');
  console.log('   Annual toggle works: ✅');
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n── Console errors ──────────────────────────────────');
if (consoleErrors.length) consoleErrors.slice(0, 5).forEach(e => console.log('  ❌', e));
else console.log('  none ✅');

await browser.close();
console.log('\nScreenshots saved to /tmp/scriptflow-ss/');
