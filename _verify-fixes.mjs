import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, executablePath: '/snap/bin/chromium' });
const page = await browser.newContext({ viewport: { width: 1440, height: 900 } }).then(c => c.newPage());
await page.goto('http://localhost:4300/blueprints', { waitUntil: 'networkidle' });
await page.waitForTimeout(5000);
await page.screenshot({ path: '/tmp/v2-blueprints.png' });
// Check no breadcrumb
const h = await page.evaluate(() => {
  const tb = document.querySelector('.tangle-cloud-topbar');
  return { topbarText: tb?.textContent?.replace(/\s+/g, ' ').trim() || 'no-topbar' };
});
console.log('Topbar text:', h.topbarText);

// Click connect, look at modal
const btn = page.locator('button:has-text("Connect")').first();
if (await btn.count() > 0) {
  await btn.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/v2-connect.png' });
  // Close
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}
await browser.close();
