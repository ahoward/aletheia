/**
 * Comprehensive screenshot capture for Aletheia application
 * Captures all major views and features
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureAppScreenshots() {
  console.log('🚀 Starting comprehensive Aletheia screenshot capture...');
  
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
    
    // 2. Navigate to Narratives view
    console.log('📸 Navigating to Narratives view...');
    await page.click('button:has-text("Narratives"), a:has-text("Narratives"), [data-testid="narratives-nav"]');
    await delay(2000);
    
    // Try clicking via sidebar navigation
    const narrativesButton = await page.$('nav button:nth-child(2), nav a:nth-child(2)');
    if (narrativesButton) {
      await narrativesButton.click();
      await delay(2000);
    } else {
      // Simulate navigation by clicking on sidebar
      await page.evaluate(() => {
        // Try to find and click narratives navigation
        const navButtons = document.querySelectorAll('nav button, .sidebar button');
        for (let button of navButtons) {
          if (button.textContent && button.textContent.toLowerCase().includes('narratives')) {
            button.click();
            break;
          }
        }
      });
      await delay(2000);
    }
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-narratives.png'), 
      type: 'png',
      fullPage: true 
    });
    
    // 3. Navigate to Staking view
    console.log('📸 Navigating to Staking view...');
    await page.evaluate(() => {
      const navButtons = document.querySelectorAll('nav button, .sidebar button');
      for (let button of navButtons) {
        if (button.textContent && button.textContent.toLowerCase().includes('staking')) {
          button.click();
          break;
        }
      }
    });
    await delay(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-staking.png'), 
      type: 'png',
      fullPage: true 
    });
    
    // 4. Navigate to Market view
    console.log('📸 Navigating to Market view...');
    await page.evaluate(() => {
      const navButtons = document.querySelectorAll('nav button, .sidebar button');
      for (let button of navButtons) {
        if (button.textContent && button.textContent.toLowerCase().includes('market')) {
          button.click();
          break;
        }
      }
    });
    await delay(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '04-market.png'), 
      type: 'png',
      fullPage: true 
    });
    
    // 5. Navigate to Create view
    console.log('📸 Navigating to Create view...');
    await page.evaluate(() => {
      const navButtons = document.querySelectorAll('nav button, .sidebar button');
      for (let button of navButtons) {
        if (button.textContent && button.textContent.toLowerCase().includes('create')) {
          button.click();
          break;
        }
      }
    });
    await delay(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '05-create.png'), 
      type: 'png',
      fullPage: true 
    });
    
    // 6. Mobile responsive view (Dashboard)
    console.log('📸 Capturing mobile responsive view...');
    await page.setViewport({ width: 375, height: 812 }); // iPhone X dimensions
    
    // Navigate back to dashboard for mobile view
    await page.evaluate(() => {
      const navButtons = document.querySelectorAll('nav button, .sidebar button');
      for (let button of navButtons) {
        if (button.textContent && button.textContent.toLowerCase().includes('dashboard')) {
          button.click();
          break;
        }
      }
    });
    await delay(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '06-mobile-dashboard.png'), 
      type: 'png',
      fullPage: true 
    });
    
    // 7. Desktop Header and Navigation close-up
    await page.setViewport({ width: 1920, height: 1080 });
    await delay(1000);
    
    // Capture header area specifically
    const header = await page.$('header, .header, nav');
    if (header) {
      await header.screenshot({ 
        path: path.join(screenshotsDir, '07-header-navigation.png'), 
        type: 'png'
      });
    }
    
    console.log('✅ All screenshots captured successfully!');
    
  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
}

// Run the screenshot capture
captureAppScreenshots().then(() => {
  console.log('📋 Screenshot Summary:');
  console.log('  01-dashboard.png - Main dashboard view');
  console.log('  02-narratives.png - Narratives marketplace');
  console.log('  03-staking.png - Staking management');
  console.log('  04-market.png - Market analytics');
  console.log('  05-create.png - Narrative creation');
  console.log('  06-mobile-dashboard.png - Mobile responsive view');
  console.log('  07-header-navigation.png - Header and navigation');
  console.log('🎉 Screenshot capture completed!');
}).catch(console.error);