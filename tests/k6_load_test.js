import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 10 },
    { duration: '10s', target: 10 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // HTTP failure rate should be less than 5%
    http_req_duration: ['p(95)<1000'], // 95% of requests must respond within 1000ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8081';

const routes = [
  '/',
  '/login',
  '/signup',
  '/dashboard',
  '/create',
  '/admin',
  '/search/categories',
  '/search/calendar',
  '/search/filters',
  '/search/free-events',
  '/search/map',
  '/search/nearby',
  '/search/online-events',
  '/search/saved-events',
  '/search/trending',
  '/checkout/select-tickets',
  '/checkout/billing-details',
  '/checkout/payment-method',
  '/checkout/card-input',
  '/checkout/upi-sim',
  '/checkout/success',
  '/checkout/failed',
  '/organizer/analytics',
  '/organizer/dashboard',
  '/organizer/payouts',
  '/organizer/promocodes'
];

export default function () {
  const route = routes[Math.floor(Math.random() * routes.length)];
  const url = `${BASE_URL.replace(/\/$/, '')}${route}`;

  const res = http.get(url);

  check(res, {
    'status is 200 or 304': (r) => r.status === 200 || r.status === 304,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(0.1);
}
