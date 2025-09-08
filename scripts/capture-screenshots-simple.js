/**
 * Simple screenshot capture for Aletheia application
 * Uses basic navigation and waits for each view to load
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureScreenshots() {
  console.log('🚀 Starting Aletheia screenshot capture...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const baseUrl = 'http://localhost:3002';
  const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
  
  // Ensure screenshots directory exists
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  try {
    // Navigate to the main page
    console.log('📸 Loading main application...');
    await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(3000);
    
    // 1. Dashboard View (default)
    console.log('📸 Capturing Dashboard view...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-dashboard.png'), 
      type: 'png',
      fullPage: true 
    });
    
    // 2. Try to navigate to Narratives by clicking the second nav button
    console.log('📸 Navigating to Narratives view...');
    try {
      // Look for navigation elements and click the second one (likely Narratives)
      const navButtons = await page.$$('nav button');
      if (navButtons.length > 1) {
        await navButtons[1].click();
        await delay(2000);
      }
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '02-narratives.png'), 
        type: 'png',
        fullPage: true 
      });
    } catch (error) {
      console.warn('Could not navigate to Narratives view:', error.message);
    }
    
    // 3. Try to navigate to Staking
    console.log('📸 Navigating to Staking view...');
    try {
      const navButtons = await page.$$('nav button');
      if (navButtons.length > 2) {
        await navButtons[2].click();
        await delay(2000);
      }
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '03-staking.png'), 
        type: 'png',
        fullPage: true 
      });
    } catch (error) {
      console.warn('Could not navigate to Staking view:', error.message);
    }
    
    // 4. Try to navigate to Market
    console.log('📸 Navigating to Market view...');
    try {
      const navButtons = await page.$$('nav button');
      if (navButtons.length > 3) {
        await navButtons[3].click();
        await delay(2000);
      }
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '04-market.png'), 
        type: 'png',
        fullPage: true 
      });
    } catch (error) {
      console.warn('Could not navigate to Market view:', error.message);
    }
    
    // 5. Try to navigate to Create
    console.log('📸 Navigating to Create view...');
    try {
      const navButtons = await page.$$('nav button');
      if (navButtons.length > 4) {
        await navButtons[4].click();
        await delay(2000);
      }
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, '05-create.png'), 
        type: 'png',
        fullPage: true 
      });
    } catch (error) {
      console.warn('Could not navigate to Create view:', error.message);
    }
    
    // 6. Mobile responsive view
    console.log('📸 Capturing mobile responsive view...');
    await page.setViewport({ width: 375, height: 812 });
    await delay(1000);
    
    // Go back to dashboard for mobile view
    await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '06-mobile-dashboard.png'), 
      type: 'png',
      fullPage: true 
    });
    
    console.log('✅ Screenshot capture completed!');
    
  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
}

// Run the screenshot capture
captureScreenshots().then(() => {
  console.log('📋 Screenshot Summary:');
  console.log('  01-dashboard.png - Main dashboard view');
  console.log('  02-narratives.png - Narratives marketplace');
  console.log('  03-staking.png - Staking management');
  console.log('  04-market.png - Market analytics');
  console.log('  05-create.png - Narrative creation');
  console.log('  06-mobile-dashboard.png - Mobile responsive view');
  console.log('🎉 Screenshot capture completed!');
}).catch(console.error);