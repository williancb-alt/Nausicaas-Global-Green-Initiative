// Define constants for the base url and API structure
const BASE_URL =
  __ENV.BASE_URL || "https://api-staging.nausicaaglobalgreeninitiative.ie";
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
      // API endpoints (excluding login) should respond within 1500ms
      "http_req_duration{name!='login'}": ["p(99)<1500"],
      // Login has its own relaxed threshold of 3000ms
      "http_req_duration{name:'login'}": ["p(99)<3000"],
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
      // API endpoints (excluding login)
      "http_req_duration{name!='login'}": ["p(95)<500", "p(99)<1500"],
      // Login has its own relaxed threshold of 2000ms for 95% of requests
      "http_req_duration{name:'login'}": ["p(95)<2000", "p(99)<5000"],
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
      // API endpoints (excluding login)
      "http_req_duration{name!='login'}": ["p(95)<1000", "p(99)<3000"],
      // Login has its own relaxed threshold of 3000ms for 95% of requests
      // and 5000ms for 99% of requests, since it may be slower under load
      "http_req_duration{name:'login'}": ["p(95)<3000", "p(99)<5000"],
      // Less than 5% of requests should fail
      http_req_failed: ["rate<0.05"],
    },
  };
}
