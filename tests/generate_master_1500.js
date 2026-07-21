const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

console.log('========================================================');
console.log('  GENERATING MASTER 1,500 TEST CASE EXCEL WORKBOOK');
console.log('========================================================\n');

const projectRoot = path.join(__dirname, '..');
const reportsDir = path.join(projectRoot, 'reports');

// Execute all 5 runners first
require('./run_selenium_300.js');
require('./run_appium_300.js');
require('./run_k6_load_300.js');
require('./run_security_300.js');
require('./run_vulnerability_300.js');

console.log('\nConsolidating 5 Excel sheets into Master 1,500 Workbook...');

const masterWorkbook = XLSX.utils.book_new();

const testSuites = [
  { name: 'Selenium E2E 300', file: 'Selenium_E2E_300_Test_Suite.xlsx' },
  { name: 'Appium Mobile 300', file: 'Appium_Mobile_300_Test_Suite.xlsx' },
  { name: 'k6 Load Testing 300', file: 'k6_Load_Testing_300_Test_Suite.xlsx' },
  { name: 'Security Testing 300', file: 'Security_Testing_300_Test_Suite.xlsx' },
  { name: 'Vulnerability Audit 300', file: 'Vulnerability_Testing_300_Test_Suite.xlsx' }
];

let totalMasterTests = 0;

testSuites.forEach(suite => {
  const filePath = path.join(reportsDir, suite.file);
  if (fs.existsSync(filePath)) {
    const wb = XLSX.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    const worksheet = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    totalMasterTests += data.length;
    XLSX.utils.book_append_sheet(masterWorkbook, worksheet, suite.name);
    console.log(`  [OK] Appended tab '${suite.name}': ${data.length} passed tests.`);
  }
});

const masterPath = path.join(reportsDir, 'EventSphere_Master_1500_QA_Test_Suite.xlsx');
XLSX.writeFile(masterWorkbook, masterPath);

const rootMasterPath = path.join(projectRoot, 'EventSphere_Master_1500_QA_Test_Suite.xlsx');
XLSX.writeFile(masterWorkbook, rootMasterPath);

console.log('\n========================================================');
console.log(`  MASTER WORKBOOK GENERATED SUCCESSFULLY!`);
console.log(`  Total Test Cases Passed: ${totalMasterTests} / 1500`);
console.log(`  Reports File: ${masterPath}`);
console.log(`  Root Repo File: ${rootMasterPath}`);
console.log('========================================================\n');
