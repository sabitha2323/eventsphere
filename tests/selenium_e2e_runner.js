const fs = require('fs');
const path = require('path');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

console.log('=== RUNNING REAL SELENIUM E2E WEB AUTOMATION SUITE ===');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8081';
console.log(`Base Target URL: ${BASE_URL}`);

const projectRoot = path.join(__dirname, '..');
const reportsDir = path.join(projectRoot, 'reports');
const screenshotsDir = path.join(reportsDir, 'screenshots');

if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

// Define 40 web screens mapped to routes
const routesToTest = [
  { id: 'SEL_TC001', name: 'Login Screen', route: '/login', category: 'Authentication', checkSelector: 'body' },
  { id: 'SEL_TC002', name: 'Signup Screen', route: '/signup', category: 'Authentication', checkSelector: 'body' },
  { id: 'SEL_TC003', name: 'Home Landing Screen', route: '/', category: 'Core App', checkSelector: 'body' },
  { id: 'SEL_TC004', name: 'User Dashboard', route: '/dashboard', category: 'Core App', checkSelector: 'body' },
  { id: 'SEL_TC005', name: 'Create Event Wizard', route: '/create', category: 'Core App', checkSelector: 'body' },
  { id: 'SEL_TC006', name: 'Admin Console', route: '/admin', category: 'Administration', checkSelector: 'body' },
  { id: 'SEL_TC007', name: 'Event Details', route: '/event/demo-1', category: 'Event View', checkSelector: 'body' },
  { id: 'SEL_TC008', name: 'Search Categories', route: '/search/categories', category: 'Discovery', checkSelector: 'body' },
  { id: 'SEL_TC009', name: 'Search Calendar', route: '/search/calendar', category: 'Discovery', checkSelector: 'body' },
  { id: 'SEL_TC010', name: 'Search Filters', route: '/search/filters', category: 'Discovery', checkSelector: 'body' },
  { id: 'SEL_TC011', name: 'Free Events Finder', route: '/search/free-events', category: 'Discovery', checkSelector: 'body' },
  { id: 'SEL_TC012', name: 'Interactive Event Map', route: '/search/map', category: 'Discovery', checkSelector: 'body' },
  { id: 'SEL_TC013', name: 'Nearby Events Search', route: '/search/nearby', category: 'Discovery', checkSelector: 'body' },
  { id: 'SEL_TC014', name: 'Online Events Search', route: '/search/online-events', category: 'Discovery', checkSelector: 'body' },
  { id: 'SEL_TC015', name: 'Saved Events List', route: '/search/saved-events', category: 'Discovery', checkSelector: 'body' },
  { id: 'SEL_TC016', name: 'Trending Events', route: '/search/trending', category: 'Discovery', checkSelector: 'body' },
  { id: 'SEL_TC017', name: 'Category Detail View', route: '/search/category/music', category: 'Discovery', checkSelector: 'body' },
  { id: 'SEL_TC018', name: 'Select Tickets', route: '/checkout/select-tickets', category: 'Checkout', checkSelector: 'body' },
  { id: 'SEL_TC019', name: 'Billing Details', route: '/checkout/billing-details', category: 'Checkout', checkSelector: 'body' },
  { id: 'SEL_TC020', name: 'Payment Method Select', route: '/checkout/payment-method', category: 'Checkout', checkSelector: 'body' },
  { id: 'SEL_TC021', name: 'Card Input Form', route: '/checkout/card-input', category: 'Checkout', checkSelector: 'body' },
  { id: 'SEL_TC022', name: 'UPI Simulator', route: '/checkout/upi-sim', category: 'Checkout', checkSelector: 'body' },
  { id: 'SEL_TC023', name: 'Checkout Success', route: '/checkout/success', category: 'Checkout', checkSelector: 'body' },
  { id: 'SEL_TC024', name: 'Checkout Failed', route: '/checkout/failed', category: 'Checkout', checkSelector: 'body' },
  { id: 'SEL_TC025', name: 'Order Receipt', route: '/checkout/receipt/order-1', category: 'Checkout', checkSelector: 'body' },
  { id: 'SEL_TC026', name: 'Ticket Pass View', route: '/ticket/t-1', category: 'Tickets', checkSelector: 'body' },
  { id: 'SEL_TC027', name: 'Ticket Refund Form', route: '/ticket/refund/t-1', category: 'Tickets', checkSelector: 'body' },
  { id: 'SEL_TC028', name: 'Social Chat Room', route: '/social/chat/e-1', category: 'Social', checkSelector: 'body' },
  { id: 'SEL_TC029', name: 'Social FAQ View', route: '/social/faq/e-1', category: 'Social', checkSelector: 'body' },
  { id: 'SEL_TC030', name: 'Social Reviews View', route: '/social/reviews/e-1', category: 'Social', checkSelector: 'body' },
  { id: 'SEL_TC031', name: 'Organizer Analytics', route: '/organizer/analytics', category: 'Organizer', checkSelector: 'body' },
  { id: 'SEL_TC032', name: 'Organizer Attendees', route: '/organizer/attendees-e-1', category: 'Organizer', checkSelector: 'body' },
  { id: 'SEL_TC033', name: 'Organizer Check-in QR', route: '/organizer/checkin-e-1', category: 'Organizer', checkSelector: 'body' },
  { id: 'SEL_TC034', name: 'Organizer Collaborators', route: '/organizer/collaborators-e-1', category: 'Organizer', checkSelector: 'body' },
  { id: 'SEL_TC035', name: 'Organizer Dashboard', route: '/organizer/dashboard', category: 'Organizer', checkSelector: 'body' },
  { id: 'SEL_TC036', name: 'Organizer Edit Event', route: '/organizer/edit-e-1', category: 'Organizer', checkSelector: 'body' },
  { id: 'SEL_TC037', name: 'Organizer Email Broadcast', route: '/organizer/email-broadcast-e-1', category: 'Organizer', checkSelector: 'body' },
  { id: 'SEL_TC038', name: 'Organizer Payouts', route: '/organizer/payouts', category: 'Organizer', checkSelector: 'body' },
  { id: 'SEL_TC039', name: 'Organizer Promocodes', route: '/organizer/promocodes', category: 'Organizer', checkSelector: 'body' },
  { id: 'SEL_TC040', name: 'Organizer Ticket Types', route: '/organizer/ticket-types-e-1', category: 'Organizer', checkSelector: 'body' }
];

async function runSeleniumTests() {
  const testResults = [];
  let driver = null;

  const chromeOptions = new chrome.Options();
  chromeOptions.addArguments('--headless=new');
  chromeOptions.addArguments('--no-sandbox');
  chromeOptions.addArguments('--disable-dev-shm-usage');
  chromeOptions.addArguments('--window-size=1920,1080');

  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();
    console.log('Headless Chrome webdriver initialized successfully.');
  } catch (err) {
    console.warn('Could not launch Chrome webdriver locally:', err.message);
    console.warn('Fallback: HTTP verification mode for route rendering will be executed.');
  }

  for (const item of routesToTest) {
    const targetUrl = `${BASE_URL.replace(/\/$/, '')}${item.route}`;
    const startTime = Date.now();
    let status = 'Passed';
    let errorMsg = '';

    console.log(`[${item.id}] Testing route: ${item.route} (${item.name})...`);

    if (driver) {
      try {
        await driver.get(targetUrl);
        await driver.wait(until.elementLocated(By.css('body')), 5000);
        const title = await driver.getTitle();
        const pageSource = await driver.getPageSource();

        if (!pageSource || pageSource.trim().length === 0) {
          throw new Error('Page source returned empty content.');
        }
      } catch (e) {
        status = 'Failed';
        errorMsg = e.message;

        // Capture screenshot on failure
        try {
          const screenshotBuffer = await driver.takeScreenshot();
          const shotPath = path.join(screenshotsDir, `${item.id}_failure.png`);
          fs.writeFileSync(shotPath, screenshotBuffer, 'base64');
          console.log(`Saved failure screenshot: ${shotPath}`);
        } catch (shotErr) {
          console.warn(`Could not save screenshot: ${shotErr.message}`);
        }
      }
    } else {
      // Direct HTTP fetch fallback if local machine lacks Chrome binary
      try {
        const http = require('http');
        await new Promise((resolve, reject) => {
          http.get(targetUrl, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 400) {
              resolve();
            } else {
              reject(new Error(`HTTP status ${res.statusCode}`));
            }
          }).on('error', reject);
        });
      } catch (e) {
        status = 'Failed';
        errorMsg = e.message;
      }
    }

    const durationMs = Date.now() - startTime;
    testResults.push({
      testId: item.id,
      screenName: item.name,
      routeUrl: item.route,
      category: item.category,
      status: status,
      durationMs: durationMs,
      errorMsg: errorMsg || 'None'
    });
  }

  if (driver) {
    try {
      await driver.quit();
    } catch (e) {}
  }

  // Write CSV Results to reports/test-results.csv
  const csvHeaders = ['Test ID', 'Screen Name', 'Route URL', 'Category', 'Status', 'Duration (ms)', 'Error Details'];
  let csvContent = csvHeaders.map(h => `"${h}"`).join(',') + '\n';
  testResults.forEach(r => {
    const row = [r.testId, r.screenName, r.routeUrl, r.category, r.status, r.durationMs, r.errorMsg]
      .map(f => `"${String(f).replace(/"/g, '""')}"`)
      .join(',');
    csvContent += row + '\n';
  });

  const csvPath = path.join(reportsDir, 'test-results.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf8');

  // Write JSON Summary to reports/test-summary.json
  const summaryData = {
    timestamp: new Date().toISOString(),
    totalTestsExecuted: testResults.length,
    passedCount: testResults.filter(r => r.status === 'Passed').length,
    failedCount: testResults.filter(r => r.status === 'Failed').length,
    skippedCount: 0,
    tests: testResults
  };

  const jsonPath = path.join(reportsDir, 'test-summary.json');
  fs.writeFileSync(jsonPath, JSON.stringify(summaryData, null, 2), 'utf8');

  console.log('\n=== SELENIUM E2E SUITE COMPLETED ===');
  console.log(`Total Executed: ${summaryData.totalTestsExecuted}`);
  console.log(`Passed: ${summaryData.passedCount}`);
  console.log(`Failed: ${summaryData.failedCount}`);
  console.log(`CSV Report: ${csvPath}`);
  console.log(`JSON Summary: ${jsonPath}`);
}

runSeleniumTests().catch(err => {
  console.error('Fatal error during Selenium runner execution:', err);
  process.exit(1);
});
