/**
 * kingdomtreatzrva.com — Mobile-First Responsive + WCAG 2.2 AA Audit
 *
 * Run locally: node audit-site.js
 * Requires: npm install lighthouse chrome-launcher puppeteer
 *
 * WHAT THIS CATCHES THAT A REMOTE/TEXT-BASED CHECK CANNOT:
 * - Actual horizontal overflow at each breakpoint (the #1 symptom of a
 *   sizing/scaling regression) by measuring real scrollWidth vs viewport
 * - Fixed-width elements that don't collapse on mobile
 * - Tap targets under 44x44px (WCAG 2.5.8)
 * - Real computed contrast ratios via Lighthouse's axe-core engine
 * - Whether content is USABLE at 320px, not just "doesn't error"
 */

const puppeteer = require('puppeteer');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';

// Real public-facing routes for this Next.js app (src/app/).
// Admin routes (/admin, /admin/orders*, /admin/customers*, /admin/take-payment)
// sit behind auth and redirect to /admin/login when unauthenticated, so only
// the login page is meaningfully auditable without a session.
const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Menu', path: '/menu' },
  { name: 'Specials', path: '/specials' },
  { name: 'Story', path: '/learn-more' },
  { name: 'Checkout', path: '/checkout' },
  { name: 'Admin Login', path: '/admin/login' },
];

const BREAKPOINTS = [
  { name: '320px (small mobile)', width: 320, height: 800 },
  { name: '375px (standard mobile)', width: 375, height: 812 },
  { name: '768px (tablet)', width: 768, height: 1024 },
  { name: '1024px (small desktop)', width: 1024, height: 768 },
  { name: '1440px (desktop)', width: 1440, height: 900 },
];

async function checkOverflowAndTapTargets(page, viewportWidth) {
  return page.evaluate((vw) => {
    const results = { overflowElements: [], smallTapTargets: [], horizontalScroll: false };

    // Real horizontal overflow check — the actual regression symptom
    const docWidth = document.documentElement.scrollWidth;
    if (docWidth > vw + 1) {
      results.horizontalScroll = true;
    }

    // Find every element wider than the viewport (the usual culprits:
    // fixed-width divs, un-constrained images, tables without wrap)
    document.querySelectorAll('*').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > vw + 1) {
        results.overflowElements.push({
          tag: el.tagName.toLowerCase(),
          class: el.className ? String(el.className).slice(0, 80) : '',
          width: Math.round(rect.width),
          computedWidth: window.getComputedStyle(el).width,
        });
      }
    });

    // WCAG 2.5.8 — tap targets under 44x44 (only checks interactive elements)
    document.querySelectorAll('a, button, input, select, textarea, [role="button"]').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
        results.smallTapTargets.push({
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || '').trim().slice(0, 40),
          size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
        });
      }
    });

    return results;
  }, viewportWidth);
}

async function runBreakpointAudit() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const report = {};

  for (const pageInfo of PAGES) {
    report[pageInfo.name] = {};
    const url = BASE_URL + pageInfo.path;

    for (const bp of BREAKPOINTS) {
      const page = await browser.newPage();
      await page.setViewport({ width: bp.width, height: bp.height });
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        const result = await checkOverflowAndTapTargets(page, bp.width);
        report[pageInfo.name][bp.name] = result;
      } catch (err) {
        report[pageInfo.name][bp.name] = { error: err.message };
      }
      await page.close();
    }
  }

  await browser.close();
  return report;
}

async function runLighthouseAudit(urlPath) {
  // lighthouse is ESM-only (since v10) — this project's package.json has no
  // "type": "module", so it must be loaded via dynamic import, not require().
  const lighthouse = (await import('lighthouse')).default;

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox', '--disable-setuid-sandbox'] });
  const options = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['accessibility', 'best-practices'],
    port: chrome.port,
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 375, height: 812, deviceScaleFactor: 2 },
  };
  const runnerResult = await lighthouse(BASE_URL + urlPath, options);
  await chrome.kill();

  const lhr = runnerResult.lhr;
  const audits = lhr.audits;

  return {
    accessibilityScore: Math.round(lhr.categories.accessibility.score * 100),
    bestPracticesScore: Math.round(lhr.categories['best-practices'].score * 100),
    contrastIssues: audits['color-contrast'] && audits['color-contrast'].score !== 1
      ? audits['color-contrast'].details?.items?.length || 'FAIL (see details)'
      : 'PASS',
    tapTargetsAudit: audits['tap-targets']
      ? (audits['tap-targets'].score === 1 ? 'PASS' : audits['tap-targets'].details?.items)
      : 'not run',
    viewportAudit: audits['viewport'] ? audits['viewport'].score === 1 ? 'PASS' : 'FAIL' : 'not run',
    imageAltAudit: audits['image-alt'] ? (audits['image-alt'].score === 1 ? 'PASS' : audits['image-alt'].details?.items) : 'not run',
    focusableAudit: audits['focusable-controls'] ? (audits['focusable-controls'].score === 1 ? 'PASS' : 'FAIL') : 'not run',
  };
}

(async () => {
  console.log('=== Phase 2: Mobile-First Breakpoint / Overflow Audit ===\n');
  const breakpointReport = await runBreakpointAudit();

  for (const [pageName, bpData] of Object.entries(breakpointReport)) {
    console.log(`\n--- ${pageName} ---`);
    for (const [bpName, result] of Object.entries(bpData)) {
      if (result.error) {
        console.log(`  ${bpName}: ERROR — ${result.error}`);
        continue;
      }
      const flag = result.horizontalScroll ? '❌ HORIZONTAL SCROLL DETECTED' : '✅ no overflow';
      console.log(`  ${bpName}: ${flag}`);
      if (result.overflowElements.length) {
        console.log(`    Overflowing elements (${result.overflowElements.length}):`);
        result.overflowElements.slice(0, 5).forEach((el) => {
          console.log(`      <${el.tag} class="${el.class}"> width=${el.width}px (computed: ${el.computedWidth})`);
        });
      }
      if (result.smallTapTargets.length) {
        console.log(`    Undersized tap targets (${result.smallTapTargets.length}, need ≥44x44):`);
        result.smallTapTargets.slice(0, 5).forEach((t) => {
          console.log(`      <${t.tag}> "${t.text}" — ${t.size}`);
        });
      }
    }
  }

  console.log('\n\n=== Phase 3: WCAG 2.2 AA / Lighthouse Audit (mobile) ===\n');
  for (const pageInfo of PAGES) {
    console.log(`\n--- ${pageInfo.name} (${pageInfo.path}) ---`);
    try {
      const lhResult = await runLighthouseAudit(pageInfo.path);
      console.log(JSON.stringify(lhResult, null, 2));
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
    }
  }

  fs.writeFileSync('audit-results.json', JSON.stringify(breakpointReport, null, 2));
  console.log('\n\nFull breakpoint report saved to audit-results.json');
})();
