// Define constants for the base url and API structure
const BASE_URL = (
  __ENV.BASE_URL || "https://api-staging.nausicaaglobalgreeninitiative.ie"
).replace(/\/+$/, "");
const API = `${BASE_URL}/api/v1`;

// This class is where all configuration for k6 is stored
export class K6Config {
  static baseUrl = BASE_URL;

  static endpoints = {
    health: `${BASE_URL}/health`,
    login: `${API}/auth/login`,
    currentUser: `${API}/auth/user`,
    grants: `${API}/grants`,
    grantDetail: `${API}/grants/${encodeURIComponent("Teto Grant")}`,
    awards: `${API}/awards`,
    awardDetail: `${API}/awards/${encodeURIComponent("Nausicaä Sustainability Award 2026")}`,
    applications: `${API}/applications`,
    myApplications: `${API}/applications/me`,
    audit: `${API}/audit`,
    auditFailed: `${API}/audit/failed`,
    support: `${API}/support`,
  };

  static smoke = {
    // Run with 1 user for 30 seconds
    vus: 1,
    duration: "30s",
    thresholds: {
      // API endpoints should respond within 1500ms
      "http_req_duration{name:api}": ["p(99)<1500"],
      // Login has its own relaxed threshold of 3000ms
      "http_req_duration{name:login}": ["p(99)<3000"],
      // Less than 1% of requests should fail
      http_req_failed: ["rate<0.01"],
    },
  };

  static load = {
    // Load up to 50 users over 1 minute,
    // hold for 3 minutes, then lessen amount of users
    stages: [
      { duration: "1m", target: 50 },
      { duration: "3m", target: 50 },
      { duration: "1m", target: 0 },
    ],
    thresholds: {
      // API endpoints (p95 accounts for scale-up latency in pods)
      "http_req_duration{name:api}": ["p(95)<3000", "p(99)<6000"],
      // Login is slower under load due to bcrypt hashing
      "http_req_duration{name:login}": ["p(95)<10000", "p(99)<15000"],
      // Less than 1% of requests should fail
      http_req_failed: ["rate<0.01"],
    },
  };

  static stress = {
    // Start with 100 users, increase
    // to 200, then back down to 0 over 12 minutes
    stages: [
      { duration: "2m", target: 100 },
      { duration: "3m", target: 100 },
      { duration: "2m", target: 200 },
      { duration: "3m", target: 200 },
      { duration: "2m", target: 0 },
    ],
    thresholds: {
      // API endpoints (higher tolerance under extreme request load)
      "http_req_duration{name:api}": ["p(95)<5000", "p(99)<10000"],
      // Login is CPU-bound (bcrypt) and crashes under extreme load
      "http_req_duration{name:login}": ["p(95)<10000", "p(99)<15000"],
      // Less than 10% of requests should fail
      http_req_failed: ["rate<0.10"],
    },
  };
}
