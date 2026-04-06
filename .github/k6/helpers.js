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
  const res = http.post(endpoints.login, { email, password }, {
    redirects: 0,
    tags: { name: "login" },
  });

  if (res.status !== 200) {
    console.error(
      `Login failed: status=${res.status}, body=${res.body}, email=${email}`,
    );
  }

  check(res, {
    "login succeeded": (r) => r.status === 200,
  });
}

const apiParams = { tags: { name: "api" } };

export function makeRequests() {
  // Health
  const healthResponse = http.get(endpoints.health, apiParams);
  check(healthResponse, {
    "health status 200": (r) => r.status === 200,
  });

  // Current user profile
  const userResponse = http.get(endpoints.currentUser, apiParams);
  check(userResponse, {
    "current user status 200": (r) => r.status === 200,
  });

  // Grants list
  const grantsResponse = http.get(`${endpoints.grants}?page=1&per_page=10`, apiParams);
  check(grantsResponse, {
    "grants status 200": (r) => r.status === 200,
  });

  // Grant detail
  const grantDetailResponse = http.get(endpoints.grantDetail, apiParams);
  check(grantDetailResponse, {
    "grant detail status 200": (r) => r.status === 200,
  });

  // Awards list
  const awardsResponse = http.get(`${endpoints.awards}?page=1&per_page=10`, apiParams);
  check(awardsResponse, {
    "awards status 200": (r) => r.status === 200,
  });

  // Award detail
  const awardDetailResponse = http.get(endpoints.awardDetail, apiParams);
  check(awardDetailResponse, {
    "award detail status 200": (r) => r.status === 200,
  });

  // My applications
  const appsResponse = http.get(endpoints.myApplications, apiParams);
  check(appsResponse, {
    "my applications status 200": (r) => r.status === 200,
  });

  // All applications (admin)
  const allAppsResponse = http.get(endpoints.applications, apiParams);
  check(allAppsResponse, {
    "all applications status 200": (r) => r.status === 200,
  });

  // Audit log (admin)
  const auditResponse = http.get(endpoints.audit, apiParams);
  check(auditResponse, {
    "audit status 200": (r) => r.status === 200,
  });

  // Failed audit log (admin)
  const auditFailedResponse = http.get(endpoints.auditFailed, apiParams);
  check(auditFailedResponse, {
    "audit failed status 200": (r) => r.status === 200,
  });

  // Support messages
  const supportResponse = http.get(endpoints.support, apiParams);
  check(supportResponse, {
    "support status 200": (r) => r.status === 200,
  });
}
