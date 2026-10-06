import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = process.argv[2] || 'http://localhost:3000';
const SCREENSHOT_DIR = path.resolve('./browser-qa-screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runBrowserUserTest() {
  console.log('='.repeat(75));
  console.log('🌐 STARTING CHROME USER SIMULATION & ERROR HUNTING TEST');
  console.log(`URL: ${TARGET_URL}`);
  console.log('='.repeat(75));

  const consoleLogs = [];
  const consoleErrors = [];
  const networkErrors = [];
  const testFindings = [];

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new', // Use new headless mode for accuracy
    defaultViewport: { width: 1366, height: 768 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // Listen to console messages
  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push(`[${type.toUpperCase()}] ${text}`);
    if (type === 'error') {
      consoleErrors.push(text);
      console.log(`❌ Console Error: ${text}`);
    }
  });

  // Listen to page errors (unhandled JS errors)
  page.on('pageerror', (err) => {
    consoleErrors.push(`[PAGE ERROR] ${err.toString()}`);
    console.log(`🔥 Unhandled Exception: ${err.message}`);
  });

  // Listen to failed network requests
  page.on('response', (res) => {
    const status = res.status();
    const url = res.url();
    if (status >= 400) {
      networkErrors.push({ status, url });
      console.log(`⚠️ Network ${status}: ${url}`);
    }
  });

  async function step(name, actionFn) {
    console.log(`\n▶️ [STEP] ${name}...`);
    try {
      await actionFn();
      testFindings.push({ step: name, status: 'PASS' });
      console.log(`  ✅ ${name} completed successfully.`);
    } catch (err) {
      testFindings.push({ step: name, status: 'FAIL', error: err.message });
      console.error(`  ❌ ${name} failed:`, err.message);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `FAIL_${name.replace(/[^a-zA-Z0-9]/g, '_')}.png`) });
    }
  }

  try {
    // 1. Visit Landing Page
    await step('1. Load Landing Page', async () => {
      await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_landing_page.png') });
      const title = await page.title();
      console.log(`  Page Title: "${title}"`);
    });

    // 2. Explore Landing Page Interactive Elements
    await step('2. Interact with Landing Page CTAs', async () => {
      // Look for CTA button: "Open SoleFlow Web App" or "Launch Web App" or "Sign In"
      const buttons = await page.$$eval('button, a', (els) =>
        els.map((el) => ({ text: el.innerText.trim(), href: el.getAttribute('href') }))
      );
      console.log(`  Found ${buttons.length} clickable elements on landing page.`);
      
      // Click "Launch Web App" or primary CTA
      const launched = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button, a'));
        const target = btns.find((b) => 
          b.innerText.toLowerCase().includes('open soleflow') || 
          b.innerText.toLowerCase().includes('launch') ||
          b.innerText.toLowerCase().includes('login') ||
          b.innerText.toLowerCase().includes('sign in') ||
          b.innerText.toLowerCase().includes('get started')
        );
        if (target) {
          target.click();
          return target.innerText;
        }
        return null;
      });

      console.log(`  Clicked CTA: "${launched}"`);
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_after_landing_cta.png') });
    });

    // 3. Check Auth Modal or Auth Screen
    await step('3. Inspect Auth & Demo Login Flow', async () => {
      // Find Quick Demo or Login buttons
      const demoBtnText = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const demoBtn = btns.find(b => 
          b.innerText.toLowerCase().includes('admin demo') || 
          b.innerText.toLowerCase().includes('quick demo') ||
          b.innerText.toLowerCase().includes('trader admin') ||
          b.innerText.toLowerCase().includes('try demo') ||
          b.innerText.toLowerCase().includes('demo')
        );
        if (demoBtn) {
          demoBtn.click();
          return demoBtn.innerText;
        }
        return null;
      });

      console.log(`  Demo Trigger clicked: "${demoBtnText}"`);
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_dashboard_loaded.png') });
    });

    // 4. Test Navigation to Dashboard Tabs
    await step('4. Explore Navigation & Dashboard Views', async () => {
      const currentUrl = page.url();
      console.log(`  Current View URL: ${currentUrl}`);

      // Check key metrics on the page
      const metrics = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div')).filter(d => 
          d.innerText.includes('₹') || d.innerText.includes('Orders') || d.innerText.includes('Customers')
        );
        return cards.slice(0, 5).map(c => c.innerText.slice(0, 60));
      });
      console.log('  Metrics preview:', metrics.length > 0 ? 'Cards found' : 'No metric cards found');
    });

    // 5. Test Customer Module
    await step('5. Test Customers Section', async () => {
      // Click Customers in sidebar or nav
      await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('button, a'));
        const custTab = links.find(l => l.innerText.trim().toLowerCase() === 'customers' || l.innerText.trim().toLowerCase().includes('customers'));
        if (custTab) custTab.click();
      });

      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_customers_view.png') });

      // Check search filter input
      const searchBox = await page.$('input[placeholder*="Search" i], input[placeholder*="customer" i]');
      if (searchBox) {
        await searchBox.type('Agra');
        await new Promise(r => setTimeout(r, 1000));
        console.log('  Customer search query applied.');
      }
    });

    // 6. Test Orders Module
    await step('6. Test Orders Section', async () => {
      await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('button, a'));
        const ordersTab = links.find(l => l.innerText.trim().toLowerCase() === 'orders' || l.innerText.trim().toLowerCase().includes('orders'));
        if (ordersTab) ordersTab.click();
      });

      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_orders_view.png') });
    });

    // 7. Test Field Visits / Check-in
    await step('7. Test Field Visits Section', async () => {
      await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('button, a'));
        const visitsTab = links.find(l => l.innerText.trim().toLowerCase().includes('visit') || l.innerText.trim().toLowerCase().includes('field'));
        if (visitsTab) visitsTab.click();
      });

      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_field_visits_view.png') });
    });

    // 8. Test Payments & Collections & Record Payment Flow
    await step('8. Test Payments Section & Record Payment Modal', async () => {
      await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('button, a'));
        const payTab = links.find(l => l.innerText.trim().toLowerCase().includes('payment') || l.innerText.trim().toLowerCase().includes('collection'));
        if (payTab) payTab.click();
      });

      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_payments_view.png') });

      // Click "Record Payment" button
      const openedModal = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const recordBtn = btns.find(b => b.innerText.toLowerCase().includes('record payment') || b.innerText.toLowerCase().includes('collect payment'));
        if (recordBtn) {
          recordBtn.click();
          return true;
        }
        return false;
      });

      console.log(`  Record Payment Modal trigger: ${openedModal ? 'Clicked' : 'Not found'}`);
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_record_payment_modal.png') });
    });

    // 9. Test Deep Page Refresh URL Persistence
    await step('9. Test Browser Page Refresh on Current Route', async () => {
      const preRefreshUrl = page.url();
      console.log(`  URL before refresh: ${preRefreshUrl}`);
      await page.reload({ waitUntil: 'networkidle2', timeout: 20000 });
      await new Promise(r => setTimeout(r, 2000));
      const postRefreshUrl = page.url();
      console.log(`  URL after refresh: ${postRefreshUrl}`);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_after_refresh.png') });
    });

  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n' + '='.repeat(75));
  console.log('📊 USER SIMULATION & ERROR SCAN COMPLETE');
  console.log('='.repeat(75));
  console.log(`Total Steps: ${testFindings.length}`);
  console.log(`Total Console Errors: ${consoleErrors.length}`);
  console.log(`Total Network Failures: ${networkErrors.length}`);
  
  if (consoleErrors.length > 0) {
    console.log('\n--- Console Errors Encountered ---');
    consoleErrors.forEach((e, idx) => console.log(`${idx + 1}. ${e}`));
  }

  if (networkErrors.length > 0) {
    console.log('\n--- Network 4xx/5xx Errors Encountered ---');
    networkErrors.forEach((n, idx) => console.log(`${idx + 1}. [${n.status}] ${n.url}`));
  }

  console.log('='.repeat(75));
}

runBrowserUserTest().catch(console.error);
