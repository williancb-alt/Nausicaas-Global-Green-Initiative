import http from "k6/http";
import { check } from "k6";
import { K6Config } from "./config.js";

const { endpoints } = K6Config;

export function login(
  email = __ENV.TEST_USER_EMAIL,
  password = __ENV.TEST_USER_PASSWORD,
) {
  // Login — the access_token httponly cookie is automatically
  // stored in this VU's cookie jar by k6
  const res = http.post(endpoints.login, { email, password }, { redirects: 0 });

  if (res.status !== 200) {
    console.error(
      `Login failed: status=${res.status}, body=${res.body}, email=${email}`,
    );
  }

  check(res, {
    "login succeeded": (r) => r.status === 200,
  });
}

export function makeRequests() {
  // Health
  const healthResponse = http.get(endpoints.health);
  check(healthResponse, {
    "health status 200": (r) => r.status === 200,
  });

  // Current user profile
  const userResponse = http.get(endpoints.currentUser);
  check(userResponse, {
    "current user status 200": (r) => r.status === 200,
  });

  // Grants list
  const grantsResponse = http.get(`${endpoints.grants}?page=1&per_page=10`);
  check(grantsResponse, {
    "grants status 200": (r) => r.status === 200,
  });

  // Grant detail
  const grantDetailResponse = http.get(endpoints.grantDetail);
  check(grantDetailResponse, {
    "grant detail status 200": (r) => r.status === 200,
  });

  // Awards list
  const awardsResponse = http.get(`${endpoints.awards}?page=1&per_page=10`);
  check(awardsResponse, {
    "awards status 200": (r) => r.status === 200,
  });

  // Award detail
  const awardDetailResponse = http.get(endpoints.awardDetail);
  check(awardDetailResponse, {
    "award detail status 200": (r) => r.status === 200,
  });

  // My applications
  const appsResponse = http.get(endpoints.myApplications);
  check(appsResponse, {
    "my applications status 200": (r) => r.status === 200,
  });

  // All applications (admin)
  const allAppsResponse = http.get(endpoints.applications);
  check(allAppsResponse, {
    "all applications status 200": (r) => r.status === 200,
  });

  // Audit log (admin)
  const auditResponse = http.get(endpoints.audit);
  check(auditResponse, {
    "audit status 200": (r) => r.status === 200,
  });

  // Failed audit log (admin)
  const auditFailedResponse = http.get(endpoints.auditFailed);
  check(auditFailedResponse, {
    "audit failed status 200": (r) => r.status === 200,
  });

  // Support messages
  const supportResponse = http.get(endpoints.support);
  check(supportResponse, {
    "support status 200": (r) => r.status === 200,
  });
}
