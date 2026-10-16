import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const BROWSER_CANDIDATES = [
  path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
const CHROME_PATH = BROWSER_CANDIDATES.find((p) => p && fs.existsSync(p)) || 'chrome';
const TARGET_URL = 'http://localhost:5173';

async function testCreateFollowUp() {
  console.log('Testing Create Follow-up Flow for Sales Representative...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1366, height: 768 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', text);
      consoleErrors.push(text);
    } else {
      console.log(`[${msg.type()}]`, text);
    }
  });

  page.on('pageerror', (err) => {
    console.log('PAGE ERROR (UNCAUGHT):', err.message);
    consoleErrors.push(err.message);
  });

  page.on('response', (res) => {
    if (res.status() >= 400) {
      console.log(`NETWORK ERROR: ${res.status()} ${res.url()}`);
      networkErrors.push(`${res.status()} ${res.url()}`);
    }
  });

  try {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 15000 });

    // 1. Log in as Sales Rep
    console.log('Logging in as Sales Rep...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const salesBtn = buttons.find(b => b.textContent && (b.textContent.includes('Sales Rep') || b.textContent.includes('Salesman')));
      if (salesBtn) salesBtn.click();
    });

    await new Promise(r => setTimeout(r, 2000));
    console.log('Current URL after login:', page.url());

    // 2. Navigate to /sales/follow-ups
    console.log('Navigating to Follow-ups page...');
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('button, a'));
      const fuLink = links.find(l => l.textContent && l.textContent.trim() === 'Follow-ups');
      if (fuLink) fuLink.click();
    });

    await new Promise(r => setTimeout(r, 2000));
    console.log('Current URL after Follow-ups click:', page.url());

    // 3. Click "Add Follow-up" button
    console.log('Clicking "Add Follow-up" button...');
    const scheduleBtnClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('Add Follow-up'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    console.log('Add Follow-up button clicked:', scheduleBtnClicked);
    await new Promise(r => setTimeout(r, 1000));

    // 4. Fill form details
    console.log('Filling out follow-up form...');
    await page.evaluate(() => {
      const setReactValue = (input, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      };

      const setReactTextArea = (input, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        setter.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      };

      // Reason input inside the modal form
      const modal = document.querySelector('form');
      const inputs = Array.from(modal ? modal.querySelectorAll('input[type="text"]') : []);
      const reasonInput = inputs[0];
      if (reasonInput) {
        setReactValue(reasonInput, 'Winter Leather Boots Pre-order & Cheque Collection');
      }

      // Notes textarea
      const textarea = modal ? modal.querySelector('textarea') : document.querySelector('textarea');
      if (textarea) {
        setReactTextArea(textarea, 'Present new sample catalog and confirm 25-carton booking with 30% advance.');
      }
    });

    await new Promise(r => setTimeout(r, 600));

    // 5. Submit form
    console.log('Submitting the Follow-up form...');
    await page.evaluate(() => {
      const modal = document.querySelector('form');
      if (modal) {
        const submitBtn = modal.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.click();
        }
      }
    });

    await new Promise(r => setTimeout(r, 2500));

    // 6. Inspect page content
    const pageResult = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return {
        hasNewFollowupTitle: bodyText.includes('Winter Leather Boots Pre-order & Cheque Collection'),
        bodySnippet: bodyText.slice(bodyText.indexOf('Follow-ups & Buyer Reminders'), bodyText.indexOf('Follow-ups & Buyer Reminders') + 800)
      };
    });

    console.log('Follow-up creation page result:', pageResult);
    console.log('Console Errors:', consoleErrors);
    console.log('Network Errors:', networkErrors);

  } finally {
    await browser.close();
  }
}

testCreateFollowUp().catch(console.error);
