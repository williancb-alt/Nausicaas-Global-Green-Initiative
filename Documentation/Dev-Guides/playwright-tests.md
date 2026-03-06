# End-to-End Tests functionality

## Overview

[PlayWright](https://playwright.dev/) is the tool used for end-to-end tests in the repository. This enables realistic browser testing as the Chromium browser is spun up for each configured test as if a real-user was navigating through the appliation.

## Local Environment Setup

E2E tests can be run with the following (from root of repo).

**Note: it is important to have the app running (which will be tested via Docker)**

Which can be completed using the below command (note the test profile)

```
docker compose --profile test up --build
```

The following services are started specifically for E2E tests:

- **db-test**: A fresh PostgreSQL instance for test data, ensuring no interference with development data.
- **db-test-init**: Initialises and resets the test database before each test run, guaranteeing a clean state.
- **backend-test**: Runs the backend API in testing mode, connected to the test database.
- **frontend-test**: Runs the frontend, configured to point at the test backend.

The frontend and backend are mirrors of the local dev setup just at different ports (5174 for frontend and 8081 for backend).

This setup ensures that E2E tests are run against a clean, isolated environment, mirroring production as closely as possible without affecting your development data or services.

Then open another terminal window and navigate to the correct directory.

```
cd e2e
```

Then the below runs all tests

```
npx playwright test
```

To run an individual test (test name can be used to filter for example)

```
npx playwright test -g "should show error for invalid login"
```

To see the results

```
npx playwright show-report
```

## How is it configured?

The Playwright tests are configured using the `playwright.config.ts` file located in the `e2e` directory. This file sets up the test environment, including:

- **Base URL:**  
  The application URL is set to match the local Docker environment, ensuring tests run against the correct instance.
- **Test Directory:**  
  All test files are located in the `e2e/tests` folder.
- **Steps sub-directory**
  `e2e/tests/steps` can be used to define common steps that are reused across many tests (which can then be referenced in one line in tests, keeps tests cleaner)
- **Timeouts and Retries:**  
  Global timeout and retry settings are specified to handle flaky tests and slow responses.
- **Reporter:**  
  The configuration uses the HTML reporter for visual test results (`npx playwright show-report`).
- **Fixtures:**  
  Custom fixtures are defined in `e2e/fixtures.ts` to handle common setup tasks, such as user authentication, test data creation, and cleanup.  
  Fixtures ensure each test starts with a consistent state and can include:
  - Logging in before tests (as admin / non-admin user)
  - Cleaning up after tests
- **Utilities:**  
  Utilities such as screenshot capture (`takeScreenshot`) are enabled for debugging failed tests as well as validating successful tests.
  Helper functions in `e2e/utils.ts` provide reusable actions including creating test users, logging a user in.

## Extending Functionality: Adding New Tests

To add new tests:

1. **Create a new test file:**  
   Place it in the `e2e/tests` directory, following the naming convention (`*.spec.ts`).
2. **Use fixtures and utilities:**  
   Import and use existing fixtures for setup/teardown, and leverage utility functions for common actions.
3. **Write assertions:**  
   Use Playwright’s built-in expect API for reliable assertions.

### Using Fixtures for Authenticated Sessions

Custom fixtures are provided to simplify tests that require users to be signed in as either an admin or a non-admin.  
For example, in your test files, you can access `authenticatedAdminPage` and `authenticatedNonAdminPage` directly in the test arguments:

```typescript
test("should approve an application as admin", async ({
  authenticatedAdminPage,
  authenticatedNonAdminPage,
}, testInfo) => {
  // authenticatedAdminPage is already signed in as an admin
  // authenticatedNonAdminPage is already signed in as a regular user
  // ...test steps...
});
```

This means you do **not** need to manually perform login steps in each test.  
The fixtures handle authentication and session setup automatically, making your tests cleaner and more focused on the actual user flows.
