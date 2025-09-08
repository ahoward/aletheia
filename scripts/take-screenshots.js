/**
 * Screenshot generator for Aletheia application
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function takeScreenshot(url, filename, selector = null, delay = 2000) {
  console.log(`📸 Taking screenshot of ${url} -> ${filename}`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, delay)); // Allow time for components to load
    
    if (selector) {
      await page.waitForSelector(selector, { timeout: 10000 });
      const element = await page.$(selector);
      if (element) {
        await element.screenshot({ path: filename, type: 'png' });
      } else {
        await page.screenshot({ path: filename, type: 'png', fullPage: true });
      }
    } else {
      await page.screenshot({ path: filename, type: 'png', fullPage: true });
    }
    
    console.log(`✅ Screenshot saved: ${filename}`);
  } catch (error) {
    console.error(`❌ Error taking screenshot of ${url}:`, error.message);
  }
  
  await browser.close();
}

async function main() {
  const baseUrl = 'http://localhost:3002';
  const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
  
  // Ensure screenshots directory exists
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  const screenshots = [
    {
      name: 'dashboard',
      url: `${baseUrl}`,
      filename: path.join(screenshotsDir, '01-dashboard.png'),
      delay: 3000
    },
    // Note: Since we're using a SPA with client-side routing,
    // we can't directly navigate to different routes via URL
    // We would need to add navigation simulation or direct URL routing
  ];
  
  console.log('🚀 Starting screenshot capture...');
  
  for (const shot of screenshots) {
    await takeScreenshot(shot.url, shot.filename, null, shot.delay);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between screenshots
  }
  
  console.log('✨ Screenshot capture complete!');
}

main().catch(console.error);