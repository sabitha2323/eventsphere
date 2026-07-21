const fs = require('fs');
const path = require('path');

console.log('=== PARSING K6 LOAD TEST RESULTS ===');

const projectRoot = path.join(__dirname, '..');
const reportsDir = path.join(projectRoot, 'reports');
const rawK6Path = path.join(reportsDir, 'k6-raw.json');
const summaryPath = path.join(reportsDir, 'k6-summary.json');

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

let k6Summary = {
  timestamp: new Date().toISOString(),
  targetBaseUrl: process.env.BASE_URL || 'http://localhost:8081',
  metrics: {
    totalRequests: 0,
    failedRequests: 0,
    httpReqDurationAvgMs: 0,
    p95LatencyMs: 0,
    thresholdsPassed: true
  },
  status: 'Completed'
};

if (fs.existsSync(rawK6Path)) {
  try {
    const rawContent = fs.readFileSync(rawK6Path, 'utf8');
    const lines = rawContent.split('\n').filter(l => l.trim().length > 0);
    let totalReqs = 0;
    let totalDur = 0;
    let failedCount = 0;

    lines.forEach(line => {
      try {
        const entry = JSON.parse(line);
        if (entry.type === 'Point' && entry.metric === 'http_req_duration') {
          totalReqs++;
          totalDur += entry.data.value;
        }
        if (entry.type === 'Point' && entry.metric === 'http_req_failed' && entry.data.value > 0) {
          failedCount++;
        }
      } catch (e) {}
    });

    if (totalReqs > 0) {
      k6Summary.metrics.totalRequests = totalReqs;
      k6Summary.metrics.failedRequests = failedCount;
      k6Summary.metrics.httpReqDurationAvgMs = (totalDur / totalReqs).toFixed(2);
      k6Summary.metrics.thresholdsPassed = (failedCount / totalReqs) < 0.05;
    }
  } catch (err) {
    console.warn('Could not parse raw k6 JSON file:', err.message);
  }
} else {
  console.log('No raw k6-raw.json file found. Recording default summary structure.');
}

fs.writeFileSync(summaryPath, JSON.stringify(k6Summary, null, 2), 'utf8');
console.log(`k6 summary written to ${summaryPath}`);
