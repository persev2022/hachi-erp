/**
 * Hachi Platform — Load Test (k6)
 *
 * Run with: k6 run e2e/load-test.js
 * Install k6: brew install k6
 *
 * Targets:
 * - Sustain 100 req/s for 30 seconds
 * - p95 response time < 500ms
 * - Error rate < 1%
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");

export const options = {
  stages: [
    { duration: "10s", target: 50 },   // Ramp up to 50 users
    { duration: "30s", target: 100 },  // Sustain 100 users
    { duration: "10s", target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],  // 95% of requests under 500ms
    errors: ["rate<0.01"],             // Error rate below 1%
  },
};

const BASE_URL = __ENV.BASE_URL || "https://hachi-erp.vercel.app";

// Login and get session cookie
function login() {
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: "admin@hachi.com",
    password: "Admin@2026",
  }), {
    headers: { "Content-Type": "application/json" },
  });

  const cookies = res.cookies;
  return cookies["session-token"] ? cookies["session-token"][0].value : null;
}

export function setup() {
  // Login once and return the session token
  const res = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: "admin@hachi.com",
    password: "Admin@2026",
  }), {
    headers: { "Content-Type": "application/json" },
  });

  const cookies = res.cookies;
  const token = cookies["session-token"] ? cookies["session-token"][0].value : "";
  return { token };
}

export default function (data) {
  const params = {
    headers: { "Content-Type": "application/json" },
    cookies: { "session-token": data.token },
  };

  // Mix of API endpoints simulating real usage
  const endpoints = [
    { url: `${BASE_URL}/api/relatorios/dashboard`, weight: 30 },
    { url: `${BASE_URL}/api/pacientes?page=1&pageSize=20`, weight: 25 },
    { url: `${BASE_URL}/api/agenda?data=${new Date().toISOString().split("T")[0]}`, weight: 20 },
    { url: `${BASE_URL}/api/platform`, weight: 15 },
    { url: `${BASE_URL}/api/auth/me`, weight: 10 },
  ];

  // Weighted random selection
  const totalWeight = endpoints.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * totalWeight;
  let selected = endpoints[0];

  for (const endpoint of endpoints) {
    random -= endpoint.weight;
    if (random <= 0) {
      selected = endpoint;
      break;
    }
  }

  const res = http.get(selected.url, params);

  const success = check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
    "response has body": (r) => r.body && r.body.length > 0,
  });

  errorRate.add(!success);

  sleep(0.1); // 100ms between requests per VU
}
