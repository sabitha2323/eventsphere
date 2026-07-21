const fs = require('fs');
const path = require('path');

console.log('=== GENERATING SCREEN INVENTORY REPORT ===');

const projectRoot = path.join(__dirname, '..');
const srcAppDir = path.join(projectRoot, 'src', 'app');
const reportsDir = path.join(projectRoot, 'reports');

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// List of expected screens (including the 30 core screens and allExpo router screens)
const expectedScreens = [
  { name: 'Login Screen', expectedPath: 'src/app/(auth)/login.tsx', routeUrl: '/login' },
  { name: 'Signup Screen', expectedPath: 'src/app/(auth)/signup.tsx', routeUrl: '/signup' },
  { name: 'Home Screen', expectedPath: 'src/app/(tabs)/index.tsx', routeUrl: '/' },
  { name: 'User Dashboard', expectedPath: 'src/app/(tabs)/dashboard.tsx', routeUrl: '/dashboard' },
  { name: 'Create Event', expectedPath: 'src/app/(tabs)/create.tsx', routeUrl: '/create' },
  { name: 'Admin Console', expectedPath: 'src/app/(tabs)/admin.tsx', routeUrl: '/admin' },
  { name: 'Event Details', expectedPath: 'src/app/event/[id].tsx', routeUrl: '/event/demo-1' },
  { name: 'Search Categories', expectedPath: 'src/app/search/categories.tsx', routeUrl: '/search/categories' },
  { name: 'Search Calendar', expectedPath: 'src/app/search/calendar.tsx', routeUrl: '/search/calendar' },
  { name: 'Search Filters', expectedPath: 'src/app/search/filters.tsx', routeUrl: '/search/filters' },
  { name: 'Free Events', expectedPath: 'src/app/search/free-events.tsx', routeUrl: '/search/free-events' },
  { name: 'Event Map', expectedPath: 'src/app/search/map.tsx', routeUrl: '/search/map' },
  { name: 'Nearby Events', expectedPath: 'src/app/search/nearby.tsx', routeUrl: '/search/nearby' },
  { name: 'Online Events', expectedPath: 'src/app/search/online-events.tsx', routeUrl: '/search/online-events' },
  { name: 'Saved Events', expectedPath: 'src/app/search/saved-events.tsx', routeUrl: '/search/saved-events' },
  { name: 'Trending Events', expectedPath: 'src/app/search/trending.tsx', routeUrl: '/search/trending' },
  { name: 'Category View', expectedPath: 'src/app/search/category/[cat].tsx', routeUrl: '/search/category/music' },
  { name: 'Select Tickets', expectedPath: 'src/app/checkout/select-tickets.tsx', routeUrl: '/checkout/select-tickets' },
  { name: 'Billing Details', expectedPath: 'src/app/checkout/billing-details.tsx', routeUrl: '/checkout/billing-details' },
  { name: 'Payment Method', expectedPath: 'src/app/checkout/payment-method.tsx', routeUrl: '/checkout/payment-method' },
  { name: 'Card Input', expectedPath: 'src/app/checkout/card-input.tsx', routeUrl: '/checkout/card-input' },
  { name: 'UPI Simulator', expectedPath: 'src/app/checkout/upi-sim.tsx', routeUrl: '/checkout/upi-sim' },
  { name: 'Checkout Success', expectedPath: 'src/app/checkout/success.tsx', routeUrl: '/checkout/success' },
  { name: 'Checkout Failed', expectedPath: 'src/app/checkout/failed.tsx', routeUrl: '/checkout/failed' },
  { name: 'Order Receipt', expectedPath: 'src/app/checkout/receipt/[id].tsx', routeUrl: '/checkout/receipt/order-1' },
  { name: 'Ticket Pass', expectedPath: 'src/app/ticket/[id].tsx', routeUrl: '/ticket/t-1' },
  { name: 'Ticket Refund', expectedPath: 'src/app/ticket/refund/[id].tsx', routeUrl: '/ticket/refund/t-1' },
  { name: 'Social Chat', expectedPath: 'src/app/social/chat/[id].tsx', routeUrl: '/social/chat/e-1' },
  { name: 'Social FAQ', expectedPath: 'src/app/social/faq/[id].tsx', routeUrl: '/social/faq/e-1' },
  { name: 'Social Reviews', expectedPath: 'src/app/social/reviews/[id].tsx', routeUrl: '/social/reviews/e-1' },
  { name: 'Organizer Analytics', expectedPath: 'src/app/organizer/analytics.tsx', routeUrl: '/organizer/analytics' },
  { name: 'Organizer Attendees', expectedPath: 'src/app/organizer/attendees-[id].tsx', routeUrl: '/organizer/attendees-e-1' },
  { name: 'Organizer Check-in', expectedPath: 'src/app/organizer/checkin-[id].tsx', routeUrl: '/organizer/checkin-e-1' },
  { name: 'Organizer Collaborators', expectedPath: 'src/app/organizer/collaborators-[id].tsx', routeUrl: '/organizer/collaborators-e-1' },
  { name: 'Organizer Dashboard', expectedPath: 'src/app/organizer/dashboard.tsx', routeUrl: '/organizer/dashboard' },
  { name: 'Organizer Edit Event', expectedPath: 'src/app/organizer/edit-[id].tsx', routeUrl: '/organizer/edit-e-1' },
  { name: 'Organizer Email Broadcast', expectedPath: 'src/app/organizer/email-broadcast-[id].tsx', routeUrl: '/organizer/email-broadcast-e-1' },
  { name: 'Organizer Payouts', expectedPath: 'src/app/organizer/payouts.tsx', routeUrl: '/organizer/payouts' },
  { name: 'Organizer Promocodes', expectedPath: 'src/app/organizer/promocodes.tsx', routeUrl: '/organizer/promocodes' },
  { name: 'Organizer Ticket Types', expectedPath: 'src/app/organizer/ticket-types-[id].tsx', routeUrl: '/organizer/ticket-types-e-1' }
];

const inventory = [];

expectedScreens.forEach(screen => {
  const fullPath = path.join(projectRoot, screen.expectedPath.replace(/\//g, path.sep));
  const exists = fs.existsSync(fullPath);
  inventory.push({
    name: screen.name,
    expectedPath: screen.expectedPath,
    actualPath: exists ? screen.expectedPath : 'N/A',
    status: exists ? 'Exists' : 'Missing',
    routeUrl: screen.routeUrl
  });
});

const csvHeaders = ['Screen Name', 'Expected Path', 'Actual Path', 'Status', 'Route URL'];
let csvContent = csvHeaders.map(h => `"${h}"`).join(',') + '\n';
inventory.forEach(item => {
  const row = [
    item.name,
    item.expectedPath,
    item.actualPath,
    item.status,
    item.routeUrl
  ].map(f => `"${String(f).replace(/"/g, '""')}"`).join(',');
  csvContent += row + '\n';
});

const outputPath = path.join(reportsDir, 'screen-inventory.csv');
fs.writeFileSync(outputPath, csvContent, 'utf8');

console.log(`Screen inventory written to ${outputPath}`);
console.log(`Total screens verified: ${inventory.length}`);
console.log(`Existing screens: ${inventory.filter(i => i.status === 'Exists').length}`);
console.log(`Missing screens: ${inventory.filter(i => i.status === 'Missing').length}`);
